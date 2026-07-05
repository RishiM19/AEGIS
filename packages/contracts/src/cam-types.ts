/**
 * Canonical Action Model (CAM) domain types.
 *
 * Source of truth: handbook/SPEC-001.md
 *
 * These types are a direct, faithful transcription of the TypeScript
 * interfaces already defined in SPEC-001 sections 6-61. Do not add fields
 * here that SPEC-001 does not define -- extend the specification first
 * (per AGENTS.md SS4), then this file.
 */

export type UUID = string;
export type Timestamp = string; // ISO-8601, UTC, per canonical serialization (SPEC-001 SS59)

// ---------------------------------------------------------------------------
// Layer 1 -- Action Identity (SPEC-001 SS7)
// ---------------------------------------------------------------------------

export type ActionStatus =
  | "PROPOSED"
  | "NORMALIZING"
  | "CANONICALIZED"
  | "ASSESSING"
  | "CONTRACTED"
  | "EXECUTING"
  | "COMPLETED"
  | "CANCELLED"
  | "SUPERSEDED";

export interface ActionIdentity {
  actionId: UUID;
  actionVersion: number; // begins at 1 (SPEC-001 SS7.2)
  parentActionId?: UUID;
  proposalId: UUID;
  correlationId: UUID;
  status: ActionStatus;
  createdAt: Timestamp;
}

// ---------------------------------------------------------------------------
// Actor Identity (SPEC-001 SS8)
// ---------------------------------------------------------------------------

export interface ModelIdentity {
  provider: string;
  model: string;
  modelVersion?: string;
}

export interface ConfigurationIdentity {
  systemPromptVersion?: string;
  toolsetVersion: string;
  runtimeConfigVersion: string;
}

export interface ActorIdentity {
  agentId: string;
  agentVersion: string;
  runtimeInstanceId?: string;
  sessionId?: string;
  modelIdentity?: ModelIdentity;
  configurationIdentity: ConfigurationIdentity;
}

// ---------------------------------------------------------------------------
// Layer 2 -- Lineage / Purpose (SPEC-001 SS9-18)
// ---------------------------------------------------------------------------

export interface ActionLineage {
  actor: ActorIdentity;
  principalId: string;
  intentId?: string;
  objectiveId?: string;
  triggerType?: "HUMAN_REQUEST" | "SCHEDULED" | "EVENT_DRIVEN" | "AGENT_INITIATED" | "OTHER";
}

export interface ActionPurpose {
  statedGoal: string;
  rationale?: string;
  expectedOutcome?: string;
  assumptions?: string[];
  dependsOnActionIds?: UUID[];
}

// ---------------------------------------------------------------------------
// Layer 3 -- Canonical Operation (SPEC-001 SS19-27)
// ---------------------------------------------------------------------------

export type OperationClass =
  | "READ"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "TRANSFER"
  | "COMMUNICATE"
  | "EXECUTE"
  | "APPROVE"
  | "REVOKE"
  | "DELEGATE"
  | "OTHER";

export interface ToolReference {
  toolId: string;
  toolVersion: string;
  adapterId: string;
  adapterVersion: string;
  externalProvider?: string;
  externalOperation?: string;
}

export type ParameterMateriality = "ALWAYS" | "THRESHOLD" | "SEMANTIC" | "NEVER";

export interface ParameterMaterialityRule {
  parameterName: string;
  materiality: ParameterMateriality;
  threshold?: number;
}

export type DecisionRelevance = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface CanonicalParameter {
  name: string;
  semanticType: string;
  value: unknown;
  unit?: string;
  sensitivityClass?: string;
  decisionRelevance: DecisionRelevance;
  mutable: boolean;
  materialityRule?: ParameterMaterialityRule;
}

export interface CanonicalOperation {
  domain: string;
  capability: string;
  actionType: string;
  operationClass: OperationClass;
  semanticVerb: string;
  tool: ToolReference;
  parameters: CanonicalParameter[];
  taxonomyVersion: string;
}

// ---------------------------------------------------------------------------
// Layer 3 -- Targets (SPEC-001 SS28-30)
// ---------------------------------------------------------------------------

export type TargetRole = "PRIMARY" | "SECONDARY" | "BENEFICIARY" | "AFFECTED" | "DESTINATION" | "SOURCE";

export interface TargetScope {
  knownCount?: number;
  estimatedCount?: number;
  countConfidence?: number;
  selector?: string;
  bounded: boolean;
}

export interface ActionTarget {
  targetId?: string;
  targetType: string;
  role: TargetRole;
  scope: TargetScope;
  attributes: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Layer 3 -- Context (SPEC-001 SS31-36)
// ---------------------------------------------------------------------------

export type CanonicalContextValue = string | number | boolean | null;

export interface EnvironmentContext {
  environmentType: "LOCAL" | "DEVELOPMENT" | "STAGING" | "SANDBOX" | "PRODUCTION";
  environmentId?: string;
  stateVersion?: string;
  healthStatus?: "NORMAL" | "DEGRADED" | "INCIDENT" | "UNKNOWN";
}

export interface TemporalContext {
  proposedAt: Timestamp;
  requestedExecutionTime?: Timestamp;
  deadline?: Timestamp;
  urgency: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  timeWindowReference?: string;
}

export interface JurisdictionContext {
  primaryJurisdiction?: string;
  affectedJurisdictions?: string[];
  dataResidencyRegion?: string;
}

export interface ActionContext {
  structured: Record<string, CanonicalContextValue>;
  semanticSummary?: string;
  environment: EnvironmentContext;
  temporal: TemporalContext;
  jurisdiction?: JurisdictionContext;
}

// ---------------------------------------------------------------------------
// Layer 4 -- Evidence (SPEC-001 SS37-39)
// ---------------------------------------------------------------------------

export type EvidenceType =
  | "DATABASE_RECORD"
  | "DOCUMENT"
  | "API_RESPONSE"
  | "USER_STATEMENT"
  | "AGENT_OBSERVATION"
  | "HUMAN_ASSESSMENT"
  | "SYSTEM_EVENT"
  | "OTHER";

export interface EvidenceReference {
  evidenceId: string;
  evidenceType: EvidenceType;
  sourceId: string;
  sourceTrustClass?: string;
  observedAt?: Timestamp;
  validAt?: Timestamp;
  freshnessStatus?: "FRESH" | "STALE" | "EXPIRED" | "UNKNOWN";
  claimRefs: string[];
}

export interface ActionClaim {
  claimId: string;
  statement: string;
  importance: "CRITICAL" | "SUPPORTING" | "OPTIONAL";
  evidenceRefs: string[];
}

// ---------------------------------------------------------------------------
// Layer 4 -- Proposed Effects (SPEC-001 SS40-44)
// ---------------------------------------------------------------------------

export type EffectType =
  | "STATE_CHANGE"
  | "FINANCIAL_TRANSFER"
  | "DATA_DISCLOSURE"
  | "DATA_MUTATION"
  | "DATA_DELETION"
  | "COMMUNICATION"
  | "PERMISSION_CHANGE"
  | "RESOURCE_CONSUMPTION"
  | "PHYSICAL_EFFECT"
  | "OTHER";

export type EffectMagnitude =
  | { type: "MONETARY"; amountMinor: number; currency: string }
  | { type: "ENTITY_COUNT"; count: number }
  | { type: "DATA_VOLUME"; value: number; unit: string }
  | { type: "DURATION"; value: number; unit: string }
  | { type: "RESOURCE"; value: number; unit: string };

export interface ProposedEffect {
  effectId: string;
  effectType: EffectType;
  direction?: "INBOUND" | "OUTBOUND" | "INTERNAL";
  magnitude?: EffectMagnitude;
  affectedTargetRefs: string[];
  certainty: "CERTAIN" | "EXPECTED" | "POSSIBLE" | "UNKNOWN";
  source: "TOOL_METADATA" | "DETERMINISTIC_DERIVATION" | "CONFIGURATION" | "AI_INFERENCE" | "AGENT_DECLARATION";
}

// ---------------------------------------------------------------------------
// Layer 4 -- Sequence Context (SPEC-001 SS45-47)
// ---------------------------------------------------------------------------

export interface SequenceContext {
  taskRunId?: string;
  sequenceId?: string;
  sequencePosition?: number;
  priorActionIds: UUID[];
  plannedNextActionTypes?: string[];
  cumulativeActionCount?: number;
  repeatedActionCount?: number;
  batchId?: string;
}

// ---------------------------------------------------------------------------
// Layer 4 -- Execution Descriptor (SPEC-001 SS48-51)
// ---------------------------------------------------------------------------

export type SupportLevel = "FULL" | "PARTIAL" | "NONE" | "UNKNOWN";

export interface ExecutionConstraint {
  constraintType: string;
  description: string;
}

export interface ExecutionDescriptor {
  executionType: "TOOL_CALL" | "API_CALL" | "DATABASE_OPERATION" | "MESSAGE" | "WORKFLOW" | "HUMAN_TASK";
  effectorId: string;
  idempotencySupport: "NATIVE" | "AEGIS_MANAGED" | "NONE" | "UNKNOWN";
  simulationSupport: SupportLevel;
  compensationSupport: SupportLevel;
  executionConstraints: ExecutionConstraint[];
}

// ---------------------------------------------------------------------------
// Layer 5 -- Field Provenance (SPEC-001 SS52-54)
// ---------------------------------------------------------------------------

export type FieldOrigin =
  | "AGENT_SUPPLIED"
  | "USER_SUPPLIED"
  | "TOOL_SCHEMA"
  | "DETERMINISTIC_DERIVATION"
  | "EXTERNAL_ENRICHMENT"
  | "AI_INFERENCE"
  | "SYSTEM_DEFAULT"
  | "HUMAN_OVERRIDE";

export interface FieldProvenance {
  fieldPath: string;
  origin: FieldOrigin;
  sourceReference?: string;
  producedAt: Timestamp;
  producerVersion?: string;
  confidence?: number;
  validationStatus: "VALIDATED" | "UNVALIDATED" | "CONTRADICTED" | "NOT_APPLICABLE";
}

export type FieldProvenanceMap = Record<string, FieldProvenance>;

// ---------------------------------------------------------------------------
// Layer 5 -- Action Integrity (SPEC-001 SS55-61)
// ---------------------------------------------------------------------------

export interface ActionIntegrity {
  canonicalFingerprint: string;
  materialFingerprint: string;
  rawProposalHash: string;
  normalizationInputHash: string;
  schemaVersion: string;
  taxonomyVersion: string;
  adapterVersion: string;
  normalizerVersion: string;
}

export interface ActionMetadata {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Top-level Canonical Action (SPEC-001 SS6)
// ---------------------------------------------------------------------------

export interface CanonicalAction {
  identity: ActionIdentity;
  lineage: ActionLineage;
  purpose: ActionPurpose;
  operation: CanonicalOperation;
  targets: ActionTarget[];
  context: ActionContext;
  evidence: EvidenceReference[];
  claims?: ActionClaim[];
  effects: ProposedEffect[];
  sequence: SequenceContext;
  execution: ExecutionDescriptor;
  provenance: FieldProvenanceMap;
  integrity: ActionIntegrity;
  metadata: ActionMetadata;
}

/**
 * The subset of a CanonicalAction that has not yet had integrity computed.
 * Used as the input to canonicalize()/fingerprint().
 */
export type UnfingerprintedCanonicalAction = Omit<CanonicalAction, "integrity"> & {
  integrity: Omit<ActionIntegrity, "canonicalFingerprint" | "materialFingerprint" | "rawProposalHash">;
};
