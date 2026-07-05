/**
 * Adaptive Autonomy Decision and Granting Engine (SPEC-007).
 *
 * Converts a Canonical Action plus the four assessments plus delegated
 * authority plus policy into an explicit autonomy level and a bounded,
 * machine-verifiable Autonomy Grant.
 *
 * Enforced invariants:
 *  - SPEC-000 INV-001  no competence-created authority: no delegation -> L0
 *  - AUT-INV-001/002/003  action-scoped, context-specific, time-bound
 *  - AUT-INV-005..008  no unfavorable factor is ever averaged away:
 *                      the final level is the strict minimum of ceilings
 *  - AUT-INV-009/010   verified guardrails/recovery may raise the
 *                      consequence ceiling by one level, never past a
 *                      hard blocker
 *  - AUT-INV-013       critical blockers survive aggregation
 *  - AUT-INV-016/017   the grant is enforceable and matches the decision
 *  - AUT-INV-018       reproducible
 *  - SS26-29           policy scope, precedence, conflict resolution
 */

import type { CanonicalAction } from "@aegis/contracts";
import type { Clock, IdSource } from "../kernel/clock.js";
import type { AutonomyLevel } from "../assessment/levels.js";
import { LEVEL_NAMES, minLevel } from "../assessment/levels.js";
import type { CompetenceAssessment } from "../assessment/competence.js";
import type { NoveltyAssessment } from "../assessment/novelty.js";
import type { EpistemicAssessment } from "../assessment/epistemic.js";
import type { ConsequenceAssessment } from "../assessment/consequence.js";

export const AUTONOMY_ALGORITHM_VERSION = "autonomy-v1";

// ---------------------------------------------------------------- authority

/** Delegated authority (SPEC-000 SS8.5). Authority precedes autonomy. */
export interface Delegation {
  delegationId: string;
  principalId: string;
  delegateAgentId: string;
  capability: string; // must match action.operation.capability exactly
  maxAmountMinor: number | null;
  environmentTypes: string[];
  validFrom: string;
  validUntil: string;
  maxAutonomy: AutonomyLevel;
  revoked: boolean;
}

// ------------------------------------------------------------------- policy

export interface AutonomyPolicy {
  policyId: string;
  /** GLOBAL < tenant < domain-specific: higher = more specific (SS28). */
  scope: { kind: "GLOBAL" } | { kind: "TENANT"; tenantId: string } | { kind: "DOMAIN"; domain: string };
  /** null entries leave the dimension unconstrained. */
  forbiddenActionTypes: string[];
  maxAutonomy: AutonomyLevel | null;
  maxAmountMinor: number | null;
  requireApprovalAboveMinor: number | null;
}

function policyPrecedence(p: AutonomyPolicy): number {
  switch (p.scope.kind) {
    case "GLOBAL":
      return 0;
    case "TENANT":
      return 1;
    case "DOMAIN":
      return 2;
  }
}

// ------------------------------------------------------------------- output

export interface CeilingBreakdown {
  authority: AutonomyLevel;
  competence: AutonomyLevel;
  novelty: AutonomyLevel;
  epistemic: AutonomyLevel;
  consequence: AutonomyLevel;
  policy: AutonomyLevel;
}

export interface AutonomyGrant {
  grantId: string;
  actionId: string;
  agentId: string;
  agentVersionId: string;
  tenantId: string;
  /** Exact material fingerprint this grant authorizes (AUT-INV-004). */
  materialFingerprint: string;
  level: AutonomyLevel;
  levelName: string;
  maxAmountMinor: number | null;
  allowedToolId: string;
  allowedEnvironment: string;
  issuedAt: string;
  expiresAt: string;
  maxExecutions: number;
  executionsUsed: number;
  revoked: boolean;
  /** L4 requires live monitoring before execution (EXE-INV-014). */
  monitoringRequired: boolean;
  /** L2 requires a recorded approval before execution (EXE-INV-013). */
  approvalRequired: boolean;
  /** Recovery readiness precondition (EXE-INV-015). */
  recoveryRequired: boolean;
}

export interface AutonomyDecision {
  decisionId: string;
  algorithmVersion: string;
  actionId: string;
  level: AutonomyLevel;
  levelName: string;
  ceilings: CeilingBreakdown;
  hardBlockers: string[];
  recoveryUpliftApplied: boolean;
  decidedAt: string;
  grant: AutonomyGrant | null; // null when L0
}

export interface DecisionInput {
  action: CanonicalAction;
  tenantId: string;
  agentLifecycleState: string;
  delegations: readonly Delegation[];
  policies: readonly AutonomyPolicy[];
  competence: CompetenceAssessment;
  novelty: NoveltyAssessment;
  epistemic: EpistemicAssessment;
  consequence: ConsequenceAssessment;
  /** Verified recovery capability for this effect class (SPEC-010 SS8). */
  verifiedRecoveryCapability: boolean;
  grantValiditySeconds: number;
}

export class AutonomyDecisionEngine {
  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
  ) {}

  decide(input: DecisionInput): AutonomyDecision {
    const now = this.clock.now();
    const { action } = input;
    const hardBlockers: string[] = [];

    // -- Hard blockers (SS31-32). Any blocker -> L0, no aggregation
    //    escape (AUT-INV-013).
    const delegation = this.matchDelegation(input, now, hardBlockers);
    if (input.agentLifecycleState !== "ACTIVE") {
      hardBlockers.push(`agent lifecycle state is ${input.agentLifecycleState}; only ACTIVE agents may receive autonomy`);
    }
    const applicablePolicies = this.applicablePolicies(input);
    for (const p of applicablePolicies) {
      if (p.forbiddenActionTypes.includes(action.operation.actionType)) {
        hardBlockers.push(`policy ${p.policyId} forbids action type ${action.operation.actionType}`);
      }
      if (p.maxAmountMinor !== null && monetaryOf(action) > p.maxAmountMinor) {
        hardBlockers.push(`policy ${p.policyId} caps amount at ${p.maxAmountMinor}; action requests ${monetaryOf(action)}`);
      }
    }

    // -- Ceilings. Every unfavorable dimension caps the result; no
    //    favorable dimension can compensate (AUT-INV-005..008).
    let consequenceCeiling = input.consequence.ceiling;
    let recoveryUpliftApplied = false;
    // AUT-INV-010: verified recovery capability may lift the consequence
    // ceiling by exactly one level -- and only when the effect class is
    // actually compensatable. Never lifts past irreversibility caps,
    // which assessConsequence has already baked into its ceiling for
    // irreversible classes.
    if (
      input.verifiedRecoveryCapability &&
      (input.consequence.reversibility === "COMPENSATABLE" || input.consequence.reversibility === "FULLY_REVERSIBLE" || input.consequence.reversibility === "OPERATIONALLY_REVERSIBLE")
    ) {
      consequenceCeiling = Math.min(5, consequenceCeiling + 1) as AutonomyLevel;
      recoveryUpliftApplied = true;
    }

    const policyCeiling = applicablePolicies.reduce<AutonomyLevel>((acc, p) => {
      // Conflict resolution: at any precedence, the most restrictive
      // applicable constraint wins (SS29) -- a laxer specific policy
      // cannot silently unlock what a stricter general one forbids.
      const own = p.maxAutonomy ?? 5;
      return minLevel(acc, own as AutonomyLevel);
    }, 5);

    const ceilings: CeilingBreakdown = {
      authority: delegation ? delegation.maxAutonomy : 0,
      competence: input.competence.ceiling,
      novelty: input.novelty.ceiling,
      epistemic: input.epistemic.ceiling,
      consequence: consequenceCeiling,
      policy: policyCeiling,
    };

    const level: AutonomyLevel =
      hardBlockers.length > 0
        ? 0
        : minLevel(ceilings.authority, ceilings.competence, ceilings.novelty, ceilings.epistemic, ceilings.consequence, ceilings.policy);

    // Approval floor: a policy may force approval above a threshold even
    // when ceilings would otherwise allow L3+.
    let finalLevel = level;
    if (finalLevel >= 3) {
      for (const p of applicablePolicies) {
        if (p.requireApprovalAboveMinor !== null && monetaryOf(action) > p.requireApprovalAboveMinor) {
          finalLevel = 2;
        }
      }
    }

    const grant = finalLevel === 0 ? null : this.issueGrant(input, delegation, finalLevel, now);

    return {
      decisionId: this.ids.next("dec"),
      algorithmVersion: AUTONOMY_ALGORITHM_VERSION,
      actionId: action.identity.actionId,
      level: finalLevel,
      levelName: LEVEL_NAMES[finalLevel],
      ceilings,
      hardBlockers,
      recoveryUpliftApplied,
      decidedAt: now,
      grant,
    };
  }

  private matchDelegation(input: DecisionInput, now: string, hardBlockers: string[]): Delegation | null {
    const { action } = input;
    const amount = monetaryOf(action);
    const match = input.delegations.find(
      (d) =>
        !d.revoked &&
        d.delegateAgentId === action.lineage.actor.agentId &&
        d.capability === action.operation.capability &&
        d.validFrom <= now &&
        d.validUntil >= now &&
        (d.maxAmountMinor === null || amount <= d.maxAmountMinor) &&
        d.environmentTypes.includes(action.context.environment.environmentType),
    );
    if (!match) {
      hardBlockers.push(
        `no valid delegation covers capability "${action.operation.capability}" for agent "${action.lineage.actor.agentId}" at amount ${amount} in ${action.context.environment.environmentType} (SPEC-000 INV-001)`,
      );
      return null;
    }
    return match;
  }

  private applicablePolicies(input: DecisionInput): AutonomyPolicy[] {
    return input.policies
      .filter((p) => {
        switch (p.scope.kind) {
          case "GLOBAL":
            return true;
          case "TENANT":
            return p.scope.tenantId === input.tenantId;
          case "DOMAIN":
            return input.action.operation.domain.startsWith(p.scope.domain);
        }
      })
      .sort((a, b) => policyPrecedence(a) - policyPrecedence(b));
  }

  private issueGrant(input: DecisionInput, delegation: Delegation | null, level: AutonomyLevel, now: string): AutonomyGrant {
    const { action } = input;
    const expiresAt = new Date(Date.parse(now) + input.grantValiditySeconds * 1000).toISOString();
    return {
      grantId: this.ids.next("grant"),
      actionId: action.identity.actionId,
      agentId: action.lineage.actor.agentId,
      agentVersionId: action.lineage.actor.agentVersion,
      tenantId: input.tenantId,
      materialFingerprint: action.integrity.materialFingerprint,
      level,
      levelName: LEVEL_NAMES[level],
      maxAmountMinor: delegation?.maxAmountMinor ?? null,
      allowedToolId: action.operation.tool.toolId,
      allowedEnvironment: action.context.environment.environmentType,
      issuedAt: now,
      expiresAt,
      maxExecutions: 1, // V1: single-use grants (EXE-INV-010)
      executionsUsed: 0,
      revoked: false,
      monitoringRequired: level >= 4,
      approvalRequired: level === 2,
      recoveryRequired: input.consequence.reversibility === "COMPENSATABLE" && level >= 4,
    };
  }
}

function monetaryOf(action: CanonicalAction): number {
  return action.effects.reduce((sum, e) => sum + (e.magnitude?.type === "MONETARY" ? e.magnitude.amountMinor : 0), 0);
}
