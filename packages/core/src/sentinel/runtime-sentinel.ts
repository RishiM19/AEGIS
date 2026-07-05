/**
 * Runtime Sentinel (SPEC-009).
 *
 * Continuous runtime governance after execution begins: observe
 * independently, detect, intervene, verify containment.
 *
 * Enforced invariants (V1 subset):
 *  - MON-INV-001  required monitoring exists before execution
 *                 (readiness token consumed by the gateway)
 *  - MON-INV-002  signals carry their source; agent self-reports are
 *                 rejected for critical signals
 *  - MON-INV-003/004/013  freshness required; blindness is a runtime
 *                 event and maps to R_UNKNOWN, never to lower risk
 *  - MON-INV-005  hard invariant violations override statistics
 *  - MON-INV-008  interventions only reduce authority
 *  - MON-INV-009  a failed intervention escalates
 *  - MON-INV-010  every path here is deterministic; no model calls
 *  - MON-INV-014  aggregate exposure is first-class
 *  - MON-INV-016  intervention effectiveness independently verified
 *  - MON-INV-025  runtime evidence is append-only (via the ledger)
 */

import type { Clock, IdSource } from "../kernel/clock.js";
import type { EventLedger } from "../ledger/event-ledger.js";
import type { AutonomyGrant } from "../autonomy/decision-engine.js";

const COMPONENT = "runtime-sentinel";
const VERSIONS = { runtimeSentinel: "1.0.0" };

// ------------------------------------------------------------------ signals

export interface SignalRequirement {
  signalId: string;
  maxAgeMs: number;
  /** Sources allowed to feed this signal; "agent" is never one (MON-INV-002). */
  trustedSources: string[];
}

export interface SignalReading {
  signalId: string;
  value: number;
  observedAt: string;
  source: string;
}

// ---------------------------------------------------------------- detection

export type RuntimeRiskState = "R0_NORMAL" | "R1_ELEVATED" | "R2_CONCERNING" | "R3_DANGEROUS" | "R4_CRITICAL" | "R_UNKNOWN";

export interface HardInvariantRule {
  ruleId: string;
  signalId: string;
  /** Violated when the signal value exceeds this bound. */
  maxValue: number;
}

export interface ThresholdRule {
  ruleId: string;
  signalId: string;
  elevatedAt: number;
  concerningAt: number;
  dangerousAt: number;
}

export interface RuntimeFinding {
  findingId: string;
  kind: "MONITORING_BLINDNESS" | "HARD_INVARIANT_VIOLATION" | "THRESHOLD_EXCEEDED" | "AGGREGATE_EXPOSURE";
  detail: string;
  impliedRisk: RuntimeRiskState;
}

export interface MonitoringContext {
  contextId: string;
  grantId: string;
  tenantId: string;
  requirements: SignalRequirement[];
  readings: Map<string, SignalReading>;
  ready: boolean;
}

// ------------------------------------------------------------- intervention

export type InterventionClass = "I0" | "I1" | "I2" | "I3" | "I4" | "I5" | "I6" | "I7" | "I8" | "I9";

const ESCALATION_ORDER: InterventionClass[] = ["I0", "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9"];

export interface InterventionCommand {
  commandId: string;
  contextId: string;
  interventionClass: InterventionClass;
  reason: string;
  issuedAt: string;
}

export interface InterventionReceipt {
  receiptId: string;
  commandId: string;
  result: "EFFECTIVE" | "INEFFECTIVE" | "UNKNOWN";
  verificationSource: string;
  verifiedAt: string;
}

/** Risk state -> minimum intervention class (SPEC-009 intervention policy). */
const DEFAULT_INTERVENTION_POLICY: Record<RuntimeRiskState, InterventionClass> = {
  R0_NORMAL: "I0",
  R1_ELEVATED: "I1",
  R2_CONCERNING: "I2",
  R3_DANGEROUS: "I4",
  R4_CRITICAL: "I6",
  R_UNKNOWN: "I4", // missing data is not safe data: pause, don't observe
};

const RISK_ORDER: RuntimeRiskState[] = ["R0_NORMAL", "R1_ELEVATED", "R2_CONCERNING", "R3_DANGEROUS", "R4_CRITICAL", "R_UNKNOWN"];

function maxRisk(a: RuntimeRiskState, b: RuntimeRiskState): RuntimeRiskState {
  // R_UNKNOWN dominates everything below R4: unknown is treated at
  // least as seriously as dangerous, and hard R4 still dominates.
  if (a === "R4_CRITICAL" || b === "R4_CRITICAL") return "R4_CRITICAL";
  return RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;
}

export class RuntimeSentinel {
  private contexts = new Map<string, MonitoringContext>();
  private commands = new Map<string, InterventionCommand>();
  private escalated = new Map<string, InterventionClass>();

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly ledger: EventLedger,
    private readonly hardInvariants: HardInvariantRule[],
    private readonly thresholds: ThresholdRule[],
  ) {}

  /** MON-INV-001: creates the context whose readiness the gateway checks. */
  createContext(grantId: string, tenantId: string, requirements: SignalRequirement[]): MonitoringContext {
    const context: MonitoringContext = {
      contextId: this.ids.next("monctx"),
      grantId,
      tenantId,
      requirements,
      readings: new Map(),
      ready: false,
    };
    this.contexts.set(context.contextId, context);
    return context;
  }

  /** Rejects untrusted sources outright for required signals (MON-INV-002). */
  ingest(contextId: string, reading: SignalReading): void {
    const context = this.mustGet(contextId);
    const requirement = context.requirements.find((r) => r.signalId === reading.signalId);
    if (requirement && !requirement.trustedSources.includes(reading.source)) {
      this.emit(context, "SIGNAL_REJECTED_UNTRUSTED_SOURCE", { signalId: reading.signalId, source: reading.source });
      return;
    }
    context.readings.set(reading.signalId, reading);
    context.ready = context.requirements.every((r) => context.readings.has(r.signalId));
  }

  /** Readiness token for the gateway's EXE-INV-014 precondition. */
  isReady(contextId: string): boolean {
    return this.mustGet(contextId).ready;
  }

  /**
   * One deterministic evaluation instant: signal health, hard
   * invariants, thresholds -> findings -> risk state (MON-INV-011).
   */
  evaluate(contextId: string): { riskState: RuntimeRiskState; findings: RuntimeFinding[] } {
    const context = this.mustGet(contextId);
    const now = Date.parse(this.clock.now());
    const findings: RuntimeFinding[] = [];
    let riskState: RuntimeRiskState = "R0_NORMAL";

    // Signal health first: blindness is a finding, and it never lowers
    // risk (MON-INV-004/013).
    for (const requirement of context.requirements) {
      const reading = context.readings.get(requirement.signalId);
      const stale = reading ? now - Date.parse(reading.observedAt) > requirement.maxAgeMs : true;
      if (!reading || stale) {
        findings.push({
          findingId: this.ids.next("find"),
          kind: "MONITORING_BLINDNESS",
          detail: `required signal "${requirement.signalId}" is ${reading ? "stale" : "missing"}`,
          impliedRisk: "R_UNKNOWN",
        });
        riskState = maxRisk(riskState, "R_UNKNOWN");
      }
    }

    // Hard invariants override everything statistical (MON-INV-005).
    for (const rule of this.hardInvariants) {
      const reading = context.readings.get(rule.signalId);
      if (reading && reading.value > rule.maxValue) {
        findings.push({
          findingId: this.ids.next("find"),
          kind: "HARD_INVARIANT_VIOLATION",
          detail: `hard invariant ${rule.ruleId}: ${rule.signalId}=${reading.value} exceeds ${rule.maxValue}`,
          impliedRisk: "R4_CRITICAL",
        });
        riskState = maxRisk(riskState, "R4_CRITICAL");
      }
    }

    // Graduated thresholds (includes aggregate-exposure signals, which
    // are first-class inputs like any other: MON-INV-014).
    for (const rule of this.thresholds) {
      const reading = context.readings.get(rule.signalId);
      if (!reading) continue;
      let implied: RuntimeRiskState | null = null;
      if (reading.value >= rule.dangerousAt) implied = "R3_DANGEROUS";
      else if (reading.value >= rule.concerningAt) implied = "R2_CONCERNING";
      else if (reading.value >= rule.elevatedAt) implied = "R1_ELEVATED";
      if (implied) {
        findings.push({
          findingId: this.ids.next("find"),
          kind: rule.signalId.startsWith("aggregate") ? "AGGREGATE_EXPOSURE" : "THRESHOLD_EXCEEDED",
          detail: `${rule.signalId}=${reading.value} (elevated>=${rule.elevatedAt}, concerning>=${rule.concerningAt}, dangerous>=${rule.dangerousAt})`,
          impliedRisk: implied,
        });
        riskState = maxRisk(riskState, implied);
      }
    }

    for (const f of findings) this.emit(context, "RUNTIME_FINDING_RAISED", { kind: f.kind, detail: f.detail });
    this.emit(context, "RUNTIME_RISK_STATE_EVALUATED", { riskState });
    return { riskState, findings };
  }

  /**
   * Issues the intervention the policy demands for the current risk
   * state. Interventions may only reduce authority (MON-INV-008): the
   * only mutation available here is revocation/reduction via the
   * provided grant handle.
   */
  intervene(contextId: string, riskState: RuntimeRiskState, grant: AutonomyGrant, reason: string): InterventionCommand {
    const context = this.mustGet(contextId);
    const base = DEFAULT_INTERVENTION_POLICY[riskState];
    const escalatedFloor = this.escalated.get(contextId);
    const cls = escalatedFloor && ESCALATION_ORDER.indexOf(escalatedFloor) > ESCALATION_ORDER.indexOf(base) ? escalatedFloor : base;

    const command: InterventionCommand = {
      commandId: this.ids.next("intv"),
      contextId,
      interventionClass: cls,
      reason,
      issuedAt: this.clock.now(),
    };
    this.commands.set(command.commandId, command);

    // Authority reduction for terminal classes: cancel/terminate/
    // isolate/revoke all revoke the grant (reduction only, never
    // expansion -- MON-INV-008/019).
    if (ESCALATION_ORDER.indexOf(cls) >= ESCALATION_ORDER.indexOf("I5")) {
      grant.revoked = true;
    }
    this.emit(context, "INTERVENTION_ISSUED", { interventionClass: cls, reason });
    return command;
  }

  /**
   * STOP is not STOPPED (MON-INV-016): effectiveness comes from an
   * independent verification source, and an ineffective intervention
   * escalates the floor for the next one (MON-INV-009).
   */
  verifyContainment(
    commandId: string,
    verification: { source: string; observedStopped: boolean | null },
  ): InterventionReceipt {
    const command = this.commands.get(commandId);
    if (!command) throw new Error(`unknown intervention command "${commandId}"`);
    const context = this.mustGet(command.contextId);

    const result = verification.observedStopped === null ? "UNKNOWN" : verification.observedStopped ? "EFFECTIVE" : "INEFFECTIVE";
    const receipt: InterventionReceipt = {
      receiptId: this.ids.next("rcpt"),
      commandId,
      result,
      verificationSource: verification.source,
      verifiedAt: this.clock.now(),
    };

    if (result !== "EFFECTIVE") {
      const currentIdx = ESCALATION_ORDER.indexOf(command.interventionClass);
      const next = ESCALATION_ORDER[Math.min(currentIdx + 1, ESCALATION_ORDER.length - 1)]!;
      this.escalated.set(command.contextId, next);
      this.emit(context, "INTERVENTION_ESCALATED", { from: command.interventionClass, to: next });
    }

    this.emit(context, "CONTAINMENT_VERIFIED", { result, source: verification.source });
    return receipt;
  }

  private mustGet(contextId: string): MonitoringContext {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`unknown monitoring context "${contextId}"`);
    return context;
  }

  private emit(context: MonitoringContext, eventType: string, payload: Record<string, unknown>): void {
    this.ledger.append({
      eventType,
      owningSpec: "SPEC-009",
      subjectIds: [context.contextId, context.grantId],
      payload,
      tenantId: context.tenantId,
      versionsInEffect: VERSIONS,
      sourceComponent: COMPONENT,
    });
  }
}
