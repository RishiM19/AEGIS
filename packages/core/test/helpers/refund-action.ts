import { finalizeCanonicalAction, type CanonicalAction, type UnfingerprintedCanonicalAction } from "@aegis/contracts";

export interface RefundOverrides {
  amountMinor?: number;
  actionId?: string;
  agentId?: string;
  agentVersion?: string;
  environmentType?: "PRODUCTION" | "SANDBOX";
  compensationSupport?: "FULL" | "PARTIAL" | "NONE" | "UNKNOWN";
  boundedTargets?: boolean;
  contextValues?: Record<string, string | number | boolean | null>;
  claims?: CanonicalAction["claims"];
  evidence?: CanonicalAction["evidence"];
  effects?: CanonicalAction["effects"] | "NONE";
}

/** Builds a finalized flagship-benchmark refund action for engine tests. */
export function refundAction(o: RefundOverrides = {}): CanonicalAction {
  const amountMinor = o.amountMinor ?? 1840000;
  const draft: UnfingerprintedCanonicalAction = {
    identity: {
      actionId: o.actionId ?? "act_r1",
      actionVersion: 1,
      proposalId: "prop_1",
      correlationId: "corr_1",
      status: "CANONICALIZED",
      createdAt: "2026-07-05T00:00:00.000Z",
    },
    lineage: {
      actor: {
        agentId: o.agentId ?? "agent_refund",
        agentVersion: o.agentVersion ?? "agentv_0001",
        configurationIdentity: { toolsetVersion: "1", runtimeConfigVersion: "1" },
      },
      principalId: "principal_ops",
      triggerType: "AGENT_INITIATED",
    },
    purpose: { statedGoal: "Resolve duplicate-charge complaint" },
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
          value: amountMinor,
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
      {
        targetId: "cust_829",
        targetType: "CUSTOMER",
        role: "BENEFICIARY",
        scope: { bounded: o.boundedTargets ?? true, knownCount: 1 },
        attributes: {},
      },
    ],
    context: {
      structured: o.contextValues ?? { case_type: "duplicate_charge", payment_method: "card" },
      environment: { environmentType: o.environmentType ?? "PRODUCTION", healthStatus: "NORMAL" },
      temporal: { proposedAt: "2026-07-05T00:00:00.000Z", urgency: "NORMAL" },
    },
    evidence: o.evidence ?? [
      {
        evidenceId: "ev_1",
        evidenceType: "DATABASE_RECORD",
        sourceId: "payments-db",
        freshnessStatus: "FRESH",
        claimRefs: ["claim_1"],
      },
      {
        evidenceId: "ev_2",
        evidenceType: "API_RESPONSE",
        sourceId: "payment-provider",
        freshnessStatus: "FRESH",
        claimRefs: ["claim_1"],
      },
    ],
    claims: o.claims ?? [
      { claimId: "claim_1", statement: "Customer was charged twice", importance: "CRITICAL", evidenceRefs: ["ev_1", "ev_2"] },
    ],
    effects:
      o.effects === "NONE"
        ? []
        : o.effects ?? [
            {
              effectId: "eff_1",
              effectType: "FINANCIAL_TRANSFER",
              direction: "OUTBOUND",
              magnitude: { type: "MONETARY", amountMinor, currency: "INR" },
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
      compensationSupport: o.compensationSupport ?? "FULL",
      executionConstraints: [],
    },
    provenance: {
      "operation.parameters.amount": {
        fieldPath: "operation.parameters.amount",
        origin: "AGENT_SUPPLIED",
        producedAt: "2026-07-05T00:00:00.000Z",
        validationStatus: "VALIDATED",
      },
      "operation.parameters.customerId": {
        fieldPath: "operation.parameters.customerId",
        origin: "TOOL_SCHEMA",
        producedAt: "2026-07-05T00:00:00.000Z",
        validationStatus: "VALIDATED",
      },
    },
    integrity: {
      schemaVersion: "cam-schema-v1",
      taxonomyVersion: "taxonomy-v1",
      adapterVersion: "1.0.0",
      normalizerVersion: "1.0.0",
      normalizationInputHash: "n/a",
    },
    metadata: {},
  };
  return finalizeCanonicalAction(draft, { fixture: "refund", amountMinor });
}
