import { test } from "node:test";
import assert from "node:assert/strict";
import { DelegationChain, AuthorityWideningRejected, attributeToHops } from "../src/delegation/delegation-graph.js";
import { EvidenceIntegrityEngine } from "../src/integrity/evidence-integrity.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";
import type { CompetenceEvidenceInput } from "../src/assessment/competence.js";

// ------------------------------------------------------------- delegation

function chain() {
  const c = new DelegationChain(new SequentialIds(), "principal_human");
  c.addHop({
    fromId: "principal_human",
    toAgentId: "agent_coordinator",
    agentVersionIdAtHop: "av_coord",
    delegatedScope: { capability: "customer.refund", maxAmountMinor: 2500000, environmentTypes: ["PRODUCTION"] },
    hopCeiling: 3,
  });
  return c;
}

test("authority cannot widen across a hop: amount, capability, environment (DEL-INV-001)", () => {
  const c = chain();
  assert.throws(
    () =>
      c.addHop({
        fromId: "agent_coordinator",
        toAgentId: "agent_exec",
        agentVersionIdAtHop: "av_exec",
        delegatedScope: { capability: "customer.refund", maxAmountMinor: 5000000, environmentTypes: ["PRODUCTION"] },
        hopCeiling: 5,
      }),
    AuthorityWideningRejected,
  );
  assert.throws(
    () =>
      c.addHop({
        fromId: "agent_coordinator",
        toAgentId: "agent_exec",
        agentVersionIdAtHop: "av_exec",
        delegatedScope: { capability: "customer.refund", maxAmountMinor: 1000000, environmentTypes: ["PRODUCTION", "SANDBOX"] },
        hopCeiling: 5,
      }),
    AuthorityWideningRejected,
  );
});

test("chain ceiling is the strict minimum over hops: a strong final hop cannot rescue a weak coordinator (SS6)", () => {
  const c = chain(); // coordinator hop ceiling 3
  c.addHop({
    fromId: "agent_coordinator",
    toAgentId: "agent_exec",
    agentVersionIdAtHop: "av_exec",
    delegatedScope: { capability: "customer.refund", maxAmountMinor: 1000000, environmentTypes: ["PRODUCTION"] },
    hopCeiling: 5,
  });
  assert.equal(c.chainCeiling(), 3);
  assert.equal(c.immediateActorAgentId(), "agent_exec");
});

test("the originating principal is fixed at hop zero and immutable (DEL-INV-002/006)", () => {
  const c = chain();
  assert.equal(c.originatingPrincipalId, "principal_human");
  c.seal();
  assert.throws(() =>
    c.addHop({
      fromId: "x",
      toAgentId: "y",
      agentVersionIdAtHop: "z",
      delegatedScope: { capability: "customer.refund", maxAmountMinor: 1, environmentTypes: ["PRODUCTION"] },
      hopCeiling: 1,
    }),
  );
});

test("causal responsibility resolves to specific hops, not spread evenly (DEL-INV-005)", () => {
  const c = chain();
  c.addHop({
    fromId: "agent_coordinator",
    toAgentId: "agent_exec",
    agentVersionIdAtHop: "av_exec",
    delegatedScope: { capability: "customer.refund", maxAmountMinor: 1000000, environmentTypes: ["PRODUCTION"] },
    hopCeiling: 5,
  });
  const record = attributeToHops(new SequentialIds(), c, "exec_1", [0]);
  assert.deepEqual(record.responsibleHopIndexes, [0]);
});

// ---------------------------------------------------------- anti-gaming

const REGION_EASY = "finance.refunds.customer/ISSUE_CUSTOMER_REFUND_SMALL";
const REGION_HARD = "finance.refunds.customer/ISSUE_FRAUD_DISPUTE_REFUND";

function evidenceItem(i: number, region = REGION_EASY): CompetenceEvidenceInput {
  return {
    evidenceItemId: `ce_${i}`,
    agentVersionId: "av_1",
    actionRegion: region,
    outcomeScore: 1,
    evidenceWeight: 1,
    fromSimulation: false,
    integrityScore: 1,
    recordedAt: "2026-07-01T00:00:00.000Z",
  };
}

function engine() {
  return new EvidenceIntegrityEngine(new ManualClock(), new SequentialIds());
}

test("no signal fires below the aggregate evidence floor (GAME-INV-002)", () => {
  const { signals } = engine().detect("av_1", [REGION_EASY, REGION_HARD], [evidenceItem(1)]);
  assert.equal(signals.length, 0);
});

test("competence farming: extreme single-region concentration under a broad declared capability set", () => {
  const evidence = Array.from({ length: 30 }, (_, i) => evidenceItem(i));
  const { signals, integrityScores } = engine().detect("av_1", [REGION_EASY, REGION_HARD], evidence);
  const farming = signals.find((s) => s.signalType === "COMPETENCE_FARMING");
  assert.ok(farming, "farming signal should fire");
  assert.equal(farming.affectedRegion, REGION_EASY);
  assert.equal(integrityScores.length, 30, "supporting items are discounted");
  assert.ok(integrityScores.every((s) => s.score === 0.5));
});

test("difficulty avoidance: declared regions with zero demonstrated evidence, in aggregate", () => {
  const evidence = Array.from({ length: 30 }, (_, i) => evidenceItem(i));
  const { signals } = engine().detect("av_1", [REGION_EASY, REGION_HARD], evidence);
  const avoidance = signals.find((s) => s.signalType === "DIFFICULTY_AVOIDANCE");
  assert.ok(avoidance, "avoidance signal should fire");
  assert.match(avoidance.explanation, /ISSUE_FRAUD_DISPUTE_REFUND/);
});

test("balanced evidence across declared regions fires nothing", () => {
  const evidence = [
    ...Array.from({ length: 15 }, (_, i) => evidenceItem(i, REGION_EASY)),
    ...Array.from({ length: 15 }, (_, i) => evidenceItem(100 + i, REGION_HARD)),
  ];
  const { signals } = engine().detect("av_1", [REGION_EASY, REGION_HARD], evidence);
  assert.equal(signals.length, 0);
});

test("discounts apply at consumption time onto copies; originals are untouched (GAME-INV-001)", () => {
  const e = engine();
  const evidence = Array.from({ length: 30 }, (_, i) => evidenceItem(i));
  const { integrityScores } = e.detect("av_1", [REGION_EASY, REGION_HARD], evidence);
  const discounted = e.applyDiscounts(evidence, integrityScores);
  assert.equal(discounted[0]?.integrityScore, 0.5);
  assert.equal(evidence[0]?.integrityScore, 1, "original evidence item is never mutated");
});

test("detection is reproducible for identical inputs (GAME-INV-006)", () => {
  const evidence = Array.from({ length: 30 }, (_, i) => evidenceItem(i));
  const a = engine().detect("av_1", [REGION_EASY, REGION_HARD], evidence);
  const b = engine().detect("av_1", [REGION_EASY, REGION_HARD], evidence);
  assert.equal(a.signals.length, b.signals.length);
  assert.deepEqual(a.signals.map((s) => s.signalType), b.signals.map((s) => s.signalType));
});
