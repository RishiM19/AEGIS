# AEGIS TECHNICAL SPECIFICATION 001

## Canonical Action Model

**Document ID:** AEGIS-SPEC-001  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Core Domain Model  
**Depends On:** AEGIS-SPEC-000  
**Primary Owner:** Action Intelligence System  
**Consumers:** All AEGIS Decision, Execution, Learning, Audit, and Research Components

---

# 0. Purpose of This Specification

This specification defines the Canonical Action Model, abbreviated:

# CAM

The Canonical Action Model is the standardized, immutable representation of a proposed agent action inside AEGIS.

Every governed action must be transformed from a framework-specific or tool-specific request into a Canonical Action before the AEGIS assessment pipeline may evaluate it.

The CAM exists because external agents may express semantically equivalent actions in completely different forms.

For example:

```text
refund_customer(
    customer_id = "C829",
    amount = 18400
)
```

Another system may express the same operation as:

```http
POST /payments/refunds

{
  "account": "C829",
  "value": 18400,
  "currency": "INR"
}
```

Another agent framework may produce:

```json
{
  "tool": "stripe_refund",
  "arguments": {
    "payment_intent": "pi_829",
    "amount": 1840000
  }
}
```

Another system may use MCP:

```text
payments.issue_refund
```

AEGIS cannot build competence, novelty, consequence, or autonomy models directly around these framework-specific representations.

It requires one common semantic representation.

The CAM therefore answers:

> What action is this agent actually proposing, independent of the agent framework, model provider, SDK, tool name, or external API?

---

# 1. Core Design Principle

The Canonical Action Model must separate:

```text
HOW THE ACTION WAS REQUESTED
```

from:

```text
WHAT THE ACTION MEANS
```

The raw request may be:

```text
tool_name = "stripe.refunds.create"
```

The canonical meaning may be:

```text
Domain:
customer_finance

Operation:
refund

Target:
customer payment

Magnitude:
₹18,400

Primary effect:
money leaves organization

Scope:
one customer

Reversibility:
compensatable
```

This separation is fundamental.

Without it:

```text
Agent A uses:

refund_customer()
```

and:

```text
Agent B uses:

create_credit_transaction()
```

may appear unrelated even when they create the same real-world effect.

AEGIS must reason about semantic action identity, not merely function identity.

---

# 2. The Problem CAM Must Solve

A raw agent tool call usually contains only:

```text
Tool name

Arguments
```

Example:

```text
send_email(
    to = "customers@example.com",
    subject = "Important Update",
    body = "..."
)
```

But AEGIS needs to know:

```text
Who is acting?

Which exact agent version is acting?

On whose behalf?

Under which objective?

Why is the action being proposed?

Which tool was requested?

What operation does the tool represent?

Who or what is affected?

How many entities are affected?

What data leaves the system?

What state changes?

What resources are consumed?

What is the monetary magnitude?

What is the temporal scope?

Is the action one-time or repeated?

What other actions caused this proposal?

What actions are expected to follow?

What assumptions does the agent rely on?

Which evidence supports the action?

Which fields came directly from the agent?

Which fields were deterministically derived?

Which fields were inferred by AI?

How certain are those inferred fields?

Which exact representation was assessed?

Can the action mutate after approval?

Can two semantically equivalent actions be compared?

Can historical actions be retrieved for competence estimation?
```

CAM is the foundation that answers these questions.

---

# 3. CAM's Position in the System

The action lifecycle is:

```text
EXTERNAL AGENT
      │
      ▼
RAW ACTION PROPOSAL
      │
      ▼
INGRESS VALIDATION
      │
      ▼
ACTION ADAPTER
      │
      ▼
SEMANTIC NORMALIZATION
      │
      ▼
CONTEXT ENRICHMENT
      │
      ▼
CANONICAL ACTION VALIDATION
      │
      ▼
ACTION FINGERPRINTING
      │
      ▼
IMMUTABLE CANONICAL ACTION
      │
      ▼
DECISION SNAPSHOT
      │
      ├──────────────► Authority Engine
      │
      ├──────────────► Competence Engine
      │
      ├──────────────► Novelty Engine
      │
      ├──────────────► Uncertainty Engine
      │
      ├──────────────► Consequence Engine
      │
      └──────────────► Autonomy Engine
```

No assessment engine may directly interpret the original framework-specific tool request as its authoritative input.

The original request is preserved for audit.

The CAM is the authoritative assessment representation.

---

# 4. CAM System Invariants

The following invariants are mandatory.

## CAM-INV-001 — Every Governed Action Has One Canonical Representation

Every proposed governed action must produce exactly one authoritative Canonical Action version before assessment.

---

## CAM-INV-002 — Raw Input Is Never Destroyed

The original action proposal must be preserved exactly as received.

Normalization adds interpretation.

It must never erase the source request.

---

## CAM-INV-003 — Material Mutation Creates a New Action Version

If a field relevant to:

```text
Authority

Competence

Novelty

Uncertainty

Consequence

Execution
```

changes after normalization, the action must be reassessed.

The old contract cannot silently apply.

---

## CAM-INV-004 — Provenance Must Be Preserved Per Field

AEGIS must know whether a field was:

```text
SUPPLIED

DERIVED

ENRICHED

INFERRED

DEFAULTED

OVERRIDDEN
```

No decision-critical inferred field may masquerade as a directly observed fact.

---

## CAM-INV-005 — Unknown Is Not Zero

If monetary impact is unknown:

```text
monetary_magnitude = UNKNOWN
```

It must not become:

```text
monetary_magnitude = 0
```

If affected entity count is unknown:

```text
affected_entities = UNKNOWN
```

It must not become:

```text
affected_entities = 1
```

Missing information must remain explicit.

---

## CAM-INV-006 — Semantic Equivalence Must Be Possible

Two different raw tool calls representing the same kind of real-world action must be comparable in canonical action space.

---

## CAM-INV-007 — Exact Execution Must Bind to Exact Action Identity

The execution system must execute the materially same action that was assessed.

---

## CAM-INV-008 — No Silent Enrichment

External lookups used during normalization must be recorded.

Example:

```text
Raw input:

customer_id = C829
```

Enrichment:

```text
customer_country = IN
customer_risk_class = STANDARD
```

The system must record:

```text
Source system

Source record version

Retrieval time

Field provenance
```

---

## CAM-INV-009 — Canonicalization Must Be Versioned

The same raw action processed under different normalization logic may produce different semantic representations.

Therefore every Canonical Action records:

```text
schema_version

normalizer_version

adapter_version

taxonomy_version
```

---

## CAM-INV-010 — CAM Describes the Proposed Action, Not the Final Decision

The CAM must not contain:

```text
autonomy_level

allow

deny

trust_score

final_risk_decision
```

Those belong to downstream assessments.

CAM describes.

Other systems judge.

---

# 5. The Five Layers of an Action

Every Canonical Action is divided into five conceptual layers.

```text
┌───────────────────────────────────────────────┐
│ LAYER 1 — IDENTITY                            │
│ Who is acting?                                │
├───────────────────────────────────────────────┤
│ LAYER 2 — PURPOSE                             │
│ Why does this action exist?                   │
├───────────────────────────────────────────────┤
│ LAYER 3 — OPERATION                           │
│ What exactly is being attempted?              │
├───────────────────────────────────────────────┤
│ LAYER 4 — EFFECT                              │
│ What could change in the world?               │
├───────────────────────────────────────────────┤
│ LAYER 5 — EVIDENCE AND PROVENANCE             │
│ What supports this representation?            │
└───────────────────────────────────────────────┘
```

This layered structure prevents the model from becoming a flat bag of fields.

---

# 6. Top-Level Canonical Action Structure

The authoritative conceptual structure is:

```text
CanonicalAction

├── identity
├── lineage
├── purpose
├── operation
├── targets
├── context
├── evidence
├── effects
├── sequence
├── execution
├── provenance
├── integrity
└── metadata
```

The initial TypeScript-style representation is:

```typescript
interface CanonicalAction {
  identity: ActionIdentity;
  lineage: ActionLineage;
  purpose: ActionPurpose;
  operation: CanonicalOperation;
  targets: ActionTarget[];
  context: ActionContext;
  evidence: EvidenceReference[];
  effects: ProposedEffect[];
  sequence: SequenceContext;
  execution: ExecutionDescriptor;
  provenance: FieldProvenanceMap;
  integrity: ActionIntegrity;
  metadata: ActionMetadata;
}
```

This is the conceptual contract.

Exact API schemas will be defined using Pydantic and JSON Schema during implementation design.

---

# 7. Layer 1 — Action Identity

The identity block answers:

> What unique proposed action is this?

```typescript
interface ActionIdentity {
  actionId: UUID;
  actionVersion: number;
  parentActionId?: UUID;

  proposalId: UUID;
  correlationId: UUID;

  status:
    | "PROPOSED"
    | "NORMALIZING"
    | "CANONICALIZED"
    | "ASSESSING"
    | "CONTRACTED"
    | "EXECUTING"
    | "COMPLETED"
    | "CANCELLED"
    | "SUPERSEDED";

  createdAt: Timestamp;
}
```

## 7.1 actionId

Globally unique logical action identifier.

Example:

```text
act_01J...
```

The action ID identifies the logical action across the system.

---

## 7.2 actionVersion

Begins at:

```text
1
```

A materially changed action creates a new version.

Example:

```text
Action:
refund ₹18,400

action_id:
ACT-829

version:
1
```

Agent changes amount:

```text
refund ₹22,000
```

Result:

```text
action_id:
ACT-829

version:
2
```

The previous contract cannot authorize Version 2.

---

## 7.3 parentActionId

Used when an action is derived from another action.

Example:

```text
Parent action:

Resolve customer complaint
```

Derived actions:

```text
Read payment records

Issue refund

Send confirmation
```

This is not the same as objective lineage.

It represents action decomposition.

---

## 7.4 proposalId

Identifies the exact incoming proposal event.

Retries of the same proposal may retain the same proposal identity under idempotency rules.

---

## 7.5 correlationId

Groups related activity across:

```text
Agent

AEGIS

Workers

Tool adapters

External APIs
```

This is operational correlation, not semantic identity.

---

# 8. Actor Identity

The CAM must record exactly who proposed the action.

```typescript
interface ActorIdentity {
  agentId: string;
  agentVersion: string;

  runtimeInstanceId?: string;
  sessionId?: string;

  modelIdentity?: {
    provider: string;
    model: string;
    modelVersion?: string;
  };

  configurationIdentity: {
    systemPromptVersion?: string;
    toolsetVersion: string;
    runtimeConfigVersion: string;
  };
}
```

This information belongs under action lineage and actor context.

The reason is critical.

Suppose:

```text
RefundAgent v3

Model:
Model A

Prompt:
P12
```

performs extremely well.

Then the team changes:

```text
Model:
Model B

Prompt:
P19
```

The agent should not automatically inherit full competence.

AEGIS therefore needs enough identity information to detect meaningful actor changes.

---

# 9. Layer 2 — Action Lineage

The lineage block answers:

> Where did this action come from?

```typescript
interface ActionLineage {
  principalId: string;

  agent: ActorIdentity;

  intentId: UUID;
  objectiveId: UUID;

  delegationPath: string[];

  parentActionId?: UUID;
  upstreamActionIds: UUID[];

  upstreamAgentIds: string[];

  trigger: ActionTrigger;
}
```

---

# 10. Principal

The principal is the authority origin.

Examples:

```text
Human user

Organization

Authorized service

System administrator
```

The principal is not always the immediate requester.

Example:

```text
Human
  ↓
Coordinator Agent
  ↓
Refund Agent
  ↓
Payment Tool
```

The Refund Agent is the actor.

The human may remain the principal.

This distinction is essential for SPEC-002.

---

# 11. Intent and Objective References

Every significant action should connect to:

```text
INTENT
```

and:

```text
OBJECTIVE
```

Example:

```text
Intent:

Resolve legitimate duplicate-payment complaints.
```

```text
Objective:

Resolve CASE-829.
```

```text
Action:

Refund ₹18,400 to customer C829.
```

The CAM does not own the intent or objective definitions.

It stores references.

The Authority Engine resolves them from the authoritative Intent and Delegation System.

---

# 12. Trigger Model

Every action must identify why it was initiated.

```typescript
type ActionTrigger =
  | {
      type: "USER_REQUEST";
      sourceReference: string;
    }
  | {
      type: "AGENT_DECISION";
      reasoningReference: string;
    }
  | {
      type: "SCHEDULED";
      scheduleReference: string;
    }
  | {
      type: "EVENT_DRIVEN";
      eventReference: string;
    }
  | {
      type: "RETRY";
      priorAttemptId: string;
    }
  | {
      type: "COMPENSATION";
      originalExecutionId: string;
    }
  | {
      type: "HUMAN_INTERVENTION";
      interventionId: string;
    };
```

This matters because:

```text
Agent spontaneously initiates payment
```

and:

```text
Agent executes direct human payment request
```

may have different authority implications.

---

# 13. Layer 2 — Purpose

The purpose block answers:

> Why does the agent believe this action should happen?

```typescript
interface ActionPurpose {
  statedGoal: string;

  rationale?: string;

  expectedOutcome: string;

  assumptions: ActionAssumption[];

  dependencies: ActionDependency[];

  agentReportedConfidence?: number;
}
```

The purpose block is descriptive.

It does not determine whether the rationale is valid.

---

# 14. Stated Goal

Example:

```text
Refund the customer for a verified duplicate charge.
```

The stated goal must be short and action-specific.

It is different from the larger objective:

```text
Resolve CASE-829.
```

---

# 15. Rationale

Example:

```text
Two settled transactions with matching merchant,
amount, and timestamp were identified.
```

The rationale may originate from:

```text
Agent output

Structured decision logic

Human instruction

Workflow state
```

The source must be recorded.

AEGIS must never assume that a plausible rationale is a true rationale.

---

# 16. Expected Outcome

Example:

```text
Customer receives ₹18,400 refund and duplicate-payment complaint is resolved.
```

This becomes useful later for outcome evaluation.

The system can compare:

```text
EXPECTED OUTCOME
```

against:

```text
OBSERVED OUTCOME
```

---

# 17. Assumptions

Agents frequently act based on hidden assumptions.

AEGIS should make them explicit when available.

```typescript
interface ActionAssumption {
  assumptionId: string;
  statement: string;

  status:
    | "UNVERIFIED"
    | "SUPPORTED"
    | "CONTRADICTED"
    | "UNKNOWN";

  evidenceRefs: string[];
}
```

Example:

```text
Assumption:

The second charge is accidental rather than intentional.
```

This matters because an action may be familiar but based on an unverified assumption.

That affects uncertainty.

---

# 18. Dependencies

An action may depend on facts or prior actions.

Example:

```text
Refund depends on:

Payment record retrieval

Duplicate detection

Customer identity verification
```

```typescript
interface ActionDependency {
  dependencyType:
    | "ACTION"
    | "EVIDENCE"
    | "STATE"
    | "APPROVAL"
    | "EXTERNAL_SERVICE";

  referenceId: string;

  required: boolean;

  currentStatus:
    | "SATISFIED"
    | "UNSATISFIED"
    | "UNKNOWN";
}
```

Unsatisfied dependencies do not automatically mean denial.

They become inputs to downstream engines.

---

# 19. Layer 3 — Canonical Operation

The operation block is the semantic center of CAM.

It answers:

> What is being attempted?

```typescript
interface CanonicalOperation {
  domain: string;
  capability: string;
  actionType: string;

  operationClass:
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

  semanticVerb: string;

  tool: ToolReference;

  parameters: CanonicalParameter[];

  taxonomyVersion: string;
}
```

---

# 20. Domain

The domain is the broad operational area.

Examples:

```text
customer_finance

customer_support

communications

identity

data_management

infrastructure

healthcare_operations

education

procurement
```

Domains are hierarchical.

Example:

```text
finance

finance.refunds

finance.refunds.customer
```

V1 should use a controlled taxonomy.

Free-form domains are prohibited in decision-critical operation.

---

# 21. Capability

The capability describes the general power being exercised.

Examples:

```text
customer.refund

email.send

database.record.delete

account.permission.modify

infrastructure.service.restart
```

Capability is important for authority matching.

SPEC-002 will use it heavily.

---

# 22. Action Type

The action type is the normalized specific action family.

Example:

```text
ISSUE_CUSTOMER_REFUND
```

Other examples:

```text
SEND_EXTERNAL_EMAIL

DELETE_CUSTOMER_RECORD

MODIFY_ACCOUNT_PERMISSION

CREATE_PURCHASE_ORDER

RESTART_PRODUCTION_SERVICE
```

Action types must be stable identifiers.

Display names may change.

Identifiers must not.

---

# 23. Operation Class

Operation class provides a high-level semantic category.

Examples:

```text
READ

CREATE

UPDATE

DELETE

TRANSFER

COMMUNICATE
```

This is useful for broad rules.

Example:

```text
DELETE operations require higher scrutiny.
```

But operation class must never replace detailed action semantics.

---

# 24. Semantic Verb

Human-readable normalized operation.

Example:

```text
refund
```

or:

```text
send
```

or:

```text
delete
```

This supports explanations and research analysis.

---

# 25. Tool Reference

```typescript
interface ToolReference {
  toolId: string;
  toolVersion: string;

  adapterId: string;
  adapterVersion: string;

  externalProvider?: string;
  externalOperation?: string;
}
```

Example:

```text
tool_id:
payment.refund

tool_version:
3.2

adapter:
stripe-refund-adapter

external_operation:
POST /v1/refunds
```

The semantic operation must not depend on the external provider.

A Stripe refund and another provider's refund may map to the same canonical action family.

---

# 26. Canonical Parameters

Raw tool parameters are not enough.

Each decision-relevant parameter must have canonical meaning.

```typescript
interface CanonicalParameter {
  name: string;

  semanticType: string;

  value: unknown;

  unit?: string;

  sensitivityClass?: string;

  decisionRelevance:
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "NONE";

  mutable: boolean;
}
```

Example:

```text
Raw:

amount = 1840000
```

Canonical:

```text
name:
amount

semantic_type:
money

value:
18400

unit:
INR

decision_relevance:
CRITICAL
```

This prevents unit confusion.

---

# 27. Parameter Materiality

Not every parameter change requires reassessment.

Example:

```text
Email body punctuation changed.
```

This may not materially change the action.

But:

```text
Recipient changed.
```

is material.

Likewise:

```text
Refund amount:
₹18,400 → ₹18,500
```

may be material.

Each parameter schema must define:

```text
Materiality class

Comparison method

Tolerance if applicable
```

Example:

```typescript
interface ParameterMaterialityRule {
  parameterName: string;

  materiality:
    | "ALWAYS"
    | "THRESHOLD"
    | "SEMANTIC"
    | "NEVER";

  threshold?: number;
}
```

A materially changed action invalidates the existing contract.

---

# 28. Layer 3 — Targets

The target model answers:

> Who or what will be directly acted upon?

```typescript
interface ActionTarget {
  targetId?: string;

  targetType: string;

  role:
    | "PRIMARY"
    | "SECONDARY"
    | "BENEFICIARY"
    | "AFFECTED"
    | "DESTINATION"
    | "SOURCE";

  scope: TargetScope;

  attributes: Record<string, unknown>;
}
```

Example:

```text
Primary target:

Customer C829
```

```text
Source:

Company payment account
```

```text
Destination:

Customer payment method
```

---

# 29. Target Scope

```typescript
interface TargetScope {
  knownCount?: number;

  estimatedCount?: number;

  countConfidence?: number;

  selector?: string;

  bounded: boolean;
}
```

This is essential.

Compare:

```text
send_email(to = customer_829)
```

with:

```text
send_email(to = all_customers)
```

The tool may be identical.

The target scope is radically different.

---

# 30. Bounded vs Unbounded Targets

A target is bounded when the affected set is known before execution.

Example:

```text
3 named customers
```

A target may be unbounded when defined by a query:

```text
all customers matching:
status = active
```

The count may change between assessment and execution.

This creates a special risk.

AEGIS must preserve the selector and, where necessary, bind execution to a resolved target snapshot.

Otherwise:

```text
Assessment time:
1,000 matching customers
```

may become:

```text
Execution time:
100,000 matching customers
```

The Consequence Engine and Execution Runtime must account for this.

---

# 31. Layer 3 — Context

Context answers:

> Under what circumstances is this action occurring?

```typescript
interface ActionContext {
  structured: Record<string, CanonicalContextValue>;

  semanticSummary?: string;

  environment: EnvironmentContext;

  temporal: TemporalContext;

  jurisdiction?: JurisdictionContext;
}
```

---

# 32. Structured Context

The structured context contains domain-relevant features.

For refund actions:

```text
case_type

payment_method

customer_country

merchant_country

fraud_flag

case_age

prior_refund_attempts

customer_risk_class
```

For infrastructure actions:

```text
environment

service_criticality

deployment_stage

active_incident

traffic_level

dependency_count
```

Different action types require different context schemas.

Therefore CAM uses:

```text
Core universal schema

+

Action-type-specific extension schema
```

---

# 33. Context Schema Registry

Every canonical action type must reference a context schema.

Example:

```text
Action Type:

ISSUE_CUSTOMER_REFUND
```

Schema:

```text
refund-context-v3
```

Required fields:

```text
case_type

currency

payment_environment
```

Optional fields:

```text
fraud_flag

customer_risk_class

prior_refund_count
```

This prevents arbitrary unstructured context from becoming the basis of competence estimation.

---

# 34. Environment Context

```typescript
interface EnvironmentContext {
  environmentType:
    | "LOCAL"
    | "DEVELOPMENT"
    | "STAGING"
    | "SANDBOX"
    | "PRODUCTION";

  environmentId?: string;

  stateVersion?: string;

  healthStatus?:
    | "NORMAL"
    | "DEGRADED"
    | "INCIDENT"
    | "UNKNOWN";
}
```

The same action may deserve different autonomy in:

```text
sandbox
```

versus:

```text
production
```

---

# 35. Temporal Context

```typescript
interface TemporalContext {
  proposedAt: Timestamp;

  requestedExecutionTime?: Timestamp;

  deadline?: Timestamp;

  urgency:
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "CRITICAL";

  timeWindowReference?: string;
}
```

Urgency is descriptive.

Urgency must not automatically increase autonomy.

A system must not reason:

```text
This is urgent.

Therefore bypass safety.
```

Urgency may change escalation routing or response deadlines.

---

# 36. Jurisdiction Context

Some actions depend on geography or legal context.

```typescript
interface JurisdictionContext {
  primaryJurisdiction?: string;
  affectedJurisdictions?: string[];
  dataResidencyRegion?: string;
}
```

V1 will not become a compliance engine.

The field exists so domain-specific policies can reason about jurisdiction when configured.

---

# 37. Layer 4 — Evidence

The evidence block answers:

> What information supports the proposed action?

```typescript
interface EvidenceReference {
  evidenceId: string;

  evidenceType:
    | "DATABASE_RECORD"
    | "DOCUMENT"
    | "API_RESPONSE"
    | "USER_STATEMENT"
    | "AGENT_OBSERVATION"
    | "HUMAN_ASSESSMENT"
    | "SYSTEM_EVENT"
    | "OTHER";

  sourceId: string;

  sourceTrustClass?: string;

  observedAt?: Timestamp;

  validAt?: Timestamp;

  freshnessStatus?:
    | "FRESH"
    | "STALE"
    | "EXPIRED"
    | "UNKNOWN";

  claimRefs: string[];
}
```

The CAM stores evidence references.

It does not duplicate all evidence content.

---

# 38. Evidence Is Not the Same as Context

Context says:

```text
customer_country = IN
```

Evidence says:

```text
This value came from customer record CR-829,
version 14,
retrieved at 10:02:11.
```

This distinction is critical for audit and uncertainty.

---

# 39. Claim Model

An action rationale may contain claims.

Example:

```text
Claim 1:
Customer was charged twice.

Claim 2:
Both charges settled.

Claim 3:
No prior refund exists.
```

Evidence should support claims, not merely attach to the action generically.

Conceptually:

```typescript
interface ActionClaim {
  claimId: string;
  statement: string;

  importance:
    | "CRITICAL"
    | "SUPPORTING"
    | "OPTIONAL";

  evidenceRefs: string[];
}
```

This will become important in SPEC-005.

The Uncertainty Engine can ask:

```text
Are all critical claims supported?

Do sources contradict one another?

Is evidence stale?
```

---

# 40. Layer 4 — Proposed Effects

This is one of the most important parts of CAM.

An operation describes:

```text
What is being done?
```

Effects describe:

```text
What may change if it succeeds?
```

```typescript
interface ProposedEffect {
  effectId: string;

  effectType:
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

  direction?: "INBOUND" | "OUTBOUND" | "INTERNAL";

  magnitude?: EffectMagnitude;

  affectedTargetRefs: string[];

  certainty:
    | "CERTAIN"
    | "EXPECTED"
    | "POSSIBLE"
    | "UNKNOWN";

  source:
    | "TOOL_METADATA"
    | "DETERMINISTIC_DERIVATION"
    | "CONFIGURATION"
    | "AI_INFERENCE"
    | "AGENT_DECLARATION";
}
```

---

# 41. Effect Magnitude

Magnitude must be typed.

```typescript
type EffectMagnitude =
  | {
      type: "MONETARY";
      amount: number;
      currency: string;
    }
  | {
      type: "ENTITY_COUNT";
      count: number;
    }
  | {
      type: "DATA_VOLUME";
      value: number;
      unit: string;
    }
  | {
      type: "DURATION";
      value: number;
      unit: string;
    }
  | {
      type: "RESOURCE";
      value: number;
      unit: string;
    };
```

A generic:

```text
magnitude = 8
```

is prohibited at the CAM layer.

Normalized risk scores belong downstream.

CAM preserves real meaning.

---

# 42. Direct and Indirect Effects

Example:

```text
Issue refund
```

Direct effect:

```text
₹18,400 transferred to customer
```

Possible indirect effects:

```text
Case status changes

Customer receives notification

Accounting balance changes
```

CAM should distinguish:

```text
DIRECT

EXPECTED_SECONDARY

POSSIBLE_SECONDARY
```

V1 will prioritize direct effects and known deterministic secondary effects.

Speculative effect explosion must be avoided.

---

# 43. Effect Source Reliability

Effects may come from different sources.

Example:

```text
Tool registry says:
Refund transfers money.
```

This is strong structured metadata.

Another effect may be inferred by an LLM:

```text
This action may create reputational exposure.
```

That is weaker.

The source must remain visible.

The Consequence Engine can treat them differently.

---

# 44. Side-Effect Declaration

Every registered tool must declare known side effects.

Example:

```text
Tool:
payment.refund
```

Declared effects:

```text
FINANCIAL_TRANSFER

PAYMENT_STATE_CHANGE

POSSIBLE_CUSTOMER_NOTIFICATION
```

Unknown tools must not default to:

```text
no side effects
```

They must default to:

```text
side effects unknown
```

This invokes safe degradation.

---

# 45. Layer 4 — Sequence Context

An individual action may be safe while a sequence is dangerous.

The sequence block answers:

> What larger chain does this action belong to?

```typescript
interface SequenceContext {
  taskRunId?: string;

  sequenceId?: string;

  sequencePosition?: number;

  priorActionIds: string[];

  plannedNextActionTypes?: string[];

  cumulativeActionCount?: number;

  repeatedActionCount?: number;

  batchId?: string;
}
```

---

# 46. Why Sequence Context Is Mandatory

Consider:

```text
Action:
Send one email
```

Low consequence.

Repeated:

```text
100,000 times
```

High consequence.

Or:

```text
Action 1:
Create admin account

Action 2:
Grant permission

Action 3:
Export database
```

Each action may appear independently explainable.

The sequence creates a larger pattern.

CAM must preserve enough sequence context for future cumulative analysis.

---

# 47. Batch Actions

A batch action must not be disguised as many independent actions.

Example:

```text
Refund 5,000 customers
```

The system may represent:

```text
One batch action
```

with child actions.

The parent must preserve aggregate scope.

Otherwise an agent could bypass consequence controls by splitting:

```text
₹10,00,000 transfer
```

into:

```text
1,000 × ₹1,000 transfers
```

This is known as action fragmentation.

CAM must support detection.

---

# 48. Layer 4 — Execution Descriptor

The execution block describes how the action would reach the real world.

```typescript
interface ExecutionDescriptor {
  executionType:
    | "TOOL_CALL"
    | "API_CALL"
    | "DATABASE_OPERATION"
    | "MESSAGE"
    | "WORKFLOW"
    | "HUMAN_TASK";

  effectorId: string;

  idempotencySupport:
    | "NATIVE"
    | "AEGIS_MANAGED"
    | "NONE"
    | "UNKNOWN";

  simulationSupport:
    | "FULL"
    | "PARTIAL"
    | "NONE"
    | "UNKNOWN";

  compensationSupport:
    | "FULL"
    | "PARTIAL"
    | "NONE"
    | "UNKNOWN";

  executionConstraints: ExecutionConstraint[];
}
```

This information does not itself decide reversibility.

It informs SPEC-006 and SPEC-009.

---

# 49. Idempotency

AEGIS must know whether retrying an action may duplicate its effects.

Example:

```text
Refund API request times out.
```

Did the refund happen?

If AEGIS retries blindly:

```text
Customer may receive two refunds.
```

Therefore CAM records idempotency capability.

This becomes essential for execution safety.

---

# 50. Simulation Support

The L3 autonomy level requires simulation semantics.

A tool may support:

```text
FULL SIMULATION

Actual provider sandbox
```

or:

```text
PARTIAL SIMULATION

Local consequence estimate only
```

or:

```text
NO SIMULATION
```

The Autonomy Engine must not grant L3 as though meaningful simulation exists when it does not.

---

# 51. Compensation Support

Compensation is not the same as reversal.

Example:

```text
Send email
```

Cannot be unsent.

Possible compensation:

```text
Send correction email.
```

Therefore CAM only records whether a known compensating operation exists.

SPEC-006 determines reversibility quality.

---

# 52. Layer 5 — Field Provenance

Every decision-relevant field must have provenance.

```typescript
interface FieldProvenance {
  fieldPath: string;

  origin:
    | "AGENT_SUPPLIED"
    | "USER_SUPPLIED"
    | "TOOL_SCHEMA"
    | "DETERMINISTIC_DERIVATION"
    | "EXTERNAL_ENRICHMENT"
    | "AI_INFERENCE"
    | "SYSTEM_DEFAULT"
    | "HUMAN_OVERRIDE";

  sourceReference?: string;

  producedAt: Timestamp;

  producerVersion?: string;

  confidence?: number;

  validationStatus:
    | "VALIDATED"
    | "UNVALIDATED"
    | "CONTRADICTED"
    | "NOT_APPLICABLE";
}
```

---

# 53. Why Field-Level Provenance Matters

Suppose CAM contains:

```text
case_type = duplicate_charge
```

This could mean:

```text
Database explicitly says:
duplicate_charge
```

or:

```text
Agent guessed:
probably duplicate_charge
```

or:

```text
LLM inferred from customer message.
```

These must not be treated identically.

Field-level provenance allows downstream systems to reason correctly.

---

# 54. Human Overrides

Humans may correct a canonical field.

Example:

```text
AI inferred:

case_type = duplicate_charge
```

Human changes:

```text
case_type = fraud_dispute
```

The original value must remain in history.

The new field provenance becomes:

```text
origin:
HUMAN_OVERRIDE
```

The action receives a new version if the field is decision-relevant.

---

# 55. Action Integrity

The integrity block binds the action to the exact assessed representation.

```typescript
interface ActionIntegrity {
  canonicalFingerprint: string;

  materialFingerprint: string;

  rawProposalHash: string;

  normalizationInputHash: string;

  schemaVersion: string;

  taxonomyVersion: string;

  adapterVersion: string;

  normalizerVersion: string;
}
```

---

# 56. Canonical Fingerprint

The canonical fingerprint hashes the complete normalized representation relevant to audit.

Conceptually:

```text
canonical_fingerprint =
SHA-256(
  canonical_serialization(
    canonical_action
  )
)
```

Serialization must be deterministic.

This requires:

```text
Stable field ordering

Stable number formatting

Stable timestamp representation

Explicit null handling

Canonical Unicode normalization
```

---

# 57. Material Fingerprint

The material fingerprint includes only fields that affect:

```text
Authority

Assessment

Execution semantics
```

This allows AEGIS to distinguish:

```text
Non-material metadata change
```

from:

```text
Material action mutation
```

Example:

```text
UI display label changed
```

Canonical fingerprint may change.

Material fingerprint may remain the same.

But:

```text
refund amount changed
```

must change the material fingerprint.

---

# 58. Raw Proposal Hash

The original proposal payload is hashed.

This allows AEGIS to prove which exact source request produced the canonical action.

---

# 59. Canonical Serialization

Before hashing, the system must serialize CAM deterministically.

The canonicalization algorithm must define:

```text
Object key ordering

Array ordering semantics

Decimal normalization

Currency precision

Timestamp normalization

Unicode normalization

Null handling

Boolean representation
```

This will be specified in implementation detail later.

Floating-point values must not be used for money.

---

# 60. Money Representation

Money must use:

```text
Decimal
```

or:

```text
Integer minor units
```

Never binary floating point.

Example:

```text
₹18,400.50
```

Canonical representation:

```text
amount_minor = 1840050

currency = INR
```

or exact decimal representation.

The system must choose one consistent internal standard.

Recommended:

```text
Integer minor units
+
ISO 4217 currency code
```

---

# 61. Metadata

```typescript
interface ActionMetadata {
  schemaVersion: string;

  createdAt: Timestamp;
  canonicalizedAt: Timestamp;

  expiresAt?: Timestamp;

  tags?: string[];

  debugReferences?: string[];
}
```

Metadata must not contain hidden decision-critical values.

If a field influences an assessment, it belongs in the formal model.

---

# 62. Raw Action Proposal Model

Before CAM exists, the Gateway receives:

```typescript
interface RawActionProposal {
  proposalId: string;

  agentIdentity: ActorIdentity;

  objectiveId: string;

  toolRequest: {
    toolName: string;
    arguments: unknown;
  };

  agentContext?: {
    statedGoal?: string;
    rationale?: string;
    confidence?: number;
    evidenceRefs?: string[];
  };

  sequenceContext?: {
    taskRunId?: string;
    priorActionIds?: string[];
  };

  submittedAt: Timestamp;
}
```

The raw proposal is intentionally smaller than CAM.

The agent should not be trusted to self-declare every consequence or canonical feature.

---

# 63. The Action Adapter Layer

Different agent systems produce different action formats.

Therefore AEGIS requires adapters.

Examples:

```text
OpenAI tool-call adapter

Anthropic tool-use adapter

LangGraph adapter

MCP adapter

Direct SDK adapter

REST action adapter
```

Adapter responsibility:

```text
External format
        ↓
Raw Action Proposal
```

Adapters must not perform final semantic judgment.

They only translate protocol-level structure.

---

# 64. Tool Registry

The Tool Registry is essential to canonicalization.

Each governed tool must register:

```text
Tool identity

Version

Input schema

Canonical capability

Action type mapping

Parameter mappings

Known side effects

Target extraction rules

Magnitude extraction rules

Idempotency behavior

Simulation support

Compensation support

Materiality rules
```

Example:

```text
TOOL REGISTRATION

tool_id:
payment.refund

capability:
customer.refund

action_type:
ISSUE_CUSTOMER_REFUND

operation_class:
TRANSFER

parameter_mapping:

customer_id
→ target.primary.id

amount
→ operation.parameters.amount

currency
→ operation.parameters.currency

known_effects:

FINANCIAL_TRANSFER
PAYMENT_STATE_CHANGE
```

Without a registered tool schema, AEGIS cannot safely assume it understands the action.

---

# 65. Unknown Tool Policy

If an unregistered tool appears:

```text
Tool:
do_something_powerful()
```

AEGIS must not guess that it is harmless.

Default state:

```text
TOOL SEMANTICS UNKNOWN
```

Possible V1 behavior:

```text
Allow read-only observation in development

Require registration for production execution

Degrade autonomy to L1 or L0 depending on policy
```

Exact behavior will be defined in SPEC-009 and SPEC-016.

---

# 66. Action Normalization Pipeline

The complete normalization pipeline is:

```text
STEP 1
Receive raw proposal

STEP 2
Authenticate actor

STEP 3
Validate raw schema

STEP 4
Resolve tool registration

STEP 5
Map raw parameters

STEP 6
Resolve semantic operation

STEP 7
Extract targets

STEP 8
Extract typed magnitudes

STEP 9
Load required context schema

STEP 10
Perform deterministic enrichment

STEP 11
Perform permitted semantic enrichment

STEP 12
Resolve evidence references

STEP 13
Derive known effects

STEP 14
Attach sequence context

STEP 15
Attach execution semantics

STEP 16
Record field provenance

STEP 17
Validate canonical completeness

STEP 18
Calculate fingerprints

STEP 19
Persist immutable action version

STEP 20
Emit ACTION_CANONICALIZED
```

---

# 67. Deterministic Enrichment

Preferred enrichment is deterministic.

Example:

```text
customer_id = C829
```

Lookup:

```text
Customer record
```

Enriched fields:

```text
customer_country = IN

customer_risk_class = STANDARD
```

The lookup source and version must be preserved.

---

# 68. AI-Assisted Enrichment

AI may be used where semantic interpretation is necessary.

Example:

```text
Customer message:

"I can see the same payment twice and I only bought one item."
```

AI may infer candidate:

```text
case_type = duplicate_charge
```

But the field must record:

```text
origin:
AI_INFERENCE

confidence:
0.91

validation:
UNVALIDATED
```

The AI cannot silently turn interpretation into fact.

---

# 69. AI-Enrichment Validation

Decision-critical AI-inferred fields should support one of:

```text
Schema validation

Cross-source validation

Rule validation

Human validation

Secondary deterministic verification
```

If validation is unavailable, uncertainty must remain visible.

---

# 70. Required vs Optional CAM Fields

Not every action requires every field.

The system uses three levels.

```text
CORE REQUIRED

Required for every action.
```

Examples:

```text
action identity

agent identity

objective reference

canonical operation

tool reference

integrity metadata
```

```text
ACTION-TYPE REQUIRED

Required for specific action families.
```

Example for refunds:

```text
amount

currency

customer target
```

```text
OPTIONAL

Useful but not always available.
```

Example:

```text
agent rationale
```

Missing optional fields remain absent.

Missing required fields cause canonicalization failure.

---

# 71. Canonicalization Failure

Possible failure codes:

```text
UNKNOWN_TOOL

INVALID_RAW_SCHEMA

MISSING_REQUIRED_PARAMETER

UNKNOWN_ACTION_TYPE

CONTEXT_SCHEMA_FAILURE

ENRICHMENT_FAILURE

AMBIGUOUS_TARGET

INVALID_MAGNITUDE

UNSUPPORTED_UNIT

PROVENANCE_FAILURE

FINGERPRINT_FAILURE
```

A canonicalization failure means the action cannot enter normal autonomy assessment.

The system must not create a partially valid action and pretend normalization succeeded.

---

# 72. Partial Semantic Knowledge

Some fields may remain unknown even when CAM is valid.

Example:

```text
Affected entity count:
UNKNOWN
```

The CAM may still be valid if the schema permits uncertainty.

Downstream systems then degrade autonomy appropriately.

This is different from malformed data.

The system distinguishes:

```text
VALID AND UNKNOWN
```

from:

```text
INVALID
```

---

# 73. Action-Type Extension Model

A universal schema alone is insufficient.

Therefore CAM supports typed extensions.

Example:

```typescript
interface RefundActionExtension {
  caseType:
    | "DUPLICATE_CHARGE"
    | "SERVICE_FAILURE"
    | "FRAUD_DISPUTE"
    | "OTHER"
    | "UNKNOWN";

  amountMinor: number;

  currency: string;

  paymentEnvironment:
    | "DOMESTIC"
    | "INTERNATIONAL"
    | "UNKNOWN";

  priorRefundAttempts: number;

  paymentMethodClass?: string;
}
```

Another action type:

```typescript
interface ExternalEmailExtension {
  recipientCount: number;

  recipientScope:
    | "INTERNAL"
    | "EXTERNAL"
    | "MIXED";

  containsSensitiveData: boolean;

  campaignLike: boolean;
}
```

This provides:

```text
Universal comparability
+
Domain-specific precision
```

---

# 74. Competence Feature View

The Competence Engine should not consume the entire CAM directly.

Instead, CAM produces a versioned feature view.

Example:

```text
COMPETENCE FEATURE VIEW

domain:
customer_finance

action_type:
ISSUE_CUSTOMER_REFUND

case_type:
DUPLICATE_CHARGE

amount_band:
5000_TO_25000

payment_environment:
DOMESTIC

customer_risk_class:
STANDARD
```

This feature view is derived from CAM.

It is not stored as an independent truth.

The feature extractor must be versioned.

SPEC-003 will define it formally.

---

# 75. Novelty Feature View

The Novelty Engine may use:

```text
Structured categorical features

Normalized continuous features

Semantic embedding
```

Example:

```text
amount:
18400

case_age_days:
3

evidence_count:
4

semantic_case_embedding:
[...]
```

Again, the source remains CAM.

---

# 76. Consequence Feature View

The Consequence Engine may use:

```text
effect types

monetary magnitude

target count

external visibility

data sensitivity

execution semantics

sequence scope
```

The CAM must preserve all of these without pre-calculating the final consequence score.

---

# 77. Authority Feature View

The Authority Engine primarily uses:

```text
principal

agent

objective

delegation path

capability

action type

targets

parameters

jurisdiction

time
```

This allows rules such as:

```text
Agent may issue customer refunds
up to ₹25,000
for domestic duplicate-charge cases.
```

---

# 78. Example Complete Canonical Action

Consider:

```text
RefundAgent-v4 proposes:

refund ₹18,400 to customer C829
for a duplicate payment.
```

The simplified CAM becomes:

```text
CANONICAL ACTION

IDENTITY

action_id:
ACT-829

version:
1


ACTOR

agent:
RefundAgent

agent_version:
4.2

model:
configured-model-version

toolset_version:
7


LINEAGE

principal:
Operations-Team

intent:
Resolve legitimate duplicate payments

objective:
Resolve CASE-829

trigger:
AGENT_DECISION


PURPOSE

goal:
Refund verified duplicate charge

expected_outcome:
Customer receives ₹18,400


OPERATION

domain:
customer_finance

capability:
customer.refund

action_type:
ISSUE_CUSTOMER_REFUND

operation_class:
TRANSFER

semantic_verb:
refund


PARAMETERS

amount:
1,840,000 minor INR units

currency:
INR


TARGETS

primary:
Customer C829

source:
Company payment account

destination:
Customer payment method


CONTEXT

case_type:
DUPLICATE_CHARGE

payment_environment:
DOMESTIC

customer_risk_class:
STANDARD

prior_refund_attempts:
0


EVIDENCE

Payment Record A

Payment Record B

Customer Complaint

Prior Refund Lookup


EFFECTS

₹18,400 outbound financial transfer

Payment record state change

Possible customer notification


SEQUENCE

task_run:
CASE-829

prior actions:
Read payment records
Compare transactions


EXECUTION

effector:
Payment Provider

idempotency:
NATIVE

simulation:
PARTIAL

compensation:
PARTIAL


INTEGRITY

canonical fingerprint:
...

material fingerprint:
...

schema version:
CAM-1.0

normalizer version:
NORM-1.0
```

This is the object every AEGIS engine understands.

---

# 79. Example: Same Tool, Different Canonical Actions

Raw tool:

```text
send_email()
```

Action A:

```text
Recipient count:
1

Recipient:
Internal employee

Content:
Meeting reminder

Sensitive data:
None
```

Action B:

```text
Recipient count:
100,000

Recipients:
External customers

Content:
Account security warning

Sensitive data:
Possible
```

Same tool.

Different CAM.

Therefore:

```text
Different competence region

Different novelty

Different consequence

Different autonomy level
```

This demonstrates why tool-level permission is insufficient.

---

# 80. Example: Different Tools, Similar Canonical Actions

Tool A:

```text
stripe.refund()
```

Tool B:

```text
adyen.create_refund()
```

Both may canonicalize to:

```text
capability:
customer.refund

action_type:
ISSUE_CUSTOMER_REFUND
```

This allows competence evidence to generalize across provider changes where appropriate.

Tool-specific execution competence may still remain a separate feature.

---

# 81. Example: Action Fragmentation Attack

Agent wants:

```text
Transfer ₹1,00,000
```

Policy creates high scrutiny.

Agent instead proposes:

```text
100 transfers of ₹1,000
```

Individually:

```text
Low magnitude
```

Collectively:

```text
₹1,00,000
```

CAM supports detection using:

```text
sequence_id

batch_id

repeated_action_count

target relationship

time window

cumulative magnitude
```

The Consequence and Autonomy systems can escalate the sequence.

---

# 82. Example: Parameter Mutation Attack

AEGIS assesses:

```text
refund ₹1,000
```

Contract is created.

Before execution, agent changes:

```text
amount = ₹50,000
```

Execution Runtime recalculates:

```text
material fingerprint
```

Mismatch detected.

Result:

```text
EXECUTION BLOCKED

Reason:
ACTION_MUTATED_AFTER_ASSESSMENT
```

A new action version is required.

---

# 83. Example: AI-Inferred Context

Customer writes:

```text
"I see the payment twice."
```

AI infers:

```text
case_type:
DUPLICATE_CHARGE
```

CAM records:

```text
value:
DUPLICATE_CHARGE

origin:
AI_INFERENCE

confidence:
0.91

validation:
UNVALIDATED
```

Payment records later show:

```text
One charge only.
```

The field becomes contradicted.

The Uncertainty Engine can detect:

```text
Critical semantic context conflict
```

The CAM architecture makes this possible because provenance was preserved.

---

# 84. Database Ownership

The Action System owns:

```text
raw_action_proposals

canonical_actions

canonical_action_versions

action_targets

action_parameters

action_context_values

action_effects

action_evidence_links

action_claims

action_dependencies

action_provenance

action_integrity

action_sequence_links
```

The exact relational schema will be designed in SPEC-011.

The conceptual ownership is locked here.

---

# 85. Event Model

The Action System emits:

```text
ACTION_PROPOSED

ACTION_ADAPTER_RESOLVED

ACTION_NORMALIZATION_STARTED

ACTION_ENRICHED

ACTION_CANONICALIZED

ACTION_CANONICALIZATION_FAILED

ACTION_VERSION_CREATED

ACTION_SUPERSEDED

ACTION_MUTATION_DETECTED

ACTION_EXPIRED
```

Events must include references.

They should not duplicate the full action payload unnecessarily.

---

# 86. API Boundary

Conceptual endpoint:

```text
POST /v1/actions/propose
```

Input:

```text
RawActionProposal
```

Output:

```text
proposal accepted
+
action reference
```

Internal canonicalization may complete synchronously for V1.

Conceptual retrieval:

```text
GET /v1/actions/{action_id}
```

Conceptual version retrieval:

```text
GET /v1/actions/{action_id}/versions/{version}
```

Exact API design belongs to SPEC-012.

---

# 87. Performance Requirements

Initial targets:

```text
Raw schema validation:
< 10 ms

Registered tool mapping:
< 10 ms

Deterministic normalization:
< 50 ms

Database enrichment:
Dependent on source latency

AI-assisted enrichment:
Optional and separately budgeted
```

The deterministic path should remain fast.

The system must not require an LLM call for every action.

Common registered actions should canonicalize primarily through:

```text
Tool metadata

Parameter mapping

Structured context

Deterministic enrichment
```

---

# 88. Caching Rules

Safe cache candidates:

```text
Tool schemas

Taxonomy definitions

Context schemas

Static mapping rules
```

Unsafe cache assumptions:

```text
Current customer state

Current delegation

Current environment health

Current target count
```

Dynamic data requires freshness semantics.

---

# 89. Privacy Principle

CAM may reference sensitive data.

The system should minimize duplication.

Prefer:

```text
Evidence reference
```

over:

```text
Copy entire private document into CAM
```

Prefer:

```text
customer_id
```

over:

```text
full customer identity
```

unless the full value is required for assessment or execution.

Field-level sensitivity classification should be supported.

---

# 90. Security Requirements

The CAM pipeline must defend against:

```text
Malformed payloads

Oversized payloads

Schema confusion

Unit confusion

Parameter smuggling

Hidden extra fields

Tool identity spoofing

Action replay

Post-assessment mutation

Provenance forgery

Sequence fragmentation

Target expansion

AI enrichment injection
```

Unknown fields in security-sensitive schemas should default to rejection unless explicitly permitted.

---

# 91. Testing Strategy

CAM requires five major test categories.

## 91.1 Schema Tests

Verify:

```text
Required fields

Invalid types

Unknown fields

Boundary values

Null behavior
```

---

## 91.2 Canonicalization Tests

Given raw input:

```text
X
```

Expected CAM:

```text
Y
```

These should use golden fixtures.

---

## 91.3 Semantic Equivalence Tests

Different raw tools representing equivalent actions should produce comparable canonical semantics.

---

## 91.4 Mutation Tests

Changing material fields must change:

```text
material fingerprint
```

Changing non-material fields should not.

---

## 91.5 Adversarial Tests

Examples:

```text
Amount unit manipulation

Target selector expansion

Tool spoofing

Action fragmentation

Hidden side effects

Conflicting enrichment

Malformed AI inference

Replay of expired proposal
```

---

# 92. Benchmark Requirements

The CAM system must eventually be evaluated on:

```text
Normalization accuracy

Action-type classification accuracy

Target extraction accuracy

Magnitude extraction accuracy

Semantic equivalence retrieval

Material mutation detection

Unknown-field preservation

Provenance completeness

Normalization latency
```

A benchmark dataset should include:

```text
Normal actions

Ambiguous actions

Equivalent actions from different tools

Adversarial actions

Incomplete actions

Novel tools

Sequence attacks
```

---

# 93. V1 Scope

The first implementation should support a constrained domain.

Recommended flagship domain:

```text
Customer refund operations
```

Initial action types:

```text
READ_CUSTOMER_CASE

READ_PAYMENT_RECORD

ISSUE_CUSTOMER_REFUND

UPDATE_CASE_STATUS

SEND_CUSTOMER_EMAIL

ESCALATE_CASE
```

This domain is sufficient to demonstrate:

```text
Read vs write actions

Financial magnitude

External communication

Different target scopes

Partial reversibility

Evidence conflict

Action sequences

Human escalation

Competence variation
```

We should not attempt universal action understanding in V1.

---

# 94. V1 Tool Registry

Initial registered tools:

```text
customer.get_case

payment.get_transactions

payment.issue_refund

case.update_status

communication.send_email

case.escalate
```

Each receives:

```text
Schema

Canonical mapping

Effect declaration

Materiality rules

Execution semantics
```

---

# 95. V1 Normalization Strategy

V1 should use:

```text
90% deterministic normalization

10% AI-assisted semantic enrichment
```

Deterministic:

```text
Tool mapping

Parameters

Money

Targets

Known effects

Execution metadata

Structured context
```

AI-assisted:

```text
Case type inference from unstructured complaint text

Semantic summary

Candidate assumptions

Candidate claims
```

The platform must remain functional if AI enrichment is disabled.

---

# 96. Rejected Alternatives

## Alternative A — Use Raw Tool Calls Directly

Rejected because:

```text
Framework-specific

Provider-specific

Weak semantic comparability

Poor competence generalization
```

---

## Alternative B — Use Only Natural-Language Action Descriptions

Rejected because:

```text
Ambiguous

Difficult to validate

Difficult to fingerprint

Difficult to enforce

Easy to manipulate
```

---

## Alternative C — Let an LLM Generate the Entire CAM

Rejected because:

```text
Non-deterministic

Expensive

Slow

Difficult to reproduce

May hallucinate effects

May hide uncertainty
```

---

## Alternative D — One Flat JSON Object

Rejected because it collapses:

```text
Identity

Purpose

Operation

Effect

Evidence

Provenance
```

into an unstructured bag of fields.

---

## Alternative E — Universal Ontology Before Building V1

Rejected because designing every possible agent action in advance would prevent implementation.

V1 uses:

```text
Stable universal core

+

Versioned domain extensions
```

---

# 97. Decisions Locked by SPEC-001

The following decisions are now architectural commitments:

```text
1. Every governed action receives a Canonical Action.

2. Raw requests are preserved.

3. CAM separates action meaning from tool implementation.

4. CAM separates operation from real-world effects.

5. CAM preserves field-level provenance.

6. Unknown values remain explicitly unknown.

7. Material action mutation requires reassessment.

8. Actions receive canonical and material fingerprints.

9. Tool semantics come from a versioned Tool Registry.

10. Context uses universal fields plus action-specific schemas.

11. AI may enrich CAM but may not silently create ground truth.

12. Sequence context is part of the action representation.

13. Batch fragmentation must be detectable.

14. Money uses exact representation, never floating point.

15. CAM does not contain autonomy decisions.

16. Every downstream engine receives a derived view of the same authoritative action.

17. V1 begins with customer refund operations.

18. The system must function without mandatory LLM calls in the critical path.
```

---

# 98. The Final CAM Mental Model

A raw agent says:

```text
"I want to call this function."
```

CAM transforms that into:

```text
WHO

is trying to do

WHAT

to

WHOM OR WHAT

under

WHICH OBJECTIVE

for

WHAT REASON

based on

WHICH EVIDENCE

in

WHAT CONTEXT

with

WHAT EXPECTED EFFECTS

as part of

WHICH LARGER SEQUENCE

through

WHICH EXECUTION MECHANISM

and

WHICH PARTS OF THIS DESCRIPTION
ARE FACTS, DERIVATIONS, OR INFERENCES?
```

That complete representation becomes the foundation for every autonomy decision in AEGIS.

---

# 99. Final Definition

The Canonical Action Model is:

> A versioned, immutable, provenance-aware semantic representation of a proposed agent action that separates actor identity, authority lineage, purpose, operation, targets, context, evidence, effects, sequence, and execution semantics from the framework-specific tool request that originally expressed the action.

Its purpose is not merely data standardization.

Its purpose is to ensure that every AEGIS engine is reasoning about the same action.

Without CAM:

```text
Authority evaluates one interpretation.

Competence evaluates another.

Risk evaluates another.

Execution performs another.
```

With CAM:

```text
ONE ACTION

ONE VERSION

ONE MATERIAL IDENTITY

ONE DECISION SNAPSHOT

MANY SPECIALIZED ASSESSMENTS
```

This is the shared language of AEGIS.