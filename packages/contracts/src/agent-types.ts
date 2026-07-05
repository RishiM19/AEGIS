/**
 * Agent Identity, Registration and Lifecycle domain types (SPEC-002).
 */

import type { Timestamp } from "./cam-types.js";

export type AgentLifecycleState = "REGISTERED" | "ACTIVE" | "CONSTRAINED" | "SUSPENDED" | "RETIRED";

export interface Agent {
  agentId: string;
  displayName: string;
  ownerPrincipalId: string;
  organizationId: string;
  tenantId: string;
  declaredCapabilities: string[];
  currentVersionId: string;
  lifecycleState: AgentLifecycleState;
  registeredAt: Timestamp;
  retiredAt: Timestamp | null;
}

export interface AgentVersion {
  agentVersionId: string;
  agentId: string;
  modelIdentifier: string;
  modelVersion: string;
  systemPromptHash: string;
  toolConfigurationHash: string;
  runtimeConfigurationHash: string;
  createdAt: Timestamp;
  supersededAt: Timestamp | null;
  /** Reference to a competence-transfer policy, or null (AGENT-INV-003 default). */
  competenceTransferPolicy: string | null;
}

export interface AgentRuntimeInstance {
  runtimeInstanceId: string;
  agentVersionId: string;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  hostEnvironmentDescriptor: string;
}

export type IdentityVerificationResult = "VERIFIED" | "FAILED" | "UNKNOWN";

export interface IdentityVerificationRecord {
  verificationId: string;
  runtimeInstanceId: string;
  verificationMethod: string;
  verificationResult: IdentityVerificationResult;
  verifiedAt: Timestamp;
}

/**
 * Determines whether two Agent Version configuration fingerprints
 * represent the same operative configuration. Per SPEC-002 SS5.3: any
 * change to model identifier/version, system prompt, or tool
 * configuration mandates a new Agent Version -- this is deterministic
 * content-hash comparison, not judgment.
 */
export function requiresNewAgentVersion(
  current: Pick<AgentVersion, "modelIdentifier" | "modelVersion" | "systemPromptHash" | "toolConfigurationHash">,
  proposed: Pick<AgentVersion, "modelIdentifier" | "modelVersion" | "systemPromptHash" | "toolConfigurationHash">,
): boolean {
  return (
    current.modelIdentifier !== proposed.modelIdentifier ||
    current.modelVersion !== proposed.modelVersion ||
    current.systemPromptHash !== proposed.systemPromptHash ||
    current.toolConfigurationHash !== proposed.toolConfigurationHash
  );
}
