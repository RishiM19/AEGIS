import { test } from "node:test";
import assert from "node:assert/strict";
import { assessCompetence, type CompetenceEvidenceInput } from "../src/assessment/competence.js";
import { assessNovelty, type HistoricalActionRecord } from "../src/assessment/novelty.js";
import { assessEpistemic } from "../src/assessment/epistemic.js";
import { assessConsequence } from "../src/assessment/consequence.js";
import { refundAction } from "./helpers/refund-action.js";

const NOW = "2026-07-05T00:00:00.000Z";
const REGION = "finance.refunds.customer/ISSUE_CUSTOMER_REFUND";

function evidenceItem(i: number, overrides: Partial<CompetenceEvidenceInput> = {}): CompetenceEvidenceInput {
  return {
    evidenceItemId: `ce_${i}`,
    agentVersionId: "agentv_0001",
    actionRegion: REGION,
    outcomeScore: 1,
    evidenceWeight: 1,
    fromSimulation: false,
    integrityScore: 1,
    recordedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------- competence

test("competence: no evidence -> UNKNOWN status, wide interval, L2 ceiling (COMP-INV-004)", () => {
  const a = assessCompetence("agentv_0001", REGION, [], NOW);
  assert.equal(a.status, "UNKNOWN_NO_EVIDENCE");
  assert.equal(a.ceiling, 2);
});

test("competence: evidence from another agent version does not count (COMP-INV-003)", () => {
  const evidence = Array.from({ length: 20 }, (_, i) => evidenceItem(i, { agentVersionId: "agentv_OTHER" }));
  const a = assessCompetence("agentv_0001", REGION, evidence, NOW);
  assert.equal(a.status, "UNKNOWN_NO_EVIDENCE");
});

test("competence: simulation evidence is excluded (COMP-INV-010)", () => {
  const evidence = Array.from({ length: 20 }, (_, i) => evidenceItem(i, { fromSimulation: true }));
  const a = assessCompetence("agentv_0001", REGION, evidence, NOW);
  assert.equal(a.status, "UNKNOWN_NO_EVIDENCE");
});

test("competence: strong diverse history earns a high ceiling; sparse history stays constrained (COMP-INV-008)", () => {
  const strong = assessCompetence("agentv_0001", REGION, Array.from({ length: 40 }, (_, i) => evidenceItem(i)), NOW);
  assert.equal(strong.ceiling, 5);
  const sparse = assessCompetence("agentv_0001", REGION, [evidenceItem(1), evidenceItem(2)], NOW);
  assert.ok(sparse.ceiling <= 3, `sparse ceiling should be constrained, got L${sparse.ceiling}`);
});

test("competence: reproducible from frozen inputs (COMP-INV-013)", () => {
  const evidence = Array.from({ length: 7 }, (_, i) => evidenceItem(i, { outcomeScore: i % 2 }));
  const a = assessCompetence("agentv_0001", REGION, evidence, NOW);
  const b = assessCompetence("agentv_0001", REGION, evidence, NOW);
  assert.deepEqual(a, b);
});

// ------------------------------------------------------------------- novelty

function historyRecord(i: number, overrides: Partial<HistoricalActionRecord> = {}): HistoricalActionRecord {
  return {
    agentId: "agent_refund",
    actionRegion: REGION,
    contextValues: { case_type: "duplicate_charge", payment_method: "card" },
    monetaryMinor: 1500000 + i * 100000,
    occurredAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

test("novelty: familiar region, in-range amount, seen combination -> low novelty", () => {
  const history = Array.from({ length: 10 }, (_, i) => historyRecord(i));
  const a = assessNovelty(refundAction({ amountMinor: 1800000 }), history, NOW);
  assert.ok(a.noveltyScore <= 0.2, `expected low novelty, got ${a.noveltyScore}`);
  assert.equal(a.ceiling, 5);
});

test("novelty: another agent's history does not reduce novelty (NOV-INV-002)", () => {
  const history = Array.from({ length: 10 }, (_, i) => historyRecord(i, { agentId: "agent_OTHER" }));
  const a = assessNovelty(refundAction(), history, NOW);
  assert.equal(a.noveltyScore, 1);
});

test("novelty: out-of-range amount is locally novel despite volume (NOV-INV-006)", () => {
  const history = Array.from({ length: 50 }, (_, i) => historyRecord(i, { monetaryMinor: 1000000 }));
  const a = assessNovelty(refundAction({ amountMinor: 9000000 }), history, NOW);
  assert.ok(a.noveltyScore >= 0.5, `expected elevated novelty, got ${a.noveltyScore}`);
});

test("novelty: unknown context value is never familiar (NOV-INV-008)", () => {
  const history = Array.from({ length: 10 }, (_, i) => historyRecord(i));
  const a = assessNovelty(refundAction({ contextValues: { case_type: null } }), history, NOW);
  assert.equal(a.noveltyScore, 1);
});

test("novelty: unseen combination of individually familiar values is novel (NOV-INV-007)", () => {
  const history = Array.from({ length: 10 }, (_, i) => historyRecord(i));
  const a = assessNovelty(
    refundAction({ amountMinor: 1800000, contextValues: { case_type: "fraud_dispute", payment_method: "card" } }),
    history,
    NOW,
  );
  const combo = a.components.find((c) => c.name === "context_combination");
  assert.ok(combo && combo.score > 0, "combination component should register novelty");
});

// ----------------------------------------------------------------- epistemic

test("epistemic: well-evidenced action from two sources -> LOW, L5 ceiling", () => {
  const a = assessEpistemic(refundAction());
  assert.equal(a.uncertaintyLevel, "LOW");
  assert.equal(a.independentSourceCount, 2);
  assert.equal(a.ceiling, 5);
});

test("epistemic: critical claims with zero evidence -> CRITICAL_UNKNOWN (EPI-INV-010)", () => {
  const a = assessEpistemic(refundAction({ evidence: [] }));
  assert.equal(a.uncertaintyLevel, "CRITICAL_UNKNOWN");
  assert.equal(a.ceiling, 1);
});

test("epistemic: single-source evidence volume is not independence (EPI-INV-003)", () => {
  const a = assessEpistemic(
    refundAction({
      evidence: [
        { evidenceId: "e1", evidenceType: "API_RESPONSE", sourceId: "one-source", freshnessStatus: "FRESH", claimRefs: ["claim_1"] },
        { evidenceId: "e2", evidenceType: "API_RESPONSE", sourceId: "one-source", freshnessStatus: "FRESH", claimRefs: ["claim_1"] },
        { evidenceId: "e3", evidenceType: "API_RESPONSE", sourceId: "one-source", freshnessStatus: "FRESH", claimRefs: ["claim_1"] },
      ],
    }),
  );
  assert.equal(a.independentSourceCount, 1);
  assert.ok(a.findings.some((f) => f.kind === "LOW_SOURCE_DIVERSITY"));
});

// --------------------------------------------------------------- consequence

test("consequence: mid-size compensatable refund -> HIGH severity via threshold, L3 ceiling", () => {
  const a = assessConsequence(refundAction({ amountMinor: 3000000 }));
  assert.equal(a.severity, "HIGH");
  assert.equal(a.reversibility, "COMPENSATABLE");
  assert.equal(a.ceiling, 3);
});

test("consequence: outbound communication is fundamentally irreversible regardless of compensation claims (CON-INV-004)", () => {
  const a = assessConsequence(
    refundAction({
      compensationSupport: "FULL",
      effects: [
        {
          effectId: "eff_c",
          effectType: "COMMUNICATION",
          direction: "OUTBOUND",
          affectedTargetRefs: ["cust_829"],
          certainty: "EXPECTED",
          source: "TOOL_METADATA",
        },
      ],
    }),
  );
  assert.equal(a.reversibility, "FUNDAMENTALLY_IRREVERSIBLE");
  assert.ok(a.ceiling <= 2);
});

test("consequence: no declared effects -> UNKNOWN severity, hard cap (CON-INV-013)", () => {
  const a = assessConsequence(refundAction({ effects: "NONE" }));
  assert.equal(a.severity, "UNKNOWN");
  assert.equal(a.ceiling, 1);
});

test("consequence: unbounded targets raise severity to SEVERE (CON-INV-005/006)", () => {
  const a = assessConsequence(refundAction({ amountMinor: 100, boundedTargets: false }));
  assert.equal(a.severity, "SEVERE");
});

test("consequence: sandbox lowers severity one tier relative to production (CON-INV-012)", () => {
  const prod = assessConsequence(refundAction({ amountMinor: 3000000 }));
  const sandbox = assessConsequence(refundAction({ amountMinor: 3000000, environmentType: "SANDBOX" }));
  assert.equal(prod.severity, "HIGH");
  assert.equal(sandbox.severity, "MODERATE");
});
