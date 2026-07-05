import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeMetrics,
  scoreAgainstGroundTruth,
  FLAGSHIP_REFUND_SCENARIOS,
  BENCHMARK_TENANT_ID,
  type BenchmarkRun,
} from "../src/research/benchmark-harness.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";
import { AgentRegistry } from "../src/agents/agent-registry.js";
import { assessCompetence } from "../src/assessment/competence.js";
import { assessNovelty } from "../src/assessment/novelty.js";
import { assessEpistemic } from "../src/assessment/epistemic.js";
import { assessConsequence } from "../src/assessment/consequence.js";
import { AutonomyDecisionEngine, type Delegation } from "../src/autonomy/decision-engine.js";
import { ToolAdapterLayer, CredentialLeaseManager, type ExternalResponse } from "../src/execution/enablement.js";
import { ExecutionGateway } from "../src/execution/gateway.js";
import { LearningPlane } from "../src/learning/learning-plane.js";
import { refundAction } from "./helpers/refund-action.js";

const REGION = "finance.refunds.customer/ISSUE_CUSTOMER_REFUND";

test("scoreAgainstGroundTruth matches expected disposition per scenario", () => {
  assert.equal(scoreAgainstGroundTruth(FLAGSHIP_REFUND_SCENARIOS[0]!, 4), true);
  assert.equal(scoreAgainstGroundTruth(FLAGSHIP_REFUND_SCENARIOS[1]!, 2), true);
  assert.equal(scoreAgainstGroundTruth(FLAGSHIP_REFUND_SCENARIOS[2]!, 0), true);
  assert.equal(scoreAgainstGroundTruth(FLAGSHIP_REFUND_SCENARIOS[0]!, 0), false);
});

test("computeMetrics never estimates counterfactual metrics as zero (RSCH-INV-006)", () => {
  const ledger = new EventLedger(new ManualClock(), new SequentialIds());
  const run: BenchmarkRun = {
    benchmarkRunId: "run_1",
    configurationUnderTest: "AEGIS_FULL",
    scenarioSeed: "seed_1",
    startedAt: "2026-07-05T00:00:00.000Z",
    completedAt: "2026-07-05T00:01:00.000Z",
    ledgerRange: { tenantId: BENCHMARK_TENANT_ID, fromEventCount: 0, toEventCount: 0 },
  };
  const metrics = computeMetrics(ledger, run);
  assert.equal(metrics.preventedExposureMinor, "UNAVAILABLE");
  assert.equal(metrics.falsePositiveInterventionCost, "UNAVAILABLE");
});

// ------------------------------------------------------- full pipeline E2E

test("end-to-end: identify -> assess -> decide -> grant -> execute -> observe -> learn, on the flagship refund benchmark", () => {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const agents = new AgentRegistry(clock, ids, ledger);
  const decisionEngine = new AutonomyDecisionEngine(clock, ids, ledger);
  const adapters = new ToolAdapterLayer();
  const leases = new CredentialLeaseManager(clock, ids);
  const gateway = new ExecutionGateway(clock, ids, ledger, agents, adapters, leases);
  const learning = new LearningPlane(clock, ids, ledger);

  const calls: Array<Record<string, unknown>> = [];
  adapters.register({
    toolAdapterId: "pay-adapter",
    toolId: "payment.refund",
    adapterVersion: "1.0.0",
    parameterRules: [
      { name: "amount", required: true, semanticType: "money" },
      { name: "customerId", required: true, semanticType: "identifier" },
    ],
    effector: (params): ExternalResponse => {
      calls.push(params);
      return { status: "SUCCEEDED", raw: { provider: "ok" }, externalReferenceId: "ext_1" };
    },
  });

  // 1. IDENTIFY
  const { agent, version } = agents.register({
    displayName: "RefundAgent",
    ownerPrincipalId: "principal_ops",
    organizationId: "org_1",
    tenantId: BENCHMARK_TENANT_ID,
    declaredCapabilities: ["customer.refund"],
    initialVersion: {
      modelIdentifier: "provider-a",
      modelVersion: "model-v3",
      systemPromptHash: "p1",
      toolConfigurationHash: "t1",
      runtimeConfigurationHash: "r1",
    },
  });
  agents.transitionLifecycle(agent.agentId, "ACTIVE", "DELEGATION_ISSUED");
  const instance = agents.startRuntimeInstance(version.agentVersionId, "prod", "secret");
  const identity = agents.resolveVerifiedIdentity(instance.runtimeInstanceId, "secret");
  assert.equal(identity.agent.agentId, agent.agentId);

  // 2. UNDERSTAND (CAM) + 3. ASSESS
  const scenario = FLAGSHIP_REFUND_SCENARIOS[0]!;
  const action = refundAction({ amountMinor: scenario.amountMinor, agentId: agent.agentId, agentVersion: version.agentVersionId });
  const strongEvidence = Array.from({ length: 40 }, (_, i) => ({
    evidenceItemId: `ce_${i}`,
    agentVersionId: version.agentVersionId,
    actionRegion: REGION,
    outcomeScore: 1,
    evidenceWeight: 1,
    fromSimulation: false,
    integrityScore: 1,
    recordedAt: "2026-07-01T00:00:00.000Z",
  }));
  const familiarHistory = Array.from({ length: 10 }, (_, i) => ({
    agentId: agent.agentId,
    actionRegion: REGION,
    contextValues: { case_type: "duplicate_charge", payment_method: "card" },
    monetaryMinor: 1000000 + i * 200000,
    occurredAt: "2026-06-01T00:00:00.000Z",
  }));

  const competence = assessCompetence(version.agentVersionId, REGION, strongEvidence, clock.now());
  const novelty = assessNovelty(action, familiarHistory, clock.now());
  const epistemic = assessEpistemic(action);
  const consequence = assessConsequence(action);

  // 4. DECIDE + 5. GRANT
  const delegation: Delegation = {
    delegationId: "del_1",
    principalId: "principal_ops",
    delegateAgentId: agent.agentId,
    capability: "customer.refund",
    maxAmountMinor: 2500000,
    environmentTypes: ["PRODUCTION"],
    validFrom: "2026-07-01T00:00:00.000Z",
    validUntil: "2026-12-31T00:00:00.000Z",
    maxAutonomy: 5,
    revoked: false,
  };
  const decision = decisionEngine.decide({
    action,
    tenantId: BENCHMARK_TENANT_ID,
    agentLifecycleState: identity.agent.lifecycleState,
    delegations: [delegation],
    policies: [],
    competence,
    novelty,
    epistemic,
    consequence,
    verifiedRecoveryCapability: false,
    grantValiditySeconds: 300,
  });
  assert.ok(decision.grant, `expected a non-null grant, blockers: ${decision.hardBlockers.join("; ")}`);
  assert.ok(scoreAgainstGroundTruth(scenario, decision.level), `decision L${decision.level} should match ground truth for "${scenario.scenarioId}"`);

  // 6. VERIFY + 7. EXECUTE
  const attempt = gateway.execute({
    action,
    grant: decision.grant!,
    runtimeInstanceId: instance.runtimeInstanceId,
    presentedCredential: "secret",
    approvalSatisfiedForFingerprint: null,
    monitoringReady: true,
    recoveryReady: true,
  });
  assert.equal(attempt.outcomeStatus, "SUCCEEDED");
  assert.equal(calls.length, 1);

  // 8. OBSERVE + LEARN
  const { evidence } = learning.process({
    subjectType: "EXECUTION_ATTEMPT",
    subjectId: attempt.executionAttemptId,
    tenantId: BENCHMARK_TENANT_ID,
    agentId: agent.agentId,
    agentVersionId: version.agentVersionId,
    actionRegion: REGION,
    executionOutcome: "SUCCEEDED",
    providerFailure: false,
    humanModifiedAction: false,
    sentinelIntervened: false,
    recoveryRan: false,
    fromSimulation: false,
    observationSourceId: "provider-ledger",
    observationSourceIndependent: true,
  });
  assert.equal(evidence?.outcomeScore, 1);

  // Full causal chain reconstructs gap-free straight from the ledger.
  const reconstruction = ledger.reconstruct(BENCHMARK_TENANT_ID, action.identity.actionId);
  assert.equal(reconstruction.completenessStatus, "COMPLETE", reconstruction.detectedGaps.join("; "));

  const run: BenchmarkRun = {
    benchmarkRunId: "run_e2e",
    configurationUnderTest: "AEGIS_FULL",
    scenarioSeed: scenario.scenarioId,
    startedAt: "2026-07-05T00:00:00.000Z",
    completedAt: clock.now(),
    ledgerRange: { tenantId: BENCHMARK_TENANT_ID, fromEventCount: 0, toEventCount: ledger.size },
  };
  const metrics = computeMetrics(ledger, run);
  assert.equal(metrics.usefulWorkCompleted, 1);
  assert.equal(metrics.policyViolationRate, 0);
});

test("end-to-end: no-delegation scenario is hard-blocked before ever reaching the gateway", () => {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const decisionEngine = new AutonomyDecisionEngine(clock, ids, ledger);

  const scenario = FLAGSHIP_REFUND_SCENARIOS[2]!;
  const action = refundAction({ amountMinor: scenario.amountMinor });
  const decision = decisionEngine.decide({
    action,
    tenantId: BENCHMARK_TENANT_ID,
    agentLifecycleState: "ACTIVE",
    delegations: [], // no delegation exists
    policies: [],
    competence: assessCompetence(action.lineage.actor.agentVersion, REGION, [], clock.now()),
    novelty: assessNovelty(action, [], clock.now()),
    epistemic: assessEpistemic(action),
    consequence: assessConsequence(action),
    verifiedRecoveryCapability: false,
    grantValiditySeconds: 300,
  });
  assert.equal(decision.level, 0);
  assert.equal(decision.grant, null);
  assert.ok(scoreAgainstGroundTruth(scenario, decision.level));
  void ledger;
});
