/**
 * Execution Gateway (SPEC-008).
 *
 * The single enforcement boundary between granted authority and the
 * real world: ExecutedAction must be a subset of GrantedAuthority.
 *
 * Enforced invariants (subset most relevant to V1):
 *  - EXE-INV-001/002  complete mediation; no execution without authority
 *  - EXE-INV-004/005  scope cannot expand; material mutation invalidates
 *  - EXE-INV-008/009/010/011  expiry/exhaustion/single-use/atomicity
 *  - EXE-INV-013/014/015  approval, monitoring, recovery preconditions
 *  - EXE-INV-016/017  independent of agent honesty
 *  - EXE-INV-018/019  responses verbatim; partial is never "nothing"
 *  - EXE-INV-020      every attempt produces an audit event
 *  - EXE-INV-021      fail closed
 *  - EXE-INV-022      retry never duplicates side effects
 *  - EXE-INV-024      credentials never reach the agent
 */

import type { CanonicalAction } from "@aegis/contracts";
import type { Clock, IdSource } from "../kernel/clock.js";
import type { EventLedger } from "../ledger/event-ledger.js";
import type { AgentRegistry } from "../agents/agent-registry.js";
import type { AutonomyGrant } from "../autonomy/decision-engine.js";
import { CredentialLeaseManager, ToolAdapterLayer, type ExternalResponse } from "./enablement.js";

const COMPONENT = "execution-gateway";
const VERSIONS = { executionGateway: "1.0.0" };

export type ExecutionOutcomeStatus = "SUCCEEDED" | "FAILED" | "UNKNOWN";

export interface ExecutionAttempt {
  executionAttemptId: string;
  grantId: string;
  actionId: string;
  materialFingerprint: string;
  idempotencyKey: string;
  startedAt: string;
  completedAt: string | null;
  outcomeStatus: ExecutionOutcomeStatus | null;
  externalResponse: ExternalResponse | null;
}

export interface ExecutionRequest {
  action: CanonicalAction;
  grant: AutonomyGrant;
  runtimeInstanceId: string;
  presentedCredential: string;
  /** Approval satisfied for this exact fingerprint (SPEC-011 output). */
  approvalSatisfiedForFingerprint: string | null;
  /** Monitoring context live and ready (SPEC-009 readiness token). */
  monitoringReady: boolean;
  /** Recovery capability verified for this effect class (SPEC-010). */
  recoveryReady: boolean;
}

export class ExecutionRejected extends Error {
  constructor(
    public readonly invariant: string,
    message: string,
  ) {
    super(`[${invariant}] ${message}`);
    this.name = "ExecutionRejected";
  }
}

export class ExecutionGateway {
  private attempts = new Map<string, ExecutionAttempt>();
  private byIdempotencyKey = new Map<string, ExecutionAttempt>();

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly ledger: EventLedger,
    private readonly agents: AgentRegistry,
    private readonly adapters: ToolAdapterLayer,
    private readonly leases: CredentialLeaseManager,
  ) {}

  execute(request: ExecutionRequest): ExecutionAttempt {
    const { action, grant } = request;
    const now = this.clock.now();

    // Retry safety first: an identical retry of an attempt that already
    // dispatched returns the recorded attempt instead of re-executing
    // (EXE-INV-022).
    const idempotencyKey = `${grant.grantId}:${action.integrity.materialFingerprint}`;
    const priorAttempt = this.byIdempotencyKey.get(idempotencyKey);
    if (priorAttempt) return priorAttempt;

    // 1. Identity: verified instance, agent matches grant, agent ACTIVE.
    //    Agent-supplied claims are not trusted (EXE-INV-016/017).
    const identity = this.agents.resolveVerifiedIdentity(request.runtimeInstanceId, request.presentedCredential);
    if (identity.agent.agentId !== grant.agentId) {
      throw this.reject(grant, action, "EXE-INV-002", `verified agent "${identity.agent.agentId}" does not own grant "${grant.grantId}"`);
    }
    if (identity.agent.lifecycleState !== "ACTIVE") {
      throw this.reject(grant, action, "EXE-INV-002", `agent lifecycle state is ${identity.agent.lifecycleState}`);
    }

    // 2. Grant validity (EXE-INV-003/008/009).
    if (grant.revoked) throw this.reject(grant, action, "EXE-INV-002", "grant is revoked");
    if (grant.expiresAt < now) throw this.reject(grant, action, "EXE-INV-008", "grant is expired");
    if (grant.executionsUsed >= grant.maxExecutions) {
      throw this.reject(grant, action, "EXE-INV-009", "grant execution count is exhausted");
    }

    // 3. Exact action identity: the material fingerprint must match the
    //    one the grant was issued against (EXE-INV-004/005).
    if (action.integrity.materialFingerprint !== grant.materialFingerprint) {
      throw this.reject(grant, action, "EXE-INV-005", "action was materially mutated after the grant was issued; authority is invalidated");
    }
    if (action.operation.tool.toolId !== grant.allowedToolId) {
      throw this.reject(grant, action, "EXE-INV-004", `tool "${action.operation.tool.toolId}" is outside grant scope`);
    }
    if (action.context.environment.environmentType !== grant.allowedEnvironment) {
      throw this.reject(grant, action, "EXE-INV-004", `environment "${action.context.environment.environmentType}" is outside grant scope`);
    }

    // 4. Preconditions (EXE-INV-013/014/015): fail closed, never assumed.
    if (grant.approvalRequired && request.approvalSatisfiedForFingerprint !== action.integrity.materialFingerprint) {
      throw this.reject(grant, action, "EXE-INV-013", "required approval is missing or bound to a different action fingerprint");
    }
    if (grant.monitoringRequired && !request.monitoringReady) {
      throw this.reject(grant, action, "EXE-INV-014", "required monitoring is not ready; execution may not begin");
    }
    if (grant.recoveryRequired && !request.recoveryReady) {
      throw this.reject(grant, action, "EXE-INV-015", "required recovery capability is not verified; execution may not begin");
    }

    // 5. Atomic grant consumption before dispatch (EXE-INV-010/011).
    grant.executionsUsed += 1;

    const attempt: ExecutionAttempt = {
      executionAttemptId: this.ids.next("exec"),
      grantId: grant.grantId,
      actionId: action.identity.actionId,
      materialFingerprint: action.integrity.materialFingerprint,
      idempotencyKey,
      startedAt: now,
      completedAt: null,
      outcomeStatus: null,
      externalResponse: null,
    };
    this.attempts.set(attempt.executionAttemptId, attempt);
    this.byIdempotencyKey.set(idempotencyKey, attempt);
    this.emit(grant.tenantId, "EXECUTION_STARTED", [action.identity.actionId, grant.grantId, attempt.executionAttemptId], {});

    // 6. Credential lease scoped to this attempt; the lease handle never
    //    reaches the agent (EXE-INV-024) -- it flows only into the
    //    adapter layer.
    const lease = this.leases.issue(attempt.executionAttemptId, grant);

    // 7. Dispatch and reconcile. External failure after dispatch is a
    //    recorded outcome, never an unwind of the attempt (EXE-INV-019).
    let response: ExternalResponse;
    try {
      response = this.adapters.invoke(action, grant, lease, this.leases);
    } catch (err) {
      // Rejected before any external side effect: the adapter refused
      // the call at its own boundary. Attempt records the refusal.
      attempt.completedAt = this.clock.now();
      attempt.outcomeStatus = "FAILED";
      attempt.externalResponse = { status: "FAILED", raw: { rejectedBeforeDispatch: String(err) }, externalReferenceId: null };
      this.leases.revoke(lease.leaseId);
      this.emit(grant.tenantId, "EXECUTION_COMPLETED", [action.identity.actionId, attempt.executionAttemptId], { outcome: "FAILED" });
      return attempt;
    }

    attempt.completedAt = this.clock.now();
    attempt.externalResponse = response; // verbatim (EXE-INV-018)
    attempt.outcomeStatus = reconcile(response);
    this.leases.revoke(lease.leaseId);
    this.emit(grant.tenantId, "SIDE_EFFECT_OBSERVED", [action.identity.actionId, attempt.executionAttemptId], {
      externalStatus: response.status,
    });
    this.emit(grant.tenantId, "EXECUTION_COMPLETED", [action.identity.actionId, attempt.executionAttemptId], {
      outcome: attempt.outcomeStatus,
    });
    return attempt;
  }

  getAttempt(executionAttemptId: string): ExecutionAttempt | undefined {
    return this.attempts.get(executionAttemptId);
  }

  private reject(grant: AutonomyGrant, action: CanonicalAction, invariant: string, message: string): ExecutionRejected {
    // Every rejected attempt is still an audit event (EXE-INV-020).
    this.emit(grant.tenantId, "EXECUTION_REJECTED", [action.identity.actionId, grant.grantId], { invariant, message });
    return new ExecutionRejected(invariant, message);
  }

  private emit(tenantId: string, eventType: string, subjectIds: string[], payload: Record<string, unknown>): void {
    this.ledger.append({
      eventType,
      owningSpec: "SPEC-008",
      subjectIds,
      payload,
      tenantId,
      versionsInEffect: VERSIONS,
      sourceComponent: COMPONENT,
    });
  }
}

/**
 * Maps the external system's verbatim answer to the execution outcome.
 * TIMEOUT/AMBIGUOUS is UNKNOWN, never optimistically SUCCEEDED and
 * never pessimistically FAILED (SPEC-000 SS16.4: mark unresolved,
 * prevent unsafe duplicate retry).
 */
function reconcile(response: ExternalResponse): ExecutionOutcomeStatus {
  switch (response.status) {
    case "SUCCEEDED":
      return "SUCCEEDED";
    case "FAILED":
      return "FAILED";
    case "TIMEOUT":
    case "AMBIGUOUS":
      return "UNKNOWN";
  }
}
