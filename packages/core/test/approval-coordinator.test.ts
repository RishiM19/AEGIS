import { test } from "node:test";
import assert from "node:assert/strict";
import { ApprovalCoordinator, AlreadyDecided, UnauthorizedQueueAccess } from "../src/approval/approval-coordinator.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";

function harness() {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const coordinator = new ApprovalCoordinator(clock, ids, ledger, 3600);
  coordinator.grantQueueAccess("reviewer_standard", "STANDARD");
  coordinator.grantQueueAccess("reviewer_elevated", "ELEVATED");
  return { clock, ledger, coordinator };
}

function request(h: ReturnType<typeof harness>, highConsequence = false) {
  return h.coordinator.createRequest({
    subjectType: "ACTION",
    subjectId: "act_1",
    subjectFingerprint: "fp_original",
    highConsequence,
    tenantId: "tenant_a",
  });
}

test("routing: high-consequence subjects land on the elevated queue (SS7)", () => {
  const h = harness();
  assert.equal(request(h, false).routingQueue, "STANDARD");
  assert.equal(request(h, true).routingQueue, "ELEVATED");
});

test("approval satisfies the exact bound fingerprint, nothing else (APR-INV-001/002)", () => {
  const h = harness();
  const r = request(h);
  h.coordinator.decide(r.approvalRequestId, "APPROVED_WITHOUT_CHANGE", "reviewer_standard");
  assert.equal(h.coordinator.satisfiedFingerprint(r.approvalRequestId), "fp_original");
});

test("rejection satisfies nothing", () => {
  const h = harness();
  const r = request(h);
  h.coordinator.decide(r.approvalRequestId, "REJECTED", "reviewer_standard");
  assert.equal(h.coordinator.satisfiedFingerprint(r.approvalRequestId), null);
});

test("exactly one decision of record; a second decision is rejected (APR-INV-006)", () => {
  const h = harness();
  const r = request(h);
  h.coordinator.decide(r.approvalRequestId, "APPROVED_WITHOUT_CHANGE", "reviewer_standard");
  assert.throws(() => h.coordinator.decide(r.approvalRequestId, "REJECTED", "reviewer_standard"), AlreadyDecided);
});

test("a late decision on an expired request is recorded but never satisfies (APR-INV-005)", () => {
  const h = harness();
  const r = request(h);
  h.clock.advanceMs(2 * 3600 * 1000);
  const decision = h.coordinator.decide(r.approvalRequestId, "APPROVED_WITHOUT_CHANGE", "reviewer_standard");
  assert.equal(decision.satisfiesPrecondition, false);
  assert.equal(h.coordinator.satisfiedFingerprint(r.approvalRequestId), null);
  assert.equal(h.coordinator.getRequest(r.approvalRequestId)?.status, "EXPIRED");
});

test("elevated queue rejects unauthorized principals; EMERGENCY_STOP bypasses queue authorization but is recorded (APR-INV-007)", () => {
  const h = harness();
  const r = request(h, true);
  assert.throws(() => h.coordinator.decide(r.approvalRequestId, "APPROVED_WITHOUT_CHANGE", "reviewer_standard"), UnauthorizedQueueAccess);
  const stop = h.coordinator.decide(r.approvalRequestId, "EMERGENCY_STOP", "reviewer_standard");
  assert.equal(stop.decisionType, "EMERGENCY_STOP");
  const types = h.ledger.eventsForTenant("tenant_a").map((e) => e.eventType);
  assert.ok(types.includes("APPROVAL_DECISION_RECORDED"));
});

test("material fingerprint change withdraws pending requests bound to the old fingerprint (APR-INV-001/004)", () => {
  const h = harness();
  const r = request(h);
  const withdrawn = h.coordinator.invalidateForFingerprintChange("fp_original");
  assert.equal(withdrawn, 1);
  assert.equal(h.coordinator.getRequest(r.approvalRequestId)?.status, "WITHDRAWN");
  assert.throws(() => h.coordinator.decide(r.approvalRequestId, "APPROVED_WITHOUT_CHANGE", "reviewer_standard"), /withdrawn/);
});
