/**
 * Recovery Engine (SPEC-010).
 *
 * What happens after an action has produced -- or may have produced --
 * an undesirable real-world effect. Containment is not recovery.
 *
 * Enforced invariants:
 *  - RCV-INV-001  recovery is a governed action: compensation dispatch
 *                 goes back through the caller-provided governed
 *                 execution path, never a privileged internal one
 *  - RCV-INV-002  unknown effect status stays explicit
 *  - RCV-INV-003  recovery is not complete until independently verified
 *  - RCV-INV-004  idempotent compensation: one compensation per effect
 *  - RCV-INV-006  irreversible effects produce residual harm records
 *                 requiring human acknowledgment
 *  - RCV-INV-008  partial recovery is a first-class terminal outcome
 *  - RCV-INV-009  verification source must be independent
 *  - RCV-INV-012  strategy selection is deterministic per classification
 */

import type { Clock, IdSource } from "../kernel/clock.js";
import type { EventLedger } from "../ledger/event-ledger.js";
import type { ReversibilityClass } from "../assessment/consequence.js";

const COMPONENT = "recovery-engine";
const VERSIONS = { recoveryEngine: "1.0.0" };

export type EffectOccurrence = "TRUE" | "FALSE" | "UNKNOWN";

export interface EffectRecord {
  effectId: string;
  executionAttemptId: string;
  description: string;
  classification: ReversibilityClass;
  verifiedOccurred: EffectOccurrence;
  magnitudeMinor: number;
  tenantId: string;
}

export type RecoveryStrategy = "ROLLBACK" | "COMPENSATE" | "CONTAIN_AND_ACCEPT" | "DEFER_TO_HUMAN";

export interface RecoveryTrigger {
  triggerId: string;
  sourceType: "RUNTIME_SENTINEL_I9" | "POST_INCIDENT_DETECTION" | "MANUAL";
  sourceReferenceId: string;
  triggeredAt: string;
}

export type RecoveryVerificationResult = "FULLY_RECOVERED" | "PARTIALLY_RECOVERED" | "RECOVERY_FAILED" | "UNKNOWN";

export interface RecoveryPlan {
  recoveryPlanId: string;
  triggerId: string;
  effectIds: string[];
  strategy: RecoveryStrategy;
  requiresNewGrant: boolean;
  status: "PLANNED" | "DISPATCHED" | RecoveryVerificationResult;
  createdAt: string;
}

export interface RecoveryVerificationReceipt {
  receiptId: string;
  recoveryPlanId: string;
  verificationSource: string;
  result: RecoveryVerificationResult;
  verifiedAt: string;
  residualHarmId: string | null;
}

export interface ResidualHarmRecord {
  residualHarmId: string;
  effectId: string;
  description: string;
  estimatedMagnitudeMinor: number;
  isPermanent: boolean;
  acknowledgedBy: string | null;
}

/**
 * A governed dispatch path for a compensating action -- in production
 * this is the full CAM -> decision -> gateway pipeline (RCV-INV-001);
 * the engine only knows it as an injected function so no privileged
 * internal execution path can exist here.
 */
export type GovernedCompensationDispatch = (effect: EffectRecord) => { dispatched: boolean; reason: string };

export class DoubleCompensationRejected extends Error {
  constructor(effectId: string) {
    super(`effect "${effectId}" already has a compensation attempt; double compensation rejected (RCV-INV-004)`);
    this.name = "DoubleCompensationRejected";
  }
}

/** Deterministic strategy per classification (SPEC-010 SS6, RCV-INV-012). */
export function selectStrategy(classification: ReversibilityClass): RecoveryStrategy {
  switch (classification) {
    case "FULLY_REVERSIBLE":
    case "OPERATIONALLY_REVERSIBLE":
      return "ROLLBACK";
    case "COMPENSATABLE":
    case "PARTIALLY_REVERSIBLE":
      return "COMPENSATE";
    case "PRACTICALLY_IRREVERSIBLE":
    case "FUNDAMENTALLY_IRREVERSIBLE":
      return "CONTAIN_AND_ACCEPT";
    case "UNKNOWN":
      return "DEFER_TO_HUMAN";
  }
}

export class RecoveryEngine {
  private effects = new Map<string, EffectRecord>();
  private plans = new Map<string, RecoveryPlan>();
  private compensatedEffects = new Set<string>();
  private residualHarms = new Map<string, ResidualHarmRecord>();
  private verificationHistory: Array<{ classification: ReversibilityClass; result: RecoveryVerificationResult }> = [];

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly ledger: EventLedger,
  ) {}

  trigger(sourceType: RecoveryTrigger["sourceType"], sourceReferenceId: string, tenantId: string): RecoveryTrigger {
    const trigger: RecoveryTrigger = {
      triggerId: this.ids.next("rtrig"),
      sourceType,
      sourceReferenceId,
      triggeredAt: this.clock.now(),
    };
    this.emit(tenantId, "RECOVERY_TRIGGER_RECEIVED", [trigger.triggerId, sourceReferenceId], { sourceType });
    return trigger;
  }

  recordEffect(effect: EffectRecord): EffectRecord {
    this.effects.set(effect.effectId, effect);
    this.emit(effect.tenantId, "EFFECT_CLASSIFIED", [effect.effectId, effect.executionAttemptId], {
      classification: effect.classification,
      verifiedOccurred: effect.verifiedOccurred,
    });
    return effect;
  }

  /**
   * Builds the plan for a set of effects. Effects whose occurrence is
   * UNKNOWN defer to a human rather than guessing (RCV-INV-002).
   */
  plan(trigger: RecoveryTrigger, effectIds: string[], tenantId: string): RecoveryPlan {
    const effects = effectIds.map((id) => this.mustGetEffect(id));
    const strategies = new Set(
      effects.map((e) => (e.verifiedOccurred === "UNKNOWN" ? "DEFER_TO_HUMAN" : selectStrategy(e.classification))),
    );
    // A mixed-strategy effect set defers to a human coordinator rather
    // than partially automating (SPEC-010 SS11: don't guess an ordering).
    const strategy: RecoveryStrategy = strategies.size === 1 ? [...strategies][0]! : "DEFER_TO_HUMAN";

    const plan: RecoveryPlan = {
      recoveryPlanId: this.ids.next("rplan"),
      triggerId: trigger.triggerId,
      effectIds,
      strategy,
      requiresNewGrant: strategy === "ROLLBACK" || strategy === "COMPENSATE",
      status: "PLANNED",
      createdAt: this.clock.now(),
    };
    this.plans.set(plan.recoveryPlanId, plan);
    this.emit(tenantId, "RECOVERY_PLAN_CREATED", [plan.recoveryPlanId, trigger.triggerId], { strategy });

    // Irreversible effects immediately produce residual harm records
    // pending human acknowledgment (RCV-INV-006).
    if (strategy === "CONTAIN_AND_ACCEPT") {
      for (const effect of effects) {
        const harm: ResidualHarmRecord = {
          residualHarmId: this.ids.next("harm"),
          effectId: effect.effectId,
          description: effect.description,
          estimatedMagnitudeMinor: effect.magnitudeMinor,
          isPermanent: effect.classification === "FUNDAMENTALLY_IRREVERSIBLE",
          acknowledgedBy: null,
        };
        this.residualHarms.set(harm.residualHarmId, harm);
        this.emit(tenantId, "RESIDUAL_HARM_RECORDED", [harm.residualHarmId, effect.effectId], {
          magnitudeMinor: harm.estimatedMagnitudeMinor,
        });
      }
    }
    return plan;
  }

  /**
   * Dispatches compensation through the injected governed path
   * (RCV-INV-001) with idempotency checking per effect (RCV-INV-004).
   */
  dispatchCompensation(recoveryPlanId: string, dispatch: GovernedCompensationDispatch, tenantId: string): void {
    const plan = this.mustGetPlan(recoveryPlanId);
    if (plan.strategy !== "COMPENSATE" && plan.strategy !== "ROLLBACK") {
      throw new Error(`plan ${recoveryPlanId} strategy is ${plan.strategy}; nothing to dispatch`);
    }
    for (const effectId of plan.effectIds) {
      if (this.compensatedEffects.has(effectId)) throw new DoubleCompensationRejected(effectId);
    }
    for (const effectId of plan.effectIds) {
      const effect = this.mustGetEffect(effectId);
      const result = dispatch(effect);
      if (!result.dispatched) {
        plan.status = "RECOVERY_FAILED";
        this.emit(tenantId, "RECOVERY_FAILED", [recoveryPlanId, effectId], { reason: result.reason });
        return;
      }
      this.compensatedEffects.add(effectId);
      this.emit(tenantId, "COMPENSATING_ACTION_DISPATCHED", [recoveryPlanId, effectId], {});
    }
    plan.status = "DISPATCHED";
  }

  /**
   * Recovery completes only via independent verification (RCV-INV-003/009).
   * The engine records the receipt verbatim; UNKNOWN keeps the plan open.
   */
  verify(
    recoveryPlanId: string,
    verification: { source: string; sourceIsIndependent: boolean; observedResult: RecoveryVerificationResult },
    tenantId: string,
  ): RecoveryVerificationReceipt {
    const plan = this.mustGetPlan(recoveryPlanId);
    if (!verification.sourceIsIndependent) {
      throw new Error(`verification source "${verification.source}" is not independent of the execution path (RCV-INV-009)`);
    }

    let residualHarmId: string | null = null;
    if (verification.observedResult === "PARTIALLY_RECOVERED") {
      // Partial recovery is terminal and its remainder is explicit
      // residual harm (RCV-INV-008), never rounded up.
      const firstEffect = this.mustGetEffect(plan.effectIds[0]!);
      const harm: ResidualHarmRecord = {
        residualHarmId: this.ids.next("harm"),
        effectId: firstEffect.effectId,
        description: `partial recovery remainder: ${firstEffect.description}`,
        estimatedMagnitudeMinor: firstEffect.magnitudeMinor,
        isPermanent: false,
        acknowledgedBy: null,
      };
      this.residualHarms.set(harm.residualHarmId, harm);
      residualHarmId = harm.residualHarmId;
      this.emit(tenantId, "RESIDUAL_HARM_RECORDED", [harm.residualHarmId], {});
    }

    plan.status = verification.observedResult === "UNKNOWN" ? "DISPATCHED" : verification.observedResult;

    const receipt: RecoveryVerificationReceipt = {
      receiptId: this.ids.next("rrcpt"),
      recoveryPlanId,
      verificationSource: verification.source,
      result: verification.observedResult,
      verifiedAt: this.clock.now(),
      residualHarmId,
    };
    for (const effectId of plan.effectIds) {
      this.verificationHistory.push({
        classification: this.mustGetEffect(effectId).classification,
        result: verification.observedResult,
      });
    }
    this.emit(tenantId, verification.observedResult === "RECOVERY_FAILED" ? "RECOVERY_FAILED" : "RECOVERY_VERIFIED", [recoveryPlanId], {
      result: verification.observedResult,
    });
    return receipt;
  }

  acknowledgeResidualHarm(residualHarmId: string, acknowledgedBy: string): ResidualHarmRecord {
    const harm = this.residualHarms.get(residualHarmId);
    if (!harm) throw new Error(`unknown residual harm "${residualHarmId}"`);
    harm.acknowledgedBy = acknowledgedBy;
    return harm;
  }

  unacknowledgedHarms(): ResidualHarmRecord[] {
    return [...this.residualHarms.values()].filter((h) => h.acknowledgedBy === null);
  }

  /**
   * Recoverability per effect class (SPEC-010 SS8): demonstrated via
   * verified receipts, never claimed. Feeds SPEC-007's
   * verifiedRecoveryCapability input (AUT-INV-010).
   */
  verifiedRecoveryCapability(classification: ReversibilityClass): boolean {
    const relevant = this.verificationHistory.filter((v) => v.classification === classification);
    if (relevant.length === 0) return false;
    return relevant.every((v) => v.result === "FULLY_RECOVERED");
  }

  getPlan(recoveryPlanId: string): RecoveryPlan | undefined {
    return this.plans.get(recoveryPlanId);
  }

  private mustGetEffect(effectId: string): EffectRecord {
    const effect = this.effects.get(effectId);
    if (!effect) throw new Error(`unknown effect "${effectId}"`);
    return effect;
  }

  private mustGetPlan(recoveryPlanId: string): RecoveryPlan {
    const plan = this.plans.get(recoveryPlanId);
    if (!plan) throw new Error(`unknown recovery plan "${recoveryPlanId}"`);
    return plan;
  }

  private emit(tenantId: string, eventType: string, subjectIds: string[], payload: Record<string, unknown>): void {
    this.ledger.append({
      eventType,
      owningSpec: "SPEC-010",
      subjectIds,
      payload,
      tenantId,
      versionsInEffect: VERSIONS,
      sourceComponent: COMPONENT,
    });
  }
}
