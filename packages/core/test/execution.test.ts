import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ToolAdapterLayer,
  CredentialLeaseManager,
  SimulationRuntime,
  SimulationUnavailable,
  AdapterRegistrationRejected,
  type ExternalResponse,
} from "../src/execution/enablement.js";
import { ExecutionGateway, ExecutionRejected, type ExecutionRequest } from "../src/execution/gateway.js";
import { AgentRegistry } from "../src/agents/agent-registry.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";
import type { AutonomyGrant } from "../src/autonomy/decision-engine.js";
import { refundAction } from "./helpers/refund-action.js";

function harness() {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const agents = new AgentRegistry(clock, ids, ledger);
  const adapters = new ToolAdapterLayer();
  const leases = new CredentialLeaseManager(clock, ids);
  const gateway = new ExecutionGateway(clock, ids, ledger, agents, adapters, leases);

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

  const { agent, version } = agents.register({
    displayName: "RefundAgent",
    ownerPrincipalId: "principal_ops",
    organizationId: "org_1",
    tenantId: "tenant_a",
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

  return { clock, ledger, agents, adapters, leases, gateway, agent, version, instance, calls };
}

function grantFor(h: ReturnType<typeof harness>, action = refundAction(), level: 2 | 3 | 4 | 5 = 5): AutonomyGrant {
  return {
    grantId: "grant_1",
    actionId: action.identity.actionId,
    agentId: h.agent.agentId,
    agentVersionId: h.version.agentVersionId,
    tenantId: "tenant_a",
    materialFingerprint: action.integrity.materialFingerprint,
    level,
    levelName: `L${level}`,
    maxAmountMinor: 2500000,
    allowedToolId: "payment.refund",
    allowedEnvironment: "PRODUCTION",
    issuedAt: h.clock.now(),
    expiresAt: "2026-07-05T01:00:00.000Z",
    maxExecutions: 1,
    executionsUsed: 0,
    revoked: false,
    monitoringRequired: level >= 4,
    approvalRequired: level === 2,
    recoveryRequired: false,
  };
}

function requestFor(h: ReturnType<typeof harness>, grant: AutonomyGrant, action = refundAction()): ExecutionRequest {
  return {
    action,
    grant,
    runtimeInstanceId: h.instance.runtimeInstanceId,
    presentedCredential: "secret",
    approvalSatisfiedForFingerprint: null,
    monitoringReady: true,
    recoveryReady: true,
  };
}

// --------------------------------------------------------------- happy path

test("verified in-scope execution dispatches once, records verbatim response, and reaches the ledger", () => {
  const h = harness();
  const action = refundAction();
  const attempt = h.gateway.execute(requestFor(h, grantFor(h, action), action));
  assert.equal(attempt.outcomeStatus, "SUCCEEDED");
  assert.deepEqual(attempt.externalResponse?.raw, { provider: "ok" });
  assert.equal(h.calls.length, 1);
  const types = h.ledger.eventsForTenant("tenant_a").map((e) => e.eventType);
  assert.ok(types.includes("EXECUTION_STARTED") && types.includes("SIDE_EFFECT_OBSERVED") && types.includes("EXECUTION_COMPLETED"));
});

// ------------------------------------------------------------ enforcement

test("materially mutated action cannot execute under the earlier grant (EXE-INV-005)", () => {
  const h = harness();
  const original = refundAction({ amountMinor: 1840000 });
  const mutated = refundAction({ amountMinor: 2400000 });
  const grant = grantFor(h, original);
  assert.throws(() => h.gateway.execute(requestFor(h, grant, mutated)), (e: ExecutionRejected) => e.invariant === "EXE-INV-005");
  assert.equal(h.calls.length, 0, "no external side effect occurred");
});

test("expired grants never execute (EXE-INV-008)", () => {
  const h = harness();
  const action = refundAction();
  const grant = grantFor(h, action);
  h.clock.set("2026-07-05T02:00:00.000Z");
  assert.throws(() => h.gateway.execute(requestFor(h, grant, action)), (e: ExecutionRejected) => e.invariant === "EXE-INV-008");
});

test("single-use grants execute at most once; identical retry returns the recorded attempt (EXE-INV-010/022)", () => {
  const h = harness();
  const action = refundAction();
  const grant = grantFor(h, action);
  const first = h.gateway.execute(requestFor(h, grant, action));
  const second = h.gateway.execute(requestFor(h, grant, action));
  assert.equal(second.executionAttemptId, first.executionAttemptId);
  assert.equal(h.calls.length, 1, "retry must not duplicate the side effect");
});

test("wrong credential is a hard identity block (EXE-INV-016)", () => {
  const h = harness();
  const action = refundAction();
  const req = { ...requestFor(h, grantFor(h, action), action), presentedCredential: "stolen" };
  assert.throws(() => h.gateway.execute(req), /AGENT_UNKNOWN/);
});

test("suspended agent cannot execute even with a still-valid grant (SPEC-002 SS6.4)", () => {
  const h = harness();
  const action = refundAction();
  const grant = grantFor(h, action);
  h.agents.transitionLifecycle(h.agent.agentId, "CONSTRAINED", "AUTOMATIC");
  h.agents.transitionLifecycle(h.agent.agentId, "SUSPENDED", "AUTOMATIC");
  assert.throws(() => h.gateway.execute(requestFor(h, grant, action)), (e: ExecutionRejected) => e.invariant === "EXE-INV-002");
});

test("L2 grant without a matching approval fails closed (EXE-INV-013)", () => {
  const h = harness();
  const action = refundAction();
  const grant = grantFor(h, action, 2);
  assert.throws(() => h.gateway.execute(requestFor(h, grant, action)), (e: ExecutionRejected) => e.invariant === "EXE-INV-013");
  const ok = h.gateway.execute({
    ...requestFor(h, grant, action),
    approvalSatisfiedForFingerprint: action.integrity.materialFingerprint,
  });
  assert.equal(ok.outcomeStatus, "SUCCEEDED");
});

test("L4 grant without monitoring readiness fails closed (EXE-INV-014)", () => {
  const h = harness();
  const action = refundAction();
  const grant = grantFor(h, action, 4);
  assert.throws(
    () => h.gateway.execute({ ...requestFor(h, grant, action), monitoringReady: false }),
    (e: ExecutionRejected) => e.invariant === "EXE-INV-014",
  );
});

test("ambiguous external response reconciles to UNKNOWN, never assumed success (SPEC-000 SS16.4)", () => {
  const h = harness();
  h.adapters.register({
    toolAdapterId: "flaky",
    toolId: "payment.refund",
    adapterVersion: "1.0.1",
    parameterRules: [
      { name: "amount", required: true, semanticType: "money" },
      { name: "customerId", required: true, semanticType: "identifier" },
    ],
    effector: () => ({ status: "TIMEOUT", raw: { note: "socket timeout" }, externalReferenceId: null }),
  });
  const action = refundAction();
  const attempt = h.gateway.execute(requestFor(h, grantFor(h, action), action));
  assert.equal(attempt.outcomeStatus, "UNKNOWN");
});

// ------------------------------------------------------------- enablement

test("adapter with an open schema is rejected at registration (ENA-INV-002)", () => {
  const h = harness();
  assert.throws(
    () =>
      h.adapters.register({
        toolAdapterId: "wildcard",
        toolId: "anything.goes",
        adapterVersion: "1",
        parameterRules: [],
        effector: () => ({ status: "SUCCEEDED", raw: {}, externalReferenceId: null }),
      }),
    AdapterRegistrationRejected,
  );
});

test("simulation is unavailable for tools without verified simulation capability (SPEC-012 SS5.3)", () => {
  const clock = new ManualClock();
  const sim = new SimulationRuntime(clock, new SequentialIds());
  const action = refundAction();
  const session = sim.simulate(action);
  assert.equal(session.predictedEffects[0]?.predicted, true);

  const noSim = refundAction();
  (noSim.execution as { simulationSupport: string }).simulationSupport = "NONE";
  assert.throws(() => sim.simulate(noSim), SimulationUnavailable);
});
