import {
  ManualClock,
  SequentialIds,
  EventLedger,
  AgentRegistry,
  assessCompetence,
  assessNovelty,
  assessEpistemic,
  assessConsequence,
  AutonomyDecisionEngine,
  ToolAdapterLayer,
  CredentialLeaseManager,
  ExecutionGateway,
  LearningPlane,
  computeMetrics,
  scoreAgainstGroundTruth,
  FLAGSHIP_REFUND_SCENARIOS,
  BENCHMARK_TENANT_ID,
  type Delegation,
  type ExternalResponse,
  type RefundScenario,
  type CompetenceEvidenceInput,
  type HistoricalActionRecord,
  type ResearchMetrics,
  type CeilingBreakdown,
} from "@aegis/core";
import { finalizeCanonicalAction, type CanonicalAction, type UnfingerprintedCanonicalAction } from "@aegis/contracts";

const REGION = "finance.refunds.customer/ISSUE_CUSTOMER_REFUND";

function buildRefundAction(scenario: RefundScenario, agentId: string, agentVersionId: string, createdAt: string): CanonicalAction {
  const draft: UnfingerprintedCanonicalAction = {
    identity: {
      actionId: `act_${scenario.scenarioId}`,
      actionVersion: 1,
      proposalId: `prop_${scenario.scenarioId}`,
      correlationId: `corr_${scenario.scenarioId}`,
      status: "CANONICALIZED",
      createdAt,
    },
    lineage: {
      actor: { agentId, agentVersion: agentVersionId, configurationIdentity: { toolsetVersion: "1", runtimeConfigVersion: "1" } },
      principalId: "principal_ops",
      triggerType: "AGENT_INITIATED",
    },
    purpose: { statedGoal: scenario.description },
    operation: {
      domain: "finance.refunds.customer",
      capability: "customer.refund",
      actionType: "ISSUE_CUSTOMER_REFUND",
      operationClass: "TRANSFER",
      semanticVerb: "refund",
      tool: { toolId: "payment.refund", toolVersion: "3.2", adapterId: "pay-adapter", adapterVersion: "1.0.0" },
      parameters: [
        {
          name: "amount",
          semanticType: "money",
          value: scenario.amountMinor,
          unit: "INR",
          decisionRelevance: "CRITICAL",
          mutable: true,
          materialityRule: { parameterName: "amount", materiality: "THRESHOLD", threshold: 100 },
        },
        {
          name: "customerId",
          semanticType: "identifier",
          value: "cust_829",
          decisionRelevance: "CRITICAL",
          mutable: false,
          materialityRule: { parameterName: "customerId", materiality: "ALWAYS" },
        },
      ],
      taxonomyVersion: "taxonomy-v1",
    },
    targets: [
      { targetId: "cust_829", targetType: "CUSTOMER", role: "BENEFICIARY", scope: { bounded: true, knownCount: 1 }, attributes: {} },
    ],
    context: {
      structured: { case_type: "duplicate_charge", payment_method: "card" },
      environment: { environmentType: "PRODUCTION", healthStatus: "NORMAL" },
      temporal: { proposedAt: createdAt, urgency: "NORMAL" },
    },
    evidence: [
      { evidenceId: "ev_1", evidenceType: "DATABASE_RECORD", sourceId: "payments-db", freshnessStatus: "FRESH", claimRefs: ["claim_1"] },
      { evidenceId: "ev_2", evidenceType: "API_RESPONSE", sourceId: "payment-provider", freshnessStatus: "FRESH", claimRefs: ["claim_1"] },
    ],
    claims: [{ claimId: "claim_1", statement: "Customer was charged twice", importance: "CRITICAL", evidenceRefs: ["ev_1", "ev_2"] }],
    effects: [
      {
        effectId: "eff_1",
        effectType: "FINANCIAL_TRANSFER",
        direction: "OUTBOUND",
        magnitude: { type: "MONETARY", amountMinor: scenario.amountMinor, currency: "INR" },
        affectedTargetRefs: ["cust_829"],
        certainty: "EXPECTED",
        source: "TOOL_METADATA",
      },
    ],
    sequence: { priorActionIds: [] },
    execution: {
      executionType: "API_CALL",
      effectorId: "pay-adapter",
      idempotencySupport: "NATIVE",
      simulationSupport: "FULL",
      compensationSupport: "FULL",
      executionConstraints: [],
    },
    provenance: {
      "operation.parameters.amount": { fieldPath: "operation.parameters.amount", origin: "AGENT_SUPPLIED", producedAt: createdAt, validationStatus: "VALIDATED" },
      "operation.parameters.customerId": { fieldPath: "operation.parameters.customerId", origin: "TOOL_SCHEMA", producedAt: createdAt, validationStatus: "VALIDATED" },
    },
    integrity: { schemaVersion: "cam-schema-v1", taxonomyVersion: "taxonomy-v1", adapterVersion: "1.0.0", normalizerVersion: "1.0.0", normalizationInputHash: "n/a" },
    metadata: {},
  };
  return finalizeCanonicalAction(draft, { scenario: scenario.scenarioId });
}

export interface ScenarioTrace {
  scenario: RefundScenario;
  agentId: string;
  agentVersionId: string;
  ceilings: CeilingBreakdown;
  hardBlockers: string[];
  level: number;
  levelName: string;
  matchesGroundTruth: boolean;
  grantId: string | null;
  executionOutcome: "SUCCEEDED" | "FAILED" | "UNKNOWN" | "NOT_EXECUTED";
  reconstructionComplete: boolean;
  competenceEstimate: number;
  competenceStatus: string;
  noveltyScore: number;
  uncertaintyLevel: string;
  consequenceSeverity: string;
  reversibility: string;
}

export interface BenchmarkSuiteResult {
  runAt: string;
  scenarios: ScenarioTrace[];
  metrics: ResearchMetrics;
  totalLedgerEvents: number;
}

/**
 * Runs every flagship scenario through the full governed pipeline
 * (identify -> assess -> decide -> grant -> execute -> observe -> learn)
 * against one shared ledger, then computes SPEC-018 metrics over it.
 */
export function runBenchmarkSuite(): BenchmarkSuiteResult {
  const clock = new ManualClock("2026-07-05T00:00:00.000Z");
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const agents = new AgentRegistry(clock, ids, ledger);
  const decisionEngine = new AutonomyDecisionEngine(clock, ids, ledger);
  const adapters = new ToolAdapterLayer();
  const leases = new CredentialLeaseManager(clock, ids);
  const gateway = new ExecutionGateway(clock, ids, ledger, agents, adapters, leases);
  const learning = new LearningPlane(clock, ids, ledger);

  adapters.register({
    toolAdapterId: "pay-adapter",
    toolId: "payment.refund",
    adapterVersion: "1.0.0",
    parameterRules: [
      { name: "amount", required: true, semanticType: "money" },
      { name: "customerId", required: true, semanticType: "identifier" },
    ],
    effector: (): ExternalResponse => ({ status: "SUCCEEDED", raw: { provider: "ok" }, externalReferenceId: "ext_sim" }),
  });

  const { agent, version } = agents.register({
    displayName: "RefundAgent",
    ownerPrincipalId: "principal_ops",
    organizationId: "org_demo",
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
  const instance = agents.startRuntimeInstance(version.agentVersionId, "vercel-demo", "secret");
  const identity = agents.resolveVerifiedIdentity(instance.runtimeInstanceId, "secret");

  const strongEvidence: CompetenceEvidenceInput[] = Array.from({ length: 40 }, (_, i) => ({
    evidenceItemId: `ce_${i}`,
    agentVersionId: version.agentVersionId,
    actionRegion: REGION,
    outcomeScore: 1,
    evidenceWeight: 1,
    fromSimulation: false,
    integrityScore: 1,
    recordedAt: "2026-07-01T00:00:00.000Z",
  }));
  const familiarHistory: HistoricalActionRecord[] = Array.from({ length: 10 }, (_, i) => ({
    agentId: agent.agentId,
    actionRegion: REGION,
    contextValues: { case_type: "duplicate_charge", payment_method: "card" },
    monetaryMinor: 1000000 + i * 200000,
    occurredAt: "2026-06-01T00:00:00.000Z",
  }));

  // Only the first scenario's amount is "familiar"; the others are
  // deliberately outside/absent delegation scope so the dashboard shows
  // the full spread of dispositions, not just the happy path.
  const delegation: Delegation = {
    delegationId: "del_1",
    principalId: "principal_ops",
    delegateAgentId: agent.agentId,
    capability: "customer.refund",
    // Covers all three flagship scenarios' amounts so the dashboard shows
    // the assessment engines actually constraining autonomy (novelty,
    // consequence) rather than an authority hard-block masking them.
    maxAmountMinor: 10000000,
    environmentTypes: ["PRODUCTION"],
    validFrom: "2026-07-01T00:00:00.000Z",
    validUntil: "2026-12-31T00:00:00.000Z",
    maxAutonomy: 5,
    revoked: false,
  };

  const scenarios: ScenarioTrace[] = [];

  for (const scenario of FLAGSHIP_REFUND_SCENARIOS) {
    const action = buildRefundAction(scenario, agent.agentId, version.agentVersionId, clock.now());
    const competence = assessCompetence(version.agentVersionId, REGION, strongEvidence, clock.now());
    const novelty = assessNovelty(action, familiarHistory, clock.now());
    const epistemic = assessEpistemic(action);
    const consequence = assessConsequence(action);

    // "no-delegation" scenario intentionally omits the delegation to
    // demonstrate the SPEC-000 INV-001 hard block.
    const delegations = scenario.scenarioId === "no-delegation-refund" ? [] : [delegation];

    const decision = decisionEngine.decide({
      action,
      tenantId: BENCHMARK_TENANT_ID,
      agentLifecycleState: identity.agent.lifecycleState,
      delegations,
      policies: [],
      competence,
      novelty,
      epistemic,
      consequence,
      verifiedRecoveryCapability: false,
      grantValiditySeconds: 300,
    });

    let executionOutcome: ScenarioTrace["executionOutcome"] = "NOT_EXECUTED";
    if (decision.grant && decision.level >= 3) {
      const attempt = gateway.execute({
        action,
        grant: decision.grant,
        runtimeInstanceId: instance.runtimeInstanceId,
        presentedCredential: "secret",
        approvalSatisfiedForFingerprint: null,
        monitoringReady: true,
        recoveryReady: true,
      });
      executionOutcome = attempt.outcomeStatus ?? "NOT_EXECUTED";
      learning.process({
        subjectType: "EXECUTION_ATTEMPT",
        subjectId: attempt.executionAttemptId,
        tenantId: BENCHMARK_TENANT_ID,
        agentId: agent.agentId,
        agentVersionId: version.agentVersionId,
        actionRegion: REGION,
        executionOutcome: attempt.outcomeStatus === "UNKNOWN" ? "UNKNOWN" : attempt.outcomeStatus === "SUCCEEDED" ? "SUCCEEDED" : "FAILED",
        providerFailure: false,
        humanModifiedAction: false,
        sentinelIntervened: false,
        recoveryRan: false,
        fromSimulation: false,
        observationSourceId: "provider-ledger",
        observationSourceIndependent: true,
      });
    }

    const reconstruction = ledger.reconstruct(BENCHMARK_TENANT_ID, action.identity.actionId);

    scenarios.push({
      scenario,
      agentId: agent.agentId,
      agentVersionId: version.agentVersionId,
      ceilings: decision.ceilings,
      hardBlockers: decision.hardBlockers,
      level: decision.level,
      levelName: decision.levelName,
      matchesGroundTruth: scoreAgainstGroundTruth(scenario, decision.level),
      grantId: decision.grant?.grantId ?? null,
      executionOutcome,
      reconstructionComplete: reconstruction.completenessStatus === "COMPLETE",
      competenceEstimate: competence.estimate,
      competenceStatus: competence.status,
      noveltyScore: novelty.noveltyScore,
      uncertaintyLevel: epistemic.uncertaintyLevel,
      consequenceSeverity: consequence.severity,
      reversibility: consequence.reversibility,
    });
  }

  const metrics = computeMetrics(ledger, {
    benchmarkRunId: "vercel-demo-run",
    configurationUnderTest: "AEGIS_FULL",
    scenarioSeed: "flagship-v1",
    startedAt: "2026-07-05T00:00:00.000Z",
    completedAt: clock.now(),
    ledgerRange: { tenantId: BENCHMARK_TENANT_ID, fromEventCount: 0, toEventCount: ledger.size },
  });

  return { runAt: clock.now(), scenarios, metrics, totalLedgerEvents: ledger.size };
}
