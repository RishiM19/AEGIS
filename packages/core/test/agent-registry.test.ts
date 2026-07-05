import { test } from "node:test";
import assert from "node:assert/strict";
import { AgentRegistry, AgentUnknown } from "../src/agents/agent-registry.js";
import { EventLedger } from "../src/ledger/event-ledger.js";
import { ManualClock, SequentialIds } from "../src/kernel/clock.js";

function setup() {
  const clock = new ManualClock();
  const ids = new SequentialIds();
  const ledger = new EventLedger(clock, ids);
  const registry = new AgentRegistry(clock, ids, ledger);
  const { agent, version } = registry.register({
    displayName: "RefundAgent",
    ownerPrincipalId: "principal_ops",
    organizationId: "org_1",
    tenantId: "tenant_a",
    declaredCapabilities: ["customer.refund"],
    initialVersion: {
      modelIdentifier: "provider-a",
      modelVersion: "model-v3",
      systemPromptHash: "sha_p1",
      toolConfigurationHash: "sha_t1",
      runtimeConfigurationHash: "sha_r1",
    },
  });
  return { registry, ledger, agent, version };
}

test("identity verification failure is a hard block, never a degraded default (AGENT-INV-006)", () => {
  const { registry, version } = setup();
  const instance = registry.startRuntimeInstance(version.agentVersionId, "prod-cluster-1", "secret_ok");
  assert.throws(() => registry.resolveVerifiedIdentity(instance.runtimeInstanceId, "wrong_secret"), AgentUnknown);
  assert.throws(() => registry.resolveVerifiedIdentity("inst_nonexistent", "secret_ok"), AgentUnknown);
});

test("verified identity resolves agent + version + instance as distinct objects (AGENT-INV-002)", () => {
  const { registry, agent, version } = setup();
  const instance = registry.startRuntimeInstance(version.agentVersionId, "prod-cluster-1", "secret_ok");
  const resolved = registry.resolveVerifiedIdentity(instance.runtimeInstanceId, "secret_ok");
  assert.equal(resolved.agent.agentId, agent.agentId);
  assert.equal(resolved.version.agentVersionId, version.agentVersionId);
  assert.equal(resolved.instance.runtimeInstanceId, instance.runtimeInstanceId);
});

test("new version on config change: competence transfer defaults to NONE (AGENT-INV-003)", () => {
  const { registry, agent, version } = setup();
  const v2 = registry.createVersion(agent.agentId, {
    modelIdentifier: "provider-a",
    modelVersion: "model-v4",
    systemPromptHash: "sha_p1",
    toolConfigurationHash: "sha_t1",
    runtimeConfigurationHash: "sha_r1",
  });
  assert.equal(v2.competenceTransferPolicy, null);
  assert.equal(registry.getVersion(version.agentVersionId)?.supersededAt !== null, true);
  assert.equal(registry.getAgent(agent.agentId)?.currentVersionId, v2.agentVersionId);
});

test("identical configuration is refused as a new version (SPEC-002 SS5.3)", () => {
  const { registry, agent } = setup();
  assert.throws(
    () =>
      registry.createVersion(agent.agentId, {
        modelIdentifier: "provider-a",
        modelVersion: "model-v3",
        systemPromptHash: "sha_p1",
        toolConfigurationHash: "sha_t1",
        runtimeConfigurationHash: "sha_r1",
      }),
    /identical/,
  );
});

test("lifecycle transitions flow through the contracts authority table (AGENT-INV-004)", () => {
  const { registry, agent } = setup();
  registry.transitionLifecycle(agent.agentId, "ACTIVE", "DELEGATION_ISSUED");
  registry.transitionLifecycle(agent.agentId, "CONSTRAINED", "AUTOMATIC");
  registry.transitionLifecycle(agent.agentId, "SUSPENDED", "AUTOMATIC");
  assert.throws(() => registry.transitionLifecycle(agent.agentId, "ACTIVE", "AUTOMATIC"), /HUMAN_REVIEW/);
  registry.transitionLifecycle(agent.agentId, "ACTIVE", "HUMAN_REVIEW");
  assert.equal(registry.lifecycleState(agent.agentId), "ACTIVE");
});

test("lifecycle transitions and identity events reach the ledger (SPEC-002 SS10)", () => {
  const { registry, ledger, agent, version } = setup();
  registry.transitionLifecycle(agent.agentId, "ACTIVE", "DELEGATION_ISSUED");
  const instance = registry.startRuntimeInstance(version.agentVersionId, "prod", "s");
  registry.resolveVerifiedIdentity(instance.runtimeInstanceId, "s");
  const types = ledger.eventsForTenant("tenant_a").map((e) => e.eventType);
  for (const expected of [
    "AGENT_REGISTERED",
    "AGENT_VERSION_CREATED",
    "AGENT_LIFECYCLE_TRANSITIONED",
    "AGENT_RUNTIME_INSTANCE_STARTED",
    "AGENT_IDENTITY_VERIFIED",
  ]) {
    assert.ok(types.includes(expected), `missing ledger event ${expected}`);
  }
});
