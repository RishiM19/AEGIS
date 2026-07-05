import { test } from "node:test";
import assert from "node:assert/strict";
import { LearningPlane, type ObservationInput } from "../src/learning/learning-plane.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";

function harness() {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  return { clock, ledger, plane: new LearningPlane(clock, ids, ledger) };
}

function observation(overrides: Partial<ObservationInput> = {}): ObservationInput {
  return {
    subjectType: "EXECUTION_ATTEMPT",
    subjectId: "exec_1",
    tenantId: "tenant_a",
    agentId: "agent_refund",
    agentVersionId: "agentv_0001",
    actionRegion: "finance.refunds.customer/ISSUE_CUSTOMER_REFUND",
    executionOutcome: "SUCCEEDED",
    providerFailure: false,
    humanModifiedAction: false,
    sentinelIntervened: false,
    recoveryRan: false,
    fromSimulation: false,
    observationSourceId: "provider-ledger",
    observationSourceIndependent: true,
    ...overrides,
  };
}

test("clean success attributes fully to the agent and writes full-weight evidence", () => {
  const h = harness();
  const { attribution, evidence } = h.plane.process(observation());
  assert.equal(attribution.weights.AGENT_DECISION_QUALITY, 1);
  assert.equal(evidence?.outcomeScore, 1);
  assert.equal(evidence?.evidenceWeight, 1);
});

test("provider outage yields near-zero agent weight, not negative evidence (SS6)", () => {
  const h = harness();
  const { attribution, evidence } = h.plane.process(observation({ executionOutcome: "FAILED", providerFailure: true }));
  assert.equal(attribution.weights.ENVIRONMENTAL_FAILURE, 0.9);
  assert.equal(evidence?.evidenceWeight, 0.1);
  assert.equal(evidence?.outcomeScore, 0);
});

test("sentinel intervention attributes to the sentinel, not the agent (LRN-INV-006)", () => {
  const h = harness();
  const { attribution } = h.plane.process(observation({ executionOutcome: "FAILED", sentinelIntervened: true }));
  assert.equal(attribution.weights.RUNTIME_SENTINEL_INTERVENTION, 0.7);
  assert.ok((attribution.weights.AGENT_DECISION_QUALITY ?? 0) < 0.5);
});

test("human-modified action: the outcome barely evidences the agent's own proposal (SS6)", () => {
  const h = harness();
  const { attribution } = h.plane.process(observation({ humanModifiedAction: true }));
  assert.equal(attribution.weights.HUMAN_INTERVENTION, 0.8);
});

test("UNKNOWN outcomes produce an attribution but no evidence item (LRN-INV-003)", () => {
  const h = harness();
  const { attribution, evidence } = h.plane.process(observation({ executionOutcome: "UNKNOWN" }));
  assert.equal(attribution.outcomeClassification, "UNKNOWN");
  assert.equal(evidence, null);
  assert.equal(h.plane.allEvidence().length, 0);
  const types = h.ledger.eventsForTenant("tenant_a").map((e) => e.eventType);
  assert.ok(types.includes("OUTCOME_UNRESOLVED_ESCALATED"));
});

test("evidence items are immutable once written (LRN-INV-004)", () => {
  const h = harness();
  const { evidence } = h.plane.process(observation());
  assert.throws(() => {
    (evidence as { outcomeScore: number }).outcomeScore = 0;
  }, TypeError);
});

test("non-independent observation sources carry a standing integrity discount (LRN-INV-008, GAME-INV-003 hook)", () => {
  const h = harness();
  const independent = h.plane.process(observation()).evidence;
  const selfReported = h.plane.process(
    observation({ subjectId: "exec_2", observationSourceId: "agent-self", observationSourceIndependent: false }),
  ).evidence;
  assert.equal(independent?.integrityScore, 1);
  assert.equal(selfReported?.integrityScore, 0.5);
});

test("attribution is reproducible for identical observations (LRN-INV-007)", () => {
  const h1 = harness();
  const h2 = harness();
  const a = h1.plane.process(observation({ providerFailure: true })).attribution;
  const b = h2.plane.process(observation({ providerFailure: true })).attribution;
  assert.deepEqual(a.weights, b.weights);
});

test("the full chain OUTCOME_EVALUATED -> ATTRIBUTION_COMPLETED -> COMPETENCE_EVIDENCE_ITEM_WRITTEN reaches the ledger", () => {
  const h = harness();
  h.plane.process(observation());
  const r = h.ledger.reconstruct("tenant_a", "exec_1");
  assert.equal(r.completenessStatus, "COMPLETE");
  const types = r.events.map((e) => e.eventType);
  assert.deepEqual(types, ["OUTCOME_EVALUATED", "ATTRIBUTION_COMPLETED", "COMPETENCE_EVIDENCE_ITEM_WRITTEN"]);
});
