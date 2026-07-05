import { ManualClock, SequentialIds, EventLedger, RuntimeSentinel, type RuntimeRiskState, type InterventionClass } from "@aegis/core";

const TENANT_ID = "benchmark";

/**
 * A scripted, deterministic "runaway refund sequence" incident: refund
 * velocity climbs past every threshold, the Sentinel intervenes, the
 * first containment check comes back ineffective (still moving) and
 * escalates, and the second check confirms containment.
 *
 * This is a real RuntimeSentinel instance evaluating real signal
 * readings at every step -- nothing here is a scripted UI animation.
 * It replays deterministically from step 0 on every call because the
 * dashboard is stateless (no persistence yet, see issue #19); the same
 * step always reconstructs the same trace via SequentialIds.
 */
const SIGNAL_STEPS: Array<{ velocity: number; exposureMinor: number; containmentCheck?: "ineffective" | "effective" }> = [
  { velocity: 2, exposureMinor: 200000 },
  { velocity: 6, exposureMinor: 400000 },
  { velocity: 12, exposureMinor: 900000 },
  { velocity: 22, exposureMinor: 1600000 },
  { velocity: 25, exposureMinor: 2000000, containmentCheck: "ineffective" },
  { velocity: 0, exposureMinor: 2000000, containmentCheck: "effective" },
];

export const INCIDENT_MAX_STEP = SIGNAL_STEPS.length - 1;

export interface IncidentStepTrace {
  step: number;
  velocity: number;
  exposureMinor: number;
  riskState: RuntimeRiskState;
  findingKinds: string[];
  intervention: { commandId: string; interventionClass: InterventionClass; reason: string } | null;
  containment: { result: "EFFECTIVE" | "INEFFECTIVE" | "UNKNOWN"; source: string } | null;
  grantRevoked: boolean;
}

export interface IncidentRunResult {
  timeline: IncidentStepTrace[];
  maxStep: number;
  finalRiskState: RuntimeRiskState;
  finalGrantRevoked: boolean;
}

export function runIncidentUpTo(requestedStep: number): IncidentRunResult {
  const step = Math.max(0, Math.min(requestedStep, INCIDENT_MAX_STEP));
  const clock = new ManualClock("2026-07-05T00:00:00.000Z");
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const sentinel = new RuntimeSentinel(
    clock,
    ids,
    ledger,
    [{ ruleId: "hard_exposure_cap", signalId: "aggregate_exposure_minor", maxValue: 50_000_000 }],
    [
      { ruleId: "velocity", signalId: "refund_velocity_per_min", elevatedAt: 5, concerningAt: 10, dangerousAt: 20 },
      { ruleId: "aggregate", signalId: "aggregate_exposure_minor", elevatedAt: 3_000_000, concerningAt: 6_000_000, dangerousAt: 9_000_000 },
    ],
  );
  const context = sentinel.createContext("grant_demo", TENANT_ID, [
    { signalId: "refund_velocity_per_min", maxAgeMs: 60_000, trustedSources: ["gateway"] },
    { signalId: "aggregate_exposure_minor", maxAgeMs: 60_000, trustedSources: ["gateway"] },
  ]);
  const grant = { revoked: false } as { revoked: boolean };

  const timeline: IncidentStepTrace[] = [];
  let openCommandId: string | null = null;

  for (let i = 0; i <= step; i++) {
    const reading = SIGNAL_STEPS[i]!;
    clock.advanceMs(10_000);
    sentinel.ingest(context.contextId, { signalId: "refund_velocity_per_min", value: reading.velocity, observedAt: clock.now(), source: "gateway" });
    sentinel.ingest(context.contextId, { signalId: "aggregate_exposure_minor", value: reading.exposureMinor, observedAt: clock.now(), source: "gateway" });

    const { riskState, findings } = sentinel.evaluate(context.contextId);

    let intervention: IncidentStepTrace["intervention"] = null;
    if ((riskState === "R3_DANGEROUS" || riskState === "R4_CRITICAL") && !openCommandId) {
      const command = sentinel.intervene(context.contextId, riskState, grant as never, "refund velocity breached the dangerous threshold");
      openCommandId = command.commandId;
      intervention = { commandId: command.commandId, interventionClass: command.interventionClass, reason: command.reason };
    }

    let containment: IncidentStepTrace["containment"] = null;
    if (reading.containmentCheck && openCommandId) {
      const receipt = sentinel.verifyContainment(openCommandId, {
        source: "provider-ledger",
        observedStopped: reading.containmentCheck === "effective",
      });
      containment = { result: receipt.result, source: receipt.verificationSource };
      if (receipt.result !== "EFFECTIVE") {
        // Ineffective containment escalates (MON-INV-009): issue the
        // next, stronger intervention immediately so the timeline shows
        // the actual escalation, not just the failed check.
        const escalated = sentinel.intervene(context.contextId, riskState, grant as never, "containment check reported ineffective; escalating");
        openCommandId = escalated.commandId;
        intervention = { commandId: escalated.commandId, interventionClass: escalated.interventionClass, reason: escalated.reason };
      } else {
        openCommandId = null;
      }
    }

    timeline.push({
      step: i,
      velocity: reading.velocity,
      exposureMinor: reading.exposureMinor,
      riskState,
      findingKinds: findings.map((f) => f.kind),
      intervention,
      containment,
      grantRevoked: grant.revoked,
    });
  }

  const last = timeline[timeline.length - 1]!;
  return { timeline, maxStep: INCIDENT_MAX_STEP, finalRiskState: last.riskState, finalGrantRevoked: last.grantRevoked };
}
