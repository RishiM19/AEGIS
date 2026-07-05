import { test } from "node:test";
import assert from "node:assert/strict";
import { RecoveryEngine, DoubleCompensationRejected, selectStrategy, type EffectRecord } from "../src/recovery/recovery-engine.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";

function harness() {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const engine = new RecoveryEngine(clock, ids, ledger);
  return { clock, ledger, engine };
}

function effect(overrides: Partial<EffectRecord> = {}): EffectRecord {
  return {
    effectId: overrides.effectId ?? "eff_1",
    executionAttemptId: "exec_1",
    description: "duplicate refund of 18400.00 INR",
    classification: "COMPENSATABLE",
    verifiedOccurred: "TRUE",
    magnitudeMinor: 1840000,
    tenantId: "tenant_a",
    ...overrides,
  };
}

test("strategy selection is deterministic per classification (RCV-INV-012, SS6)", () => {
  assert.equal(selectStrategy("FULLY_REVERSIBLE"), "ROLLBACK");
  assert.equal(selectStrategy("COMPENSATABLE"), "COMPENSATE");
  assert.equal(selectStrategy("PRACTICALLY_IRREVERSIBLE"), "CONTAIN_AND_ACCEPT");
  assert.equal(selectStrategy("FUNDAMENTALLY_IRREVERSIBLE"), "CONTAIN_AND_ACCEPT");
  assert.equal(selectStrategy("UNKNOWN"), "DEFER_TO_HUMAN");
});

test("unknown effect occurrence defers to a human, never guesses (RCV-INV-002)", () => {
  const h = harness();
  const trigger = h.engine.trigger("RUNTIME_SENTINEL_I9", "intv_1", "tenant_a");
  h.engine.recordEffect(effect({ verifiedOccurred: "UNKNOWN" }));
  const plan = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  assert.equal(plan.strategy, "DEFER_TO_HUMAN");
});

test("compensation dispatches through the injected governed path and marks the plan DISPATCHED (RCV-INV-001)", () => {
  const h = harness();
  const trigger = h.engine.trigger("RUNTIME_SENTINEL_I9", "intv_1", "tenant_a");
  h.engine.recordEffect(effect());
  const plan = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  assert.equal(plan.strategy, "COMPENSATE");
  assert.equal(plan.requiresNewGrant, true, "compensation requires a new grant, never self-authorizes");

  const dispatched: string[] = [];
  h.engine.dispatchCompensation(plan.recoveryPlanId, (e) => {
    dispatched.push(e.effectId);
    return { dispatched: true, reason: "ok" };
  }, "tenant_a");
  assert.deepEqual(dispatched, ["eff_1"]);
  assert.equal(h.engine.getPlan(plan.recoveryPlanId)?.status, "DISPATCHED");
});

test("double compensation against the same effect is rejected (RCV-INV-004)", () => {
  const h = harness();
  const trigger = h.engine.trigger("MANUAL", "op_1", "tenant_a");
  h.engine.recordEffect(effect());
  const plan1 = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  h.engine.dispatchCompensation(plan1.recoveryPlanId, () => ({ dispatched: true, reason: "ok" }), "tenant_a");

  const plan2 = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  assert.throws(
    () => h.engine.dispatchCompensation(plan2.recoveryPlanId, () => ({ dispatched: true, reason: "ok" }), "tenant_a"),
    DoubleCompensationRejected,
  );
});

test("recovery is complete only via independent verification; dependent sources are rejected (RCV-INV-003/009)", () => {
  const h = harness();
  const trigger = h.engine.trigger("MANUAL", "op_1", "tenant_a");
  h.engine.recordEffect(effect());
  const plan = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  h.engine.dispatchCompensation(plan.recoveryPlanId, () => ({ dispatched: true, reason: "ok" }), "tenant_a");

  assert.throws(() =>
    h.engine.verify(plan.recoveryPlanId, { source: "recovery-engine-self", sourceIsIndependent: false, observedResult: "FULLY_RECOVERED" }, "tenant_a"),
  );
  const receipt = h.engine.verify(
    plan.recoveryPlanId,
    { source: "provider-ledger", sourceIsIndependent: true, observedResult: "FULLY_RECOVERED" },
    "tenant_a",
  );
  assert.equal(receipt.result, "FULLY_RECOVERED");
  assert.equal(h.engine.getPlan(plan.recoveryPlanId)?.status, "FULLY_RECOVERED");
});

test("partial recovery is terminal and produces explicit residual harm (RCV-INV-008)", () => {
  const h = harness();
  const trigger = h.engine.trigger("MANUAL", "op_1", "tenant_a");
  h.engine.recordEffect(effect());
  const plan = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  h.engine.dispatchCompensation(plan.recoveryPlanId, () => ({ dispatched: true, reason: "ok" }), "tenant_a");
  const receipt = h.engine.verify(
    plan.recoveryPlanId,
    { source: "provider-ledger", sourceIsIndependent: true, observedResult: "PARTIALLY_RECOVERED" },
    "tenant_a",
  );
  assert.ok(receipt.residualHarmId);
  assert.equal(h.engine.unacknowledgedHarms().length, 1);
});

test("irreversible effects produce residual harm requiring human acknowledgment (RCV-INV-006)", () => {
  const h = harness();
  const trigger = h.engine.trigger("POST_INCIDENT_DETECTION", "det_1", "tenant_a");
  h.engine.recordEffect(effect({ classification: "FUNDAMENTALLY_IRREVERSIBLE" }));
  const plan = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  assert.equal(plan.strategy, "CONTAIN_AND_ACCEPT");
  const harms = h.engine.unacknowledgedHarms();
  assert.equal(harms.length, 1);
  assert.equal(harms[0]?.isPermanent, true);
  h.engine.acknowledgeResidualHarm(harms[0]!.residualHarmId, "principal_ops");
  assert.equal(h.engine.unacknowledgedHarms().length, 0);
});

test("verified recovery capability is demonstrated per effect class, never claimed (SS8, AUT-INV-010 hook)", () => {
  const h = harness();
  assert.equal(h.engine.verifiedRecoveryCapability("COMPENSATABLE"), false, "no history -> no capability");

  const trigger = h.engine.trigger("MANUAL", "op_1", "tenant_a");
  h.engine.recordEffect(effect());
  const plan = h.engine.plan(trigger, ["eff_1"], "tenant_a");
  h.engine.dispatchCompensation(plan.recoveryPlanId, () => ({ dispatched: true, reason: "ok" }), "tenant_a");
  h.engine.verify(plan.recoveryPlanId, { source: "provider-ledger", sourceIsIndependent: true, observedResult: "FULLY_RECOVERED" }, "tenant_a");

  assert.equal(h.engine.verifiedRecoveryCapability("COMPENSATABLE"), true);
  assert.equal(h.engine.verifiedRecoveryCapability("FULLY_REVERSIBLE"), false, "capability is per class");
});
