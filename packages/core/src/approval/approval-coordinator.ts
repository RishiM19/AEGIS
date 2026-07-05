/**
 * Approval Coordinator (SPEC-011).
 *
 * Routes L1/L2 decisions (and Recovery's DEFER_TO_HUMAN) to a human,
 * captures a typed decision, and binds it to the exact action
 * fingerprint it was shown.
 *
 * Enforced invariants:
 *  - APR-INV-001  approval binds to an exact fingerprint
 *  - APR-INV-002  approval satisfies a precondition; it is not authority
 *  - APR-INV-003  decision type is a closed eight-value enumeration
 *  - APR-INV-005  expiry is enforced; late decisions never satisfy
 *  - APR-INV-006  exactly one decision of record
 *  - APR-INV-007  EMERGENCY_STOP jumps the queue, never the record
 */

import type { Clock, IdSource } from "../kernel/clock.js";
import type { EventLedger } from "../ledger/event-ledger.js";

const COMPONENT = "approval-coordinator";
const VERSIONS = { approvalCoordinator: "1.0.0" };

export type ApprovalDecisionType =
  | "APPROVED_WITHOUT_CHANGE"
  | "APPROVED_WITH_MODIFICATION"
  | "REJECTED"
  | "REQUESTED_MORE_EVIDENCE"
  | "EXECUTED_MANUALLY"
  | "CORRECTED_AGENT_DECISION"
  | "OVERRULED_AEGIS"
  | "EMERGENCY_STOP";

const DECISION_TYPES: ReadonlySet<string> = new Set([
  "APPROVED_WITHOUT_CHANGE",
  "APPROVED_WITH_MODIFICATION",
  "REJECTED",
  "REQUESTED_MORE_EVIDENCE",
  "EXECUTED_MANUALLY",
  "CORRECTED_AGENT_DECISION",
  "OVERRULED_AEGIS",
  "EMERGENCY_STOP",
]);

export type ApprovalQueue = "STANDARD" | "ELEVATED";

export interface ApprovalRequest {
  approvalRequestId: string;
  subjectType: "ACTION" | "RECOVERY_PLAN";
  subjectId: string;
  subjectFingerprint: string;
  routingQueue: ApprovalQueue;
  tenantId: string;
  createdAt: string;
  expiresAt: string;
  status: "PENDING" | "DECIDED" | "EXPIRED" | "WITHDRAWN";
}

export interface ApprovalDecision {
  approvalDecisionId: string;
  approvalRequestId: string;
  decisionType: ApprovalDecisionType;
  decidingPrincipalId: string;
  rationale: string | null;
  decidedAt: string;
  /** False when recorded after expiry: audit-only, never satisfying (APR-INV-005). */
  satisfiesPrecondition: boolean;
}

export class AlreadyDecided extends Error {
  constructor(requestId: string) {
    super(`approval request "${requestId}" already has a decision of record (APR-INV-006)`);
    this.name = "AlreadyDecided";
  }
}

export class UnauthorizedQueueAccess extends Error {
  constructor(principal: string, queue: ApprovalQueue) {
    super(`principal "${principal}" is not authorized for the ${queue} queue`);
    this.name = "UnauthorizedQueueAccess";
  }
}

export class ApprovalCoordinator {
  private requests = new Map<string, ApprovalRequest>();
  private decisions = new Map<string, ApprovalDecision>(); // by requestId
  private queueAccess = new Map<ApprovalQueue, Set<string>>([
    ["STANDARD", new Set()],
    ["ELEVATED", new Set()],
  ]);

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly ledger: EventLedger,
    private readonly requestValiditySeconds: number = 3600,
  ) {}

  grantQueueAccess(principalId: string, queue: ApprovalQueue): void {
    this.queueAccess.get(queue)!.add(principalId);
  }

  /**
   * Deterministic routing (SPEC-011 SS7): high-consequence subjects go
   * to the elevated queue; routing failure would be a hard block, but
   * both queues always exist structurally in V1.
   */
  createRequest(input: {
    subjectType: ApprovalRequest["subjectType"];
    subjectId: string;
    subjectFingerprint: string;
    highConsequence: boolean;
    tenantId: string;
  }): ApprovalRequest {
    const now = this.clock.now();
    const request: ApprovalRequest = {
      approvalRequestId: this.ids.next("apr"),
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      subjectFingerprint: input.subjectFingerprint,
      routingQueue: input.highConsequence ? "ELEVATED" : "STANDARD",
      tenantId: input.tenantId,
      createdAt: now,
      expiresAt: new Date(Date.parse(now) + this.requestValiditySeconds * 1000).toISOString(),
      status: "PENDING",
    };
    this.requests.set(request.approvalRequestId, request);
    this.emit(request, "APPROVAL_REQUEST_CREATED", { queue: request.routingQueue });
    return request;
  }

  /**
   * Records the single decision of record. EMERGENCY_STOP bypasses
   * queue-authorization ordering pressure but never the record itself
   * (APR-INV-007): it still requires an authenticated principal and is
   * fully audited.
   */
  decide(
    approvalRequestId: string,
    decisionType: ApprovalDecisionType,
    decidingPrincipalId: string,
    rationale: string | null = null,
  ): ApprovalDecision {
    if (!DECISION_TYPES.has(decisionType)) {
      throw new Error(`"${decisionType}" is not one of the eight closed decision types (APR-INV-003)`);
    }
    const request = this.requests.get(approvalRequestId);
    if (!request) throw new Error(`unknown approval request "${approvalRequestId}"`);
    if (this.decisions.has(approvalRequestId)) throw new AlreadyDecided(approvalRequestId);
    if (request.status === "WITHDRAWN") {
      throw new Error(
        `approval request "${approvalRequestId}" was withdrawn (stale fingerprint); the action must be re-submitted (APR-INV-001)`,
      );
    }

    // Queue authorization: elevated queues require elevated principals.
    // EMERGENCY_STOP may come from any principal with any queue access.
    if (decisionType !== "EMERGENCY_STOP") {
      const allowed = this.queueAccess.get(request.routingQueue)!;
      if (!allowed.has(decidingPrincipalId)) throw new UnauthorizedQueueAccess(decidingPrincipalId, request.routingQueue);
    }

    const now = this.clock.now();
    const expired = request.expiresAt < now;
    const decision: ApprovalDecision = {
      approvalDecisionId: this.ids.next("aprdec"),
      approvalRequestId,
      decisionType,
      decidingPrincipalId,
      rationale,
      decidedAt: now,
      satisfiesPrecondition: !expired,
    };
    this.decisions.set(approvalRequestId, decision);
    request.status = expired ? "EXPIRED" : "DECIDED";
    this.emit(request, expired ? "APPROVAL_DECISION_REJECTED_STALE" : "APPROVAL_DECISION_RECORDED", {
      decisionType,
      decidingPrincipalId,
    });
    return decision;
  }

  /**
   * The gateway's EXE-INV-013 input: returns the fingerprint the
   * approval satisfies, or null. Approval is a satisfied precondition,
   * never authority (APR-INV-002) -- the grant is still fully verified.
   */
  satisfiedFingerprint(approvalRequestId: string): string | null {
    const request = this.requests.get(approvalRequestId);
    const decision = this.decisions.get(approvalRequestId);
    if (!request || !decision || !decision.satisfiesPrecondition) return null;
    const approving =
      decision.decisionType === "APPROVED_WITHOUT_CHANGE" || decision.decisionType === "APPROVED_WITH_MODIFICATION";
    return approving ? request.subjectFingerprint : null;
  }

  /**
   * APR-INV-001/APR-INV-004: a material modification invalidates any
   * pending request bound to the old fingerprint; the action must be
   * re-submitted as a new request against the new fingerprint.
   */
  invalidateForFingerprintChange(oldFingerprint: string): number {
    let invalidated = 0;
    for (const request of this.requests.values()) {
      if (request.status === "PENDING" && request.subjectFingerprint === oldFingerprint) {
        request.status = "WITHDRAWN";
        this.emit(request, "APPROVAL_REQUEST_WITHDRAWN_STALE_FINGERPRINT", {});
        invalidated += 1;
      }
    }
    return invalidated;
  }

  getRequest(approvalRequestId: string): ApprovalRequest | undefined {
    return this.requests.get(approvalRequestId);
  }

  private emit(request: ApprovalRequest, eventType: string, payload: Record<string, unknown>): void {
    this.ledger.append({
      eventType,
      owningSpec: "SPEC-011",
      subjectIds: [request.approvalRequestId, request.subjectId],
      payload,
      tenantId: request.tenantId,
      versionsInEffect: VERSIONS,
      sourceComponent: COMPONENT,
    });
  }
}
