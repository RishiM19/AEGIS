import { test } from "node:test";
import assert from "node:assert/strict";
import { isPersistenceConfigured, persistEvents, totalPersistedEventCount, totalPersistedAgentCount, recentRuns } from "../src/persistence/supabase-store.js";

// This suite runs without SUPABASE_URL/SUPABASE_KEY set (as every other
// test in this package does) to prove persistence is a safe, silent
// no-op in that configuration -- local development and CI never require
// a live database.

test("persistence reports itself as not configured without env vars", () => {
  assert.equal(isPersistenceConfigured(), false);
});

test("persistEvents is a no-op and never throws when unconfigured", async () => {
  const result = await persistEvents(
    [
      {
        eventId: "evt_1",
        eventType: "TEST_EVENT",
        owningSpec: "SPEC-014",
        subjectIds: ["x"],
        payload: {},
        occurredAt: "2026-07-05T00:00:00.000Z",
        recordedAt: "2026-07-05T00:00:00.000Z",
        tenantId: "tenant_a",
        versionsInEffect: { test: "1.0.0" },
        sourceComponent: "test",
      },
    ],
    "run_1",
  );
  assert.deepEqual(result, { persisted: 0, error: null });
});

test("read helpers return empty/null when unconfigured, never throw", async () => {
  assert.equal(await totalPersistedEventCount(), null);
  assert.equal(await totalPersistedAgentCount(), null);
  assert.deepEqual(await recentRuns(), []);
});
