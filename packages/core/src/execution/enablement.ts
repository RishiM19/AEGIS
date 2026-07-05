/**
 * Execution Enablement: Tool Adapters, Credential Leasing, Simulation
 * (SPEC-012).
 *
 * Everything here is a conduit for authority the Execution Gateway has
 * already verified -- never a second place authority can be decided or
 * expanded (EXE-INV-023 as the organizing constraint).
 *
 * Enforced invariants:
 *  - ENA-INV-001  only reachable through the gateway's invocation path
 *                 (constructor-injected, no public agent-facing surface)
 *  - ENA-INV-002  adapter schemas are closed sets, validated at
 *                 registration, and reject out-of-scope values at call
 *  - ENA-INV-003  simulation cannot reach the real credential path
 *  - ENA-INV-004  no secret material ever crosses to the agent
 *  - ENA-INV-005  lease scope is derived mechanically from the grant
 *  - ENA-INV-006  revocation blocks the next call
 *  - ENA-INV-007  responses are preserved verbatim
 */

import type { CanonicalAction } from "@aegis/contracts";
import type { Clock, IdSource } from "../kernel/clock.js";
import type { AutonomyGrant } from "../autonomy/decision-engine.js";

// ------------------------------------------------------------ tool adapters

export interface AdapterParameterRule {
  name: string;
  required: boolean;
  semanticType: string;
}

/** What the external system actually said, verbatim (EXE-INV-018). */
export interface ExternalResponse {
  status: "SUCCEEDED" | "FAILED" | "TIMEOUT" | "AMBIGUOUS";
  raw: Record<string, unknown>;
  externalReferenceId: string | null;
}

export type ExternalEffector = (parameters: Record<string, unknown>) => ExternalResponse;

export interface ToolAdapter {
  toolAdapterId: string;
  toolId: string;
  adapterVersion: string;
  /** Closed parameter set (ENA-INV-002): nothing outside it is accepted. */
  parameterRules: AdapterParameterRule[];
  effector: ExternalEffector;
}

export class AdapterRegistrationRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdapterRegistrationRejected";
  }
}

export class AdapterCallRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdapterCallRejected";
  }
}

export class ToolAdapterLayer {
  private adapters = new Map<string, ToolAdapter>();

  register(adapter: ToolAdapter): void {
    if (adapter.parameterRules.length === 0) {
      throw new AdapterRegistrationRejected(
        `adapter "${adapter.toolAdapterId}" declares no parameter rules; open/wildcard schemas are rejected at registration (ENA-INV-002)`,
      );
    }
    const names = new Set(adapter.parameterRules.map((r) => r.name));
    if (names.size !== adapter.parameterRules.length) {
      throw new AdapterRegistrationRejected(`adapter "${adapter.toolAdapterId}" has duplicate parameter rules`);
    }
    this.adapters.set(adapter.toolId, adapter);
  }

  adapterFor(toolId: string): ToolAdapter {
    const adapter = this.adapters.get(toolId);
    if (!adapter) throw new AdapterCallRejected(`no adapter registered for tool "${toolId}"`);
    return adapter;
  }

  /**
   * Invokes the external system on behalf of a gateway-verified action.
   * Rejects (never clamps or defaults) anything outside the adapter's
   * closed schema or the grant's scope (ENA-INV-002, EXE-INV-006/007).
   */
  invoke(action: CanonicalAction, grant: AutonomyGrant, lease: CredentialLease, leases: CredentialLeaseManager): ExternalResponse {
    const adapter = this.adapterFor(action.operation.tool.toolId);
    leases.assertUsable(lease.leaseId, grant); // ENA-INV-006

    const provided = new Map(action.operation.parameters.map((p) => [p.name, p]));
    const known = new Set(adapter.parameterRules.map((r) => r.name));

    for (const rule of adapter.parameterRules) {
      if (rule.required && !provided.has(rule.name)) {
        throw new AdapterCallRejected(`missing mandatory parameter "${rule.name}" fails closed (EXE-INV-007)`);
      }
    }
    for (const [name] of provided) {
      if (!known.has(name)) {
        throw new AdapterCallRejected(`unknown parameter "${name}" is rejected, not silently dropped (EXE-INV-006)`);
      }
    }

    // Grant scope re-checked at the conduit: an adapter cannot carry
    // more value than the grant allows even if a gateway bug let it
    // through (defense in depth for EXE-INV-004).
    const amountParam = provided.get("amount");
    if (grant.maxAmountMinor !== null && typeof amountParam?.value === "number" && amountParam.value > grant.maxAmountMinor) {
      throw new AdapterCallRejected(
        `amount ${amountParam.value} exceeds grant scope ${grant.maxAmountMinor}; rejected, not clamped (ENA-INV-002)`,
      );
    }

    const parameters = Object.fromEntries([...provided.values()].map((p) => [p.name, p.value]));
    // Verbatim response passthrough (ENA-INV-007).
    return adapter.effector(parameters);
  }
}

// -------------------------------------------------------- credential leases

export interface CredentialLease {
  leaseId: string;
  executionAttemptId: string;
  /** Scope derived mechanically from the grant (ENA-INV-005). */
  scope: { toolId: string; maxAmountMinor: number | null; environment: string };
  issuedAt: string;
  expiresAt: string;
  revoked: boolean;
}

export class LeaseUnusable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaseUnusable";
  }
}

export class CredentialLeaseManager {
  private leases = new Map<string, CredentialLease>();

  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly leaseValiditySeconds: number = 60,
  ) {}

  issue(executionAttemptId: string, grant: AutonomyGrant): CredentialLease {
    const now = this.clock.now();
    const lease: CredentialLease = {
      leaseId: this.ids.next("lease"),
      executionAttemptId,
      scope: {
        toolId: grant.allowedToolId,
        maxAmountMinor: grant.maxAmountMinor,
        environment: grant.allowedEnvironment,
      },
      issuedAt: now,
      expiresAt: new Date(Date.parse(now) + this.leaseValiditySeconds * 1000).toISOString(),
      revoked: false,
    };
    this.leases.set(lease.leaseId, lease);
    return lease;
  }

  revoke(leaseId: string): void {
    const lease = this.leases.get(leaseId);
    if (lease) lease.revoked = true;
  }

  assertUsable(leaseId: string, grant: AutonomyGrant): void {
    const lease = this.leases.get(leaseId);
    if (!lease) throw new LeaseUnusable(`lease "${leaseId}" does not exist`);
    if (lease.revoked) throw new LeaseUnusable(`lease "${leaseId}" was revoked; revocation blocks the next call (ENA-INV-006)`);
    if (lease.expiresAt < this.clock.now()) throw new LeaseUnusable(`lease "${leaseId}" expired`);
    if (lease.scope.toolId !== grant.allowedToolId) {
      throw new LeaseUnusable(`lease scope tool "${lease.scope.toolId}" does not match grant tool "${grant.allowedToolId}"`);
    }
  }
}

// -------------------------------------------------------------- simulation

export interface SimulationSession {
  simulationSessionId: string;
  actionId: string;
  simulationEnvironmentRef: string;
  /** Labeled predictions, never observations (ENA-INV-003 / COMP-INV-010). */
  predictedEffects: Array<{ description: string; predicted: true }>;
  completedAt: string;
}

export class SimulationUnavailable extends Error {
  constructor(toolId: string) {
    super(`tool "${toolId}" has no verified simulation capability; L3 is not achievable for it (SPEC-012 SS5.3)`);
    this.name = "SimulationUnavailable";
  }
}

export class SimulationRuntime {
  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
  ) {}

  simulate(action: CanonicalAction): SimulationSession {
    if (action.execution.simulationSupport === "NONE" || action.execution.simulationSupport === "UNKNOWN") {
      throw new SimulationUnavailable(action.operation.tool.toolId);
    }
    // Simulation never touches the CredentialLeaseManager or a real
    // effector: predicted effects derive from the action's own declared
    // effects (ENA-INV-003).
    return {
      simulationSessionId: this.ids.next("sim"),
      actionId: action.identity.actionId,
      simulationEnvironmentRef: `sandbox:${action.operation.tool.toolId}`,
      predictedEffects: action.effects.map((e) => ({
        description: `${e.effectType}${e.magnitude ? ` (${JSON.stringify(e.magnitude)})` : ""}`,
        predicted: true,
      })),
      completedAt: this.clock.now(),
    };
  }
}
