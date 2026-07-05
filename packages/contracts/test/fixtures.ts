import type { CanonicalParameter, UnfingerprintedCanonicalAction } from "../src/cam-types.js";

/**
 * A minimal, valid draft refund action matching the flagship benchmark
 * (AEGIS-RESEARCH-THESIS.md SS5). Used as the shared base fixture across
 * this package's tests.
 */
export function buildRefundDraft(overrides?: {
  amountMinor?: number;
  actionVersion?: number;
  actionId?: string;
}): UnfingerprintedCanonicalAction {
  const amountMinor = overrides?.amountMinor ?? 1840000; // INR 18,400.00

  const amountParam: CanonicalParameter = {
    name: "amount",
    semanticType: "money",
    value: amountMinor,
    unit: "INR",
    decisionRelevance: "CRITICAL",
    mutable: true,
    materialityRule: { parameterName: "amount", materiality: "THRESHOLD", threshold: 100 },
  };

  const customerIdParam: CanonicalParameter = {
    name: "customerId",
    semanticType: "identifier",
    value: "cust_829",
    decisionRelevance: "CRITICAL",
    mutable: false,
    materialityRule: { parameterName: "customerId", materiality: "ALWAYS" },
  };

  return {
    identity: {
      actionId: overrides?.actionId ?? "act_0001",
      actionVersion: overrides?.actionVersion ?? 1,
      proposalId: "prop_0001",
      correlationId: "corr_0001",
      status: "PROPOSED",
      createdAt: "2026-07-05T00:00:00.000Z",
    },
    lineage: {
      actor: {
        agentId: "agent_refund_v4",
        agentVersion: "4",
        configurationIdentity: {
          toolsetVersion: "1.0.0",
          runtimeConfigVersion: "1.0.0",
        },
      },
      principalId: "principal_ops_manager",
      triggerType: "AGENT_INITIATED",
    },
    purpose: {
      statedGoal: "Resolve duplicate-charge complaint CASE-829",
    },
    operation: {
      domain: "finance.refunds.customer",
      capability: "customer.refund",
      actionType: "ISSUE_CUSTOMER_REFUND",
      operationClass: "TRANSFER",
      semanticVerb: "refund",
      tool: {
        toolId: "payment.refund",
        toolVersion: "3.2",
        adapterId: "stripe-refund-adapter",
        adapterVersion: "1.0.0",
      },
      parameters: [amountParam, customerIdParam],
      taxonomyVersion: "taxonomy-v1",
    },
    targets: [
      {
        targetId: "cust_829",
        targetType: "CUSTOMER",
        role: "BENEFICIARY",
        scope: { bounded: true, knownCount: 1 },
        attributes: {},
      },
    ],
    context: {
      structured: { case_type: "duplicate_charge", payment_method: "card" },
      environment: { environmentType: "PRODUCTION", healthStatus: "NORMAL" },
      temporal: { proposedAt: "2026-07-05T00:00:00.000Z", urgency: "NORMAL" },
    },
    evidence: [],
    effects: [
      {
        effectId: "eff_0001",
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
      effectorId: "stripe-refund-adapter",
      idempotencySupport: "NATIVE",
      simulationSupport: "FULL",
      compensationSupport: "FULL",
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
      normalizationInputHash: "irrelevant-for-tests",
    },
    metadata: {},
  };
}
