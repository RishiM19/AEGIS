import { test } from "node:test";
import assert from "node:assert/strict";
import { AlgorithmRegistry, PromotionRejected, FloorViolation } from "../src/registry/algorithm-registry.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";

function registry() {
  return new AlgorithmRegistry(new ManualClock(), new SequentialIds());
}

function register(r: AlgorithmRegistry, componentName = "CompetenceEngine") {
  return r.register({
    componentName,
    algorithmVersion: "1.0.0",
    implementationReference: "core/assessment/competence",
    computationalClass: "STATISTICAL",
    supersedes: null,
  });
}

test("state machine has no OFF -> ACTIVE shortcut: three promotions are required", () => {
  const r = registry();
  const e = register(r);
  assert.equal(e.experimentationState, "OFF");
  r.promote(e.algorithmEntryId, "operator", "evidence_1");
  assert.equal(r.get(e.algorithmEntryId).experimentationState, "SHADOW");
  r.promote(e.algorithmEntryId, "operator", "evidence_2");
  assert.equal(r.get(e.algorithmEntryId).experimentationState, "CANARY");
  r.promote(e.algorithmEntryId, "operator", "evidence_3");
  assert.equal(r.get(e.algorithmEntryId).experimentationState, "ACTIVE");
});

test("promotion without comparison evidence is rejected (CFG-INV-003)", () => {
  const r = registry();
  const e = register(r);
  assert.throws(() => r.promote(e.algorithmEntryId, "operator", ""), PromotionRejected);
});

test("demotion to OFF requires no evidence (SS6)", () => {
  const r = registry();
  const e = register(r);
  r.promote(e.algorithmEntryId, "operator", "ev1");
  const record = r.demoteToOff(e.algorithmEntryId, "operator");
  assert.equal(record.comparisonEvidenceRef, null);
  assert.equal(r.get(e.algorithmEntryId).experimentationState, "OFF");
});

test("non-ACTIVE entries are structurally non-production (CFG-INV-002)", () => {
  const r = registry();
  const e = register(r);
  r.promote(e.algorithmEntryId, "operator", "ev1"); // SHADOW
  assert.throws(() => r.assertProductionEligible(e.algorithmEntryId), /CFG-INV-002/);
});

test("activating a new entry supersedes the previous ACTIVE one; activeFor resolves exactly one", () => {
  const r = registry();
  const a = register(r);
  const b = register(r);
  for (const id of [a.algorithmEntryId]) {
    r.promote(id, "op", "e1");
    r.promote(id, "op", "e2");
    r.promote(id, "op", "e3");
  }
  assert.equal(r.activeFor("CompetenceEngine").algorithmEntryId, a.algorithmEntryId);
  for (const _ of [1, 2, 3]) r.promote(b.algorithmEntryId, "op", "ev");
  assert.equal(r.activeFor("CompetenceEngine").algorithmEntryId, b.algorithmEntryId);
  assert.equal(r.get(a.algorithmEntryId).experimentationState, "OFF");
});

test("configuration versions supersede, never mutate (CFG-INV-004)", () => {
  const r = registry();
  const v1 = r.createConfiguration({
    componentName: "AutonomyDecisionEngine",
    configPayload: { maxRefundMinor: 2500000 },
    tenantScope: "GLOBAL",
    approvedBy: "operator",
  });
  const v2 = r.createConfiguration({
    componentName: "AutonomyDecisionEngine",
    configPayload: { maxRefundMinor: 2000000 },
    tenantScope: "GLOBAL",
    approvedBy: "operator",
  });
  assert.notEqual(v1.configVersionId, v2.configVersionId);
  assert.equal(r.currentConfiguration("AutonomyDecisionEngine", "GLOBAL")?.configVersionId, v2.configVersionId);
  assert.equal(v1.effectiveUntil !== null, true, "superseded version records when it stopped being effective");
  assert.throws(() => {
    (v1.configPayload as { maxRefundMinor: number }).maxRefundMinor = 999;
  }, TypeError);
});

test("tenant configuration below a platform floor is rejected at write time (CFG-INV-005)", () => {
  const r = registry();
  r.declareFloor({ componentName: "EventLedger", key: "safetyCriticalRetentionDays", minimum: 365 });
  assert.throws(
    () =>
      r.createConfiguration({
        componentName: "EventLedger",
        configPayload: { safetyCriticalRetentionDays: 30 },
        tenantScope: "tenant_a",
        approvedBy: "operator",
      }),
    FloorViolation,
  );
});
