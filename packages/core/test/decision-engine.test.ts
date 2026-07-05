import { test } from "node:test";
import assert from "node:assert/strict";
import { AutonomyDecisionEngine, type Delegation, type AutonomyPolicy, type DecisionInput } from "../src/autonomy/decision-engine.js";
import { assessCompetence, type CompetenceEvidenceInput } from "../src/assessment/competence.js";
import { assessNovelty, type HistoricalActionRecord } from "../src/assessment/novelty.js";
import { assessEpistemic } from "../src/assessment/epistemic.js";
import { assessConsequence } from "../src/assessment/consequence.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";
import { refundAction, type RefundOverrides } from "./helpers/refund-action.js";

const NOW = "2026-07-05T00:00:00.000Z";
const REGION = "finance.refunds.customer/ISSUE_CUSTOMER_REFUND";

const delegation: Delegation = {
  delegationId: "del_1",
  principalId: "principal_ops",
  delegateAgentId: "agent_refund",
  capability: "customer.refund",
  maxAmountMinor: 2500000,
  environmentTypes: ["PRODUCTION", "SANDBOX"],
  validFrom: "2026-07-01T00:00:00.000Z",
  validUntil: "2026-12-31T00:00:00.000Z",
  maxAutonomy: 5,
  revoked: false,
};

function strongEvidence(n = 40): CompetenceEvidenceInput[] {
  return Array.from({ length: n }, (_, i) => ({
    evidenceItemId: `ce_${i}`,
    agentVersionId: "agentv_0001",
    actionRegion: REGION,
    outcomeScore: 1,
    evidenceWeight: 1,
    fromSimulation: false,
    integrityScore: 1,
    recordedAt: "2026-07-01T00:00:00.000Z",
  }));
}

function familiarHistory(n = 10): HistoricalActionRecord[] {
  return Array.from({ length: n }, (_, i) => ({
    agentId: "agent_refund",
    actionRegion: REGION,
    contextValues: { case_type: "duplicate_charge", payment_method: "card" },
    monetaryMinor: 1000000 + i * 200000,
    occurredAt: "2026-06-01T00:00:00.000Z",
  }));
}

function decisionInput(overrides: Partial<DecisionInput> & { actionOverrides?: RefundOverrides } = {}): DecisionInput {
  const action = refundAction(overrides.actionOverrides ?? {});
  return {
    action,
    tenantId: "tenant_a",
    agentLifecycleState: "ACTIVE",
    delegations: [delegation],
    policies: [],
    competence: assessCompetence("agentv_0001", REGION, strongEvidence(), NOW),
    novelty: assessNovelty(action, familiarHistory(), NOW),
    epistemic: assessEpistemic(action),
    consequence: assessConsequence(action),
    verifiedRecoveryCapability: false,
    grantValiditySeconds: 300,
    ...overrides,
  };
}

function engine() {
  return new AutonomyDecisionEngine(new ManualClock(NOW), new SequentialIds());
}

test("well-evidenced familiar in-delegation refund earns high autonomy with a bounded grant", () => {
  const d = engine().decide(decisionInput());
  assert.ok(d.level >= 4, `expected L4+, got L${d.level} (ceilings: ${JSON.stringify(d.ceilings)})`);
  assert.ok(d.grant);
  assert.equal(d.grant.materialFingerprint, decisionInput().action.integrity.materialFingerprint);
  assert.equal(d.grant.maxExecutions, 1);
  assert.equal(d.grant.monitoringRequired, d.level >= 4);
});

test("no delegation -> L0 regardless of perfect competence (SPEC-000 INV-001)", () => {
  const d = engine().decide(decisionInput({ delegations: [] }));
  assert.equal(d.level, 0);
  assert.equal(d.grant, null);
  assert.match(d.hardBlockers[0] ?? "", /INV-001/);
});

test("over-delegation-amount refund is hard-blocked, not merely constrained", () => {
  const d = engine().decide(decisionInput({ actionOverrides: { amountMinor: 9000000 } }));
  assert.equal(d.level, 0);
});

test("suspended agent -> L0 (lifecycle hard blocker)", () => {
  const d = engine().decide(decisionInput({ agentLifecycleState: "SUSPENDED" }));
  assert.equal(d.level, 0);
});

test("forbidden action type in policy -> L0 (SS31)", () => {
  const policy: AutonomyPolicy = {
    policyId: "pol_forbid",
    scope: { kind: "TENANT", tenantId: "tenant_a" },
    forbiddenActionTypes: ["ISSUE_CUSTOMER_REFUND"],
    maxAutonomy: null,
    maxAmountMinor: null,
    requireApprovalAboveMinor: null,
  };
  const d = engine().decide(decisionInput({ policies: [policy] }));
  assert.equal(d.level, 0);
});

test("most restrictive applicable policy wins regardless of precedence order (SS29)", () => {
  const lax: AutonomyPolicy = {
    policyId: "pol_domain_lax",
    scope: { kind: "DOMAIN", domain: "finance" },
    forbiddenActionTypes: [],
    maxAutonomy: 5,
    maxAmountMinor: null,
    requireApprovalAboveMinor: null,
  };
  const strict: AutonomyPolicy = {
    policyId: "pol_global_strict",
    scope: { kind: "GLOBAL" },
    forbiddenActionTypes: [],
    maxAutonomy: 3,
    maxAmountMinor: null,
    requireApprovalAboveMinor: null,
  };
  const d = engine().decide(decisionInput({ policies: [lax, strict] }));
  assert.ok(d.level <= 3, `strict global cap must hold, got L${d.level}`);
});

test("approval floor: amounts above the policy threshold force L2 even when ceilings allow more", () => {
  const policy: AutonomyPolicy = {
    policyId: "pol_approval",
    scope: { kind: "TENANT", tenantId: "tenant_a" },
    forbiddenActionTypes: [],
    maxAutonomy: null,
    maxAmountMinor: null,
    requireApprovalAboveMinor: 1000000,
  };
  const d = engine().decide(decisionInput({ policies: [policy] }));
  assert.equal(d.level, 2);
  assert.equal(d.grant?.approvalRequired, true);
});

test("weak factor caps the result: no-evidence competence drags an otherwise-strong action to its ceiling (AUT-INV-006)", () => {
  const d = engine().decide(
    decisionInput({ competence: assessCompetence("agentv_0001", REGION, [], NOW) }),
  );
  assert.ok(d.level <= 2, `no-evidence competence must cap at L2, got L${d.level}`);
});

test("verified recovery capability lifts the consequence ceiling by exactly one level (AUT-INV-010)", () => {
  const without = engine().decide(decisionInput({ actionOverrides: { amountMinor: 1840000 } }));
  const withRecovery = engine().decide(
    decisionInput({ actionOverrides: { amountMinor: 1840000 }, verifiedRecoveryCapability: true }),
  );
  assert.equal(withRecovery.ceilings.consequence, Math.min(5, without.ceilings.consequence + 1));
  assert.equal(withRecovery.recoveryUpliftApplied, true);
});

test("recovery uplift never applies to irreversible effect classes (AUT-INV-013)", () => {
  const action = refundAction({
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
  });
  const d = engine().decide(
    decisionInput({
      actionOverrides: {},
      action,
      consequence: assessConsequence(action),
      verifiedRecoveryCapability: true,
    } as Partial<DecisionInput> & { actionOverrides: RefundOverrides }),
  );
  assert.equal(d.recoveryUpliftApplied, false);
  assert.ok(d.ceilings.consequence <= 2);
});

test("decisions are reproducible from identical inputs (AUT-INV-018)", () => {
  const input = decisionInput();
  const a = engine().decide(input);
  const b = engine().decide(input);
  assert.equal(a.level, b.level);
  assert.deepEqual(a.ceilings, b.ceilings);
});
