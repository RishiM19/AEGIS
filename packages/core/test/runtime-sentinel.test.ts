import { test } from "node:test";
import assert from "node:assert/strict";
import { RuntimeSentinel, type SignalRequirement } from "../src/sentinel/runtime-sentinel.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";
import type { AutonomyGrant } from "../src/autonomy/decision-engine.js";

const REQUIREMENTS: SignalRequirement[] = [
  { signalId: "refund_velocity_per_min", maxAgeMs: 60_000, trustedSources: ["gateway", "provider"] },
  { signalId: "aggregate_exposure_minor", maxAgeMs: 60_000, trustedSources: ["gateway"] },
];

function harness() {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const sentinel = new RuntimeSentinel(
    clock,
    ids,
    ledger,
    [{ ruleId: "hard_exposure_cap", signalId: "aggregate_exposure_minor", maxValue: 10_000_000 }],
    [
      { ruleId: "velocity", signalId: "refund_velocity_per_min", elevatedAt: 5, concerningAt: 10, dangerousAt: 20 },
      { ruleId: "aggregate", signalId: "aggregate_exposure_minor", elevatedAt: 2_000_000, concerningAt: 5_000_000, dangerousAt: 8_000_000 },
    ],
  );
  const context = sentinel.createContext("grant_1", "tenant_a", REQUIREMENTS);
  const grant = { revoked: false } as AutonomyGrant;
  return { clock, ledger, sentinel, context, grant };
}

function feed(h: ReturnType<typeof harness>, velocity: number, exposure: number) {
  h.sentinel.ingest(h.context.contextId, {
    signalId: "refund_velocity_per_min",
    value: velocity,
    observedAt: h.clock.now(),
    source: "gateway",
  });
  h.sentinel.ingest(h.context.contextId, {
    signalId: "aggregate_exposure_minor",
    value: exposure,
    observedAt: h.clock.now(),
    source: "gateway",
  });
}

test("context is not ready until every required signal has a reading (MON-INV-001)", () => {
  const h = harness();
  assert.equal(h.sentinel.isReady(h.context.contextId), false);
  feed(h, 1, 100);
  assert.equal(h.sentinel.isReady(h.context.contextId), true);
});

test("agent self-reported readings are rejected for required signals (MON-INV-002)", () => {
  const h = harness();
  h.sentinel.ingest(h.context.contextId, {
    signalId: "refund_velocity_per_min",
    value: 0,
    observedAt: h.clock.now(),
    source: "agent",
  });
  assert.equal(h.sentinel.isReady(h.context.contextId), false);
});

test("healthy signals -> R0_NORMAL", () => {
  const h = harness();
  feed(h, 1, 100);
  assert.equal(h.sentinel.evaluate(h.context.contextId).riskState, "R0_NORMAL");
});

test("missing or stale signals -> R_UNKNOWN, never a lower risk (MON-INV-004/013)", () => {
  const h = harness();
  feed(h, 1, 100);
  h.clock.advanceMs(120_000); // beyond maxAgeMs
  const { riskState, findings } = h.sentinel.evaluate(h.context.contextId);
  assert.equal(riskState, "R_UNKNOWN");
  assert.ok(findings.some((f) => f.kind === "MONITORING_BLINDNESS"));
});

test("hard invariant violation -> R4_CRITICAL regardless of other readings (MON-INV-005)", () => {
  const h = harness();
  feed(h, 1, 11_000_000); // over the hard cap
  const { riskState, findings } = h.sentinel.evaluate(h.context.contextId);
  assert.equal(riskState, "R4_CRITICAL");
  assert.ok(findings.some((f) => f.kind === "HARD_INVARIANT_VIOLATION"));
});

test("aggregate exposure thresholds are first-class findings (MON-INV-014)", () => {
  const h = harness();
  feed(h, 1, 6_000_000);
  const { riskState, findings } = h.sentinel.evaluate(h.context.contextId);
  assert.equal(riskState, "R2_CONCERNING");
  assert.ok(findings.some((f) => f.kind === "AGGREGATE_EXPOSURE"));
});

test("R4 intervention revokes the grant: reduction only (MON-INV-008)", () => {
  const h = harness();
  feed(h, 1, 11_000_000);
  const { riskState } = h.sentinel.evaluate(h.context.contextId);
  const command = h.sentinel.intervene(h.context.contextId, riskState, h.grant, "hard cap breached");
  assert.equal(command.interventionClass, "I6");
  assert.equal(h.grant.revoked, true);
});

test("STOP is not STOPPED: ineffective containment escalates the next intervention (MON-INV-009/016)", () => {
  const h = harness();
  feed(h, 25, 100); // dangerous velocity -> I4 pause
  const { riskState } = h.sentinel.evaluate(h.context.contextId);
  const first = h.sentinel.intervene(h.context.contextId, riskState, h.grant, "velocity");
  assert.equal(first.interventionClass, "I4");

  const receipt = h.sentinel.verifyContainment(first.commandId, { source: "provider-ledger", observedStopped: false });
  assert.equal(receipt.result, "INEFFECTIVE");

  const second = h.sentinel.intervene(h.context.contextId, riskState, h.grant, "still moving");
  assert.equal(second.interventionClass, "I5", "escalated one class after ineffective containment");
});

test("unknown verification result is UNKNOWN, not effective, and also escalates", () => {
  const h = harness();
  feed(h, 25, 100);
  const { riskState } = h.sentinel.evaluate(h.context.contextId);
  const cmd = h.sentinel.intervene(h.context.contextId, riskState, h.grant, "velocity");
  const receipt = h.sentinel.verifyContainment(cmd.commandId, { source: "provider-ledger", observedStopped: null });
  assert.equal(receipt.result, "UNKNOWN");
});

test("findings, risk evaluations, interventions and containment all reach the ledger (MON-INV-006/025)", () => {
  const h = harness();
  feed(h, 25, 100);
  const { riskState } = h.sentinel.evaluate(h.context.contextId);
  const cmd = h.sentinel.intervene(h.context.contextId, riskState, h.grant, "velocity");
  h.sentinel.verifyContainment(cmd.commandId, { source: "provider-ledger", observedStopped: true });
  const types = h.ledger.eventsForTenant("tenant_a").map((e) => e.eventType);
  for (const expected of ["RUNTIME_FINDING_RAISED", "RUNTIME_RISK_STATE_EVALUATED", "INTERVENTION_ISSUED", "CONTAINMENT_VERIFIED"]) {
    assert.ok(types.includes(expected), `missing ${expected}`);
  }
});
