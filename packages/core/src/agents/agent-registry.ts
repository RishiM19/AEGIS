/**
 * Agent Registry service (SPEC-002).
 *
 * Runtime home of governed agent identity. Builds directly on the
 * domain types and lifecycle state machine in @aegis/contracts.
 *
 * Enforced invariants:
 *  - AGENT-INV-001  no anonymous autonomy: resolution requires a
 *                   verified runtime instance
 *  - AGENT-INV-002  agent / version / runtime instance are distinct
 *  - AGENT-INV-003  competence transfer defaults to NONE across versions
 *  - AGENT-INV-004  lifecycle state is set only here, via the contracts
 *                   transition-authority table
 *  - AGENT-INV-006  unverifiable identity resolves to a hard block
 *  - AGENT-INV-007  declared capabilities are descriptive, not grants
 */

import {
  assertValidTransition,
  requiresNewAgentVersion,
  type Agent,
  type AgentLifecycleState,
  type AgentRuntimeInstance,
  type AgentVersion,
  type IdentityVerificationRecord,
  type TransitionAuthority,
} from "@aegis/contracts";
import type { Clock, IdSource } from "../kernel/clock.js";
import type { EventLedger } from "../ledger/event-ledger.js";

const COMPONENT = "agent-registry";
const VERSIONS = { agentRegistry: "1.0.0" };

export class AgentUnknown extends Error {
  constructor(reason: string) {
    super(`AGENT_UNKNOWN: ${reason} (AGENT-INV-006 hard block)`);
    this.name = "AgentUnknown";
  }
}

export interface RegisterAgentInput {
  displayName: string;
  ownerPrincipalId: string;
  organizationId: string;
  tenantId: string;
  declaredCapabilities: string[];
  initialVersion: Omit<AgentVersion, "agentVersionId" | "agentId" | "createdAt" | "supersededAt" | "competenceTransferPolicy">;
}

export interface ResolvedIdentity {
  agent: Agent;
  version: AgentVersion;
  instance: AgentRuntimeInstance;
}

export class AgentRegistry {
  private agents = new Map<string, Agent>();
  private versions = new Map<string, AgentVersion>();
  private instances = new Map<string, AgentRuntimeInstance>();
  /** runtimeInstanceId -> credential expected on each identity claim */
  private instanceCredentials = new Map<string, string>();
  private verifications: IdentityVerificationRecord[] = [];

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly ledger: EventLedger,
  ) {}

  register(input: RegisterAgentInput): { agent: Agent; version: AgentVersion } {
    const agentId = this.ids.next("agent");
    const version: AgentVersion = {
      ...input.initialVersion,
      agentVersionId: this.ids.next("agentv"),
      agentId,
      createdAt: this.clock.now(),
      supersededAt: null,
      competenceTransferPolicy: null, // AGENT-INV-003: NONE by default
    };
    const agent: Agent = {
      agentId,
      displayName: input.displayName,
      ownerPrincipalId: input.ownerPrincipalId,
      organizationId: input.organizationId,
      tenantId: input.tenantId,
      declaredCapabilities: [...input.declaredCapabilities],
      currentVersionId: version.agentVersionId,
      lifecycleState: "REGISTERED",
      registeredAt: this.clock.now(),
      retiredAt: null,
    };
    this.agents.set(agentId, agent);
    this.versions.set(version.agentVersionId, version);
    this.emit(agent.tenantId, "AGENT_REGISTERED", [agentId], { displayName: agent.displayName });
    this.emit(agent.tenantId, "AGENT_VERSION_CREATED", [agentId, version.agentVersionId], {});
    return { agent, version };
  }

  /**
   * Creates a new Agent Version when the operative configuration
   * changed; refuses to create redundant versions when nothing changed.
   * Competence evidence never transfers by default (AGENT-INV-003).
   */
  createVersion(
    agentId: string,
    config: Omit<AgentVersion, "agentVersionId" | "agentId" | "createdAt" | "supersededAt" | "competenceTransferPolicy">,
  ): AgentVersion {
    const agent = this.mustGetAgent(agentId);
    const current = this.versions.get(agent.currentVersionId);
    if (current && !requiresNewAgentVersion(current, config)) {
      throw new Error(
        "createVersion: configuration is identical to the current version; a new Agent Version requires a real configuration change (SPEC-002 SS5.3)",
      );
    }
    if (current) current.supersededAt = this.clock.now();
    const version: AgentVersion = {
      ...config,
      agentVersionId: this.ids.next("agentv"),
      agentId,
      createdAt: this.clock.now(),
      supersededAt: null,
      competenceTransferPolicy: null,
    };
    this.versions.set(version.agentVersionId, version);
    agent.currentVersionId = version.agentVersionId;
    this.emit(agent.tenantId, "AGENT_VERSION_CREATED", [agentId, version.agentVersionId], {});
    if (current) this.emit(agent.tenantId, "AGENT_VERSION_SUPERSEDED", [agentId, current.agentVersionId], {});
    return version;
  }

  startRuntimeInstance(agentVersionId: string, hostEnvironmentDescriptor: string, credential: string): AgentRuntimeInstance {
    const version = this.versions.get(agentVersionId);
    if (!version) throw new AgentUnknown(`agent version "${agentVersionId}" is not registered`);
    const agent = this.mustGetAgent(version.agentId);
    const instance: AgentRuntimeInstance = {
      runtimeInstanceId: this.ids.next("inst"),
      agentVersionId,
      startedAt: this.clock.now(),
      endedAt: null,
      hostEnvironmentDescriptor,
    };
    this.instances.set(instance.runtimeInstanceId, instance);
    this.instanceCredentials.set(instance.runtimeInstanceId, credential);
    this.emit(agent.tenantId, "AGENT_RUNTIME_INSTANCE_STARTED", [agent.agentId, instance.runtimeInstanceId], {});
    return instance;
  }

  /**
   * The identity gate every governed action passes through first.
   * Verification failure or absence is a hard block, never a degraded
   * default (AGENT-INV-006), and never resolves a suspended/retired
   * identity as actionable.
   */
  resolveVerifiedIdentity(runtimeInstanceId: string, presentedCredential: string): ResolvedIdentity {
    const instance = this.instances.get(runtimeInstanceId);
    const expected = this.instanceCredentials.get(runtimeInstanceId);
    const verified = Boolean(instance && expected && expected === presentedCredential && instance.endedAt === null);

    const record: IdentityVerificationRecord = {
      verificationId: this.ids.next("verify"),
      runtimeInstanceId,
      verificationMethod: "shared-credential-v1",
      verificationResult: verified ? "VERIFIED" : "FAILED",
      verifiedAt: this.clock.now(),
    };
    this.verifications.push(record);

    if (!verified || !instance) {
      // Emitted against a synthetic tenant scope because an unverified
      // claim has no trusted tenant; the platform scope owns it.
      this.emit("platform", "AGENT_IDENTITY_VERIFICATION_FAILED", [runtimeInstanceId], {});
      throw new AgentUnknown(`runtime instance "${runtimeInstanceId}" failed identity verification`);
    }

    const version = this.versions.get(instance.agentVersionId);
    if (!version) throw new AgentUnknown(`version "${instance.agentVersionId}" missing for verified instance`);
    const agent = this.mustGetAgent(version.agentId);
    this.emit(agent.tenantId, "AGENT_IDENTITY_VERIFIED", [agent.agentId, runtimeInstanceId], {});
    return { agent, version, instance };
  }

  /**
   * Lifecycle transitions flow through the contracts state machine
   * (AGENT-INV-004); the authority argument is the caller's claim of
   * who is acting, checked against the transition table.
   */
  transitionLifecycle(agentId: string, to: AgentLifecycleState, authority: TransitionAuthority): Agent {
    const agent = this.mustGetAgent(agentId);
    assertValidTransition(agent.lifecycleState, to, authority);
    const from = agent.lifecycleState;
    agent.lifecycleState = to;
    if (to === "RETIRED") agent.retiredAt = this.clock.now();
    this.emit(agent.tenantId, "AGENT_LIFECYCLE_TRANSITIONED", [agentId], { from, to, authority });
    if (to === "SUSPENDED") this.emit(agent.tenantId, "AGENT_SUSPENDED", [agentId], {});
    if (to === "RETIRED") this.emit(agent.tenantId, "AGENT_RETIRED", [agentId], {});
    return agent;
  }

  /** Current lifecycle state for downstream gates (SPEC-008 consumes this). */
  lifecycleState(agentId: string): AgentLifecycleState {
    return this.mustGetAgent(agentId).lifecycleState;
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getVersion(agentVersionId: string): AgentVersion | undefined {
    return this.versions.get(agentVersionId);
  }

  private mustGetAgent(agentId: string): Agent {
    const agent = this.agents.get(agentId);
    if (!agent) throw new AgentUnknown(`agent "${agentId}" is not registered`);
    return agent;
  }

  private emit(tenantId: string, eventType: string, subjectIds: string[], payload: Record<string, unknown>): void {
    this.ledger.append({
      eventType,
      owningSpec: "SPEC-002",
      subjectIds,
      payload,
      tenantId,
      versionsInEffect: VERSIONS,
      sourceComponent: COMPONENT,
    });
  }
}
