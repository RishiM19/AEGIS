import { test } from "node:test";
import assert from "node:assert/strict";
import { EventLedger, RetentionFloorViolation, SAFETY_CRITICAL_RETENTION_FLOOR_DAYS } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";

function ledger() {
  return new EventLedger(new ManualClock(), new SequentialIds());
}

const base = {
  owningSpec: "SPEC-008",
  subjectIds: ["act_1"],
  payload: {},
  tenantId: "tenant_a",
  versionsInEffect: { gateway: "1.0.0" },
  sourceComponent: "execution-gateway",
};

test("append requires versionsInEffect (LEDGER-INV-003)", () => {
  const l = ledger();
  assert.throws(() => l.append({ ...base, eventType: "EXECUTION_STARTED", versionsInEffect: {} }), /LEDGER-INV-003/);
});

test("ledger exposes no edit or delete API (LEDGER-INV-001) and returned events are frozen", () => {
  const l = ledger();
  const e = l.append({ ...base, eventType: "EXECUTION_STARTED" });
  assert.throws(() => {
    (e as { eventType: string }).eventType = "TAMPERED";
  }, TypeError);
});

test("reads are tenant-scoped (LEDGER-INV-006)", () => {
  const l = ledger();
  l.append({ ...base, eventType: "EXECUTION_STARTED" });
  l.append({ ...base, eventType: "EXECUTION_STARTED", tenantId: "tenant_b", subjectIds: ["act_2"] });
  assert.equal(l.eventsForTenant("tenant_a").length, 1);
  assert.equal(l.eventsForTenant("tenant_b").length, 1);
  assert.equal(l.eventsForSubject("tenant_a", "act_2").length, 0);
});

test("reconstruction reports a complete chain", () => {
  const l = ledger();
  l.append({ ...base, eventType: "AUTONOMY_DECIDED", occurredAt: "2026-07-05T00:00:01Z" });
  l.append({ ...base, eventType: "CONTRACT_CREATED", occurredAt: "2026-07-05T00:00:02Z" });
  l.append({ ...base, eventType: "EXECUTION_STARTED", occurredAt: "2026-07-05T00:00:03Z" });
  const r = l.reconstruct("tenant_a", "act_1");
  assert.equal(r.completenessStatus, "COMPLETE");
  assert.deepEqual(
    r.events.map((e) => e.eventType),
    ["AUTONOMY_DECIDED", "CONTRACT_CREATED", "EXECUTION_STARTED"],
  );
});

test("reconstruction detects a missing prerequisite instead of silently returning (LEDGER-INV-004)", () => {
  const l = ledger();
  l.append({ ...base, eventType: "EXECUTION_STARTED" }); // no CONTRACT_CREATED before it
  const r = l.reconstruct("tenant_a", "act_1");
  assert.equal(r.completenessStatus, "PARTIAL_GAPS_DETECTED");
  assert.match(r.detectedGaps[0] ?? "", /CONTRACT_CREATED/);
});

test("SAFETY_CRITICAL retention cannot go below the platform floor (LEDGER-INV-005)", () => {
  const l = ledger();
  assert.throws(() => l.setRetention({ eventTypeClass: "SAFETY_CRITICAL", retentionDays: 30 }), RetentionFloorViolation);
  l.setRetention({ eventTypeClass: "SAFETY_CRITICAL", retentionDays: SAFETY_CRITICAL_RETENTION_FLOOR_DAYS + 100 });
  assert.equal(l.retentionDays("SAFETY_CRITICAL"), SAFETY_CRITICAL_RETENTION_FLOOR_DAYS + 100);
  l.setRetention({ eventTypeClass: "STANDARD", retentionDays: 7 }); // STANDARD may go lower
  assert.equal(l.retentionDays("STANDARD"), 7);
});
