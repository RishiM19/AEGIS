# AEGIS TECHNICAL SPECIFICATION 006

## Consequence, Reversibility, and Blast Radius Engine

**Document ID:** AEGIS-SPEC-006  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Consequence Intelligence Architecture  
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-002, AEGIS-SPEC-003, AEGIS-SPEC-004, AEGIS-SPEC-005  
**Primary Owner:** Consequence Intelligence System  
**Primary Runtime Component:** Consequence Engine  
**Consumers:** Adaptive Autonomy Engine, Contract Engine, Execution Gateway, Recovery System, Dashboard, Research Harness, Benchmark System

---

# 0. Purpose of This Specification

This specification defines how AEGIS determines:

```text
What can happen if the proposed action is wrong?

Who and what can be affected?

How large can the impact become?

Can the action be reversed?

How completely can it be reversed?

How quickly can recovery happen?

What damage remains even after rollback?

Can the action trigger downstream effects?

Can those downstream effects escape AEGIS control?

Can the action be executed in a safer form?

Can the action be divided into smaller reversible steps?

What recovery mechanisms exist before execution?
```

The central problem is:

\[
Probability\ of\ Failure
\neq
Consequence\ of\ Failure
\]

An agent may have:

```text
Competence:
VERY HIGH

Novelty:
VERY LOW

Epistemic uncertainty:
VERY LOW
```

and still propose:

```text
Delete all customer records.
```

The action may be:

```text
Well understood

Familiar

Factually justified
```

while remaining:

```text
Catastrophic if wrong.
```

AEGIS therefore requires an independent consequence model.

Formally:

\[
K(a,x)
=
f(
I,
B,
R,
P,
C,
D,
T,
L
)
\]

where:

```text
a
=
agent identity

x
=
Canonical Action

I
=
impact magnitude

B
=
blast radius

R
=
reversibility

P
=
propagation potential

C
=
containment

D
=
damage duration

T
=
time sensitivity

L
=
legal, financial, and external liability
```

The output is not:

```text
SAFE
```

or:

```text
DANGEROUS
```

The output is:

```text
What can be harmed?

How severely?

How widely?

How quickly?

For how long?

How far can the action propagate?

Can the effects be contained?

Can they be reversed?

What residual damage remains?

What safer execution form exists?
```

---

# 1. Foundational Principle

AEGIS separates:

```text
LIKELIHOOD

from

CONSEQUENCE
```

An event with:

```text
1% failure probability
```

and:

```text
₹50 maximum loss
```

is not equivalent to:

```text
1% failure probability
```

and:

```text
Permanent deletion of 10 million customer records.
```

Therefore:

\[
Risk
\neq
Uncertainty
\]

and:

\[
Risk
\neq
Competence
\]

and:

\[
Risk
\neq
Novelty
\]

SPEC-006 owns the consequence side of autonomous action evaluation.

---

# 2. Core Consequence Separation

AEGIS separates:

\[
C(a,x)
=
Competence
\]

from:

\[
N(a,x)
=
Novelty
\]

from:

\[
U(x)
=
Epistemic\ Uncertainty
\]

from:

\[
K(x)
=
Consequence
\]

Possible state:

```text
HIGH COMPETENCE

LOW NOVELTY

LOW UNCERTAINTY

CATASTROPHIC CONSEQUENCE
```

Meaning:

```text
The agent knows how to perform the action.

The situation is familiar.

The facts are clear.

But failure would be unacceptable.
```

Another state:

```text
MODERATE COMPETENCE

HIGH NOVELTY

HIGH UNCERTAINTY

TRIVIAL CONSEQUENCE
```

Meaning:

```text
The action is poorly understood.

But failure causes almost no meaningful harm.
```

These states must never collapse prematurely into one generic risk score.

---

# 3. Why Action Type Alone Is Insufficient

Consider:

```text
ACTION TYPE:
SEND_EMAIL
```

Possible action A:

```text
Send internal test email
to one developer.
```

Possible action B:

```text
Send legal admission of liability
to 4 million customers.
```

Same action type.

Radically different consequences.

Therefore consequence depends on:

```text
Target

Scope

Payload

Audience

Timing

External visibility

Irreversibility

Propagation

Legal meaning

Financial exposure
```

not merely the action verb.

---

# 4. Why Monetary Value Alone Is Insufficient

Consider:

```text
Action A:
Refund ₹5,00,000
```

Possible harm:

```text
Financial loss
```

Now:

```text
Action B:
Publish private medical data
```

Direct monetary amount:

```text
₹0
```

Potential harm:

```text
Severe privacy violation

Legal exposure

Permanent disclosure

Reputational damage

Human harm
```

Therefore:

\[
Consequence
\neq
Financial\ Amount
\]

Financial exposure is only one dimension.

---

# 5. Consequence Intelligence Responsibilities

The Consequence Intelligence System owns:

```text
1. Define versioned consequence models.

2. Identify affected assets.

3. Identify affected subjects.

4. Estimate direct impact.

5. Estimate indirect impact.

6. Estimate blast radius.

7. Model effect propagation.

8. Detect irreversible effects.

9. Evaluate rollback capability.

10. Evaluate rollback completeness.

11. Evaluate rollback latency.

12. Estimate residual harm after recovery.

13. Evaluate containment boundaries.

14. Detect external side effects.

15. Detect cascading consequences.

16. Estimate time-to-harm.

17. Estimate time-to-detection.

18. Estimate recovery requirements.

19. Identify safer action transformations.

20. Identify staged execution opportunities.

21. Identify pre-execution recovery requirements.

22. Produce immutable Consequence Assessments.
```

---

# 6. Non-Responsibilities

The Consequence Engine does not determine:

```text
Whether the action is authorized

Whether the agent is competent

Whether the action is novel

Whether evidence is sufficient

Whether the action should execute

The final autonomy level
```

It answers:

> If this action is wrong, what is the shape and recoverability of the resulting harm?

---

# 7. Consequence Invariants

## CON-INV-001 — Consequence Is Independent of Confidence

High confidence does not reduce inherent consequence.

---

## CON-INV-002 — Reversible Is Not Harmless

An action may be reversible while still causing:

```text
Temporary outage

Customer confusion

Financial delay

Privacy exposure

Reputational harm
```

---

## CON-INV-003 — Technical Rollback Is Not Full Recovery

Restoring a database does not necessarily restore:

```text
Customer trust

External copies

Legal position

Market reaction

Human decisions already made
```

---

## CON-INV-004 — External Disclosure Is Not Fully Reversible

Once information leaves the controlled boundary, deletion cannot guarantee recovery.

---

## CON-INV-005 — Blast Radius Must Be Explicit

The system must distinguish:

```text
1 record

100 records

10 million records
```

---

## CON-INV-006 — Potential Scope Matters

A malformed action that intends one target but can affect an entire system must be assessed using reachable impact, not only stated intent.

---

## CON-INV-007 — Downstream Effects Must Be Modeled

The direct effect may trigger additional actions.

---

## CON-INV-008 — Irreversibility Must Survive Aggregation

A critical irreversible effect cannot disappear inside a low average score.

---

## CON-INV-009 — Rollback Must Be Verified

The existence of a rollback command does not prove recoverability.

---

## CON-INV-010 — Recovery Time Matters

A recoverable action that requires three weeks to restore is not equivalent to one reversible in 100 milliseconds.

---

## CON-INV-011 — Residual Harm Must Be Preserved

Recovery does not imply zero remaining damage.

---

## CON-INV-012 — Consequence Must Be Context-Specific

The same action can have different consequences in:

```text
Development

Staging

Production
```

---

## CON-INV-013 — Unknown Consequence Is Not Low Consequence

Insufficient consequence information must increase uncertainty about impact.

---

## CON-INV-014 — Consequence Assessment Must Be Reproducible

The same:

```text
Action version

Target state

Asset graph

Consequence model

Recovery configuration
```

must produce the same assessment.

---

# 8. Core Domain Objects

SPEC-006 defines:

```text
Affected Asset

Affected Subject

Impact Domain

Impact Event

Blast Radius

Propagation Graph

External Effect

Reversibility Profile

Recovery Mechanism

Recovery Plan

Residual Harm

Containment Boundary

Safer Action Variant

Staged Execution Plan

Consequence Assessment
```

---

# 9. Affected Asset

An asset is anything that can be damaged, changed, exposed, lost, or degraded.

Conceptual schema:

```typescript
interface AffectedAsset {
  assetId: string;

  assetType:
    | "DATA"
    | "ACCOUNT"
    | "FUNDS"
    | "SERVICE"
    | "INFRASTRUCTURE"
    | "IDENTITY"
    | "CREDENTIAL"
    | "DOCUMENT"
    | "MODEL"
    | "REPUTATION"
    | "LEGAL_POSITION"
    | "PHYSICAL_RESOURCE"
    | "EXTERNAL_SYSTEM";

  assetReference: string;

  ownerReference?: string;

  criticality:
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "CRITICAL";

  environment:
    | "DEVELOPMENT"
    | "TEST"
    | "STAGING"
    | "PRODUCTION";

  sensitivityClass?: string;

  recoverabilityClass?: string;
}
```

---

# 10. Affected Subject

A subject is a person, organization, system, or group that may experience harm.

Conceptual schema:

```typescript
interface AffectedSubject {
  subjectId: string;

  subjectType:
    | "USER"
    | "CUSTOMER"
    | "EMPLOYEE"
    | "ORGANIZATION"
    | "PARTNER"
    | "PUBLIC"
    | "SYSTEM"
    | "UNKNOWN";

  subjectReference?: string;

  estimatedCount: number;

  vulnerabilityClass?: string;

  jurisdiction?: string;
}
```

---

# 11. Why Assets and Subjects Are Separate

Consider:

```text
Delete 100 customer records.
```

Affected assets:

```text
100 database records
```

Affected subjects:

```text
100 customers
```

Now consider:

```text
Disable payment service.
```

Affected asset:

```text
1 service
```

Affected subjects:

```text
500,000 customers
```

Asset count and human impact count are not interchangeable.

---

# 12. Impact Domains

AEGIS evaluates consequences across independent domains.

Required V1 domains:

```text
FINANCIAL

DATA_INTEGRITY

PRIVACY

SECURITY

AVAILABILITY

OPERATIONAL

LEGAL

COMPLIANCE

REPUTATIONAL

CUSTOMER

EXTERNAL_SYSTEM

PHYSICAL
```

Not every deployment uses every domain.

---

# 13. Financial Impact

Includes:

```text
Direct monetary loss

Duplicate payment

Incorrect refund

Revenue loss

Penalty

Compensation

Recovery cost

Downstream financial liability
```

Financial consequence should expose:

```text
Expected amount

Maximum reachable amount

Currency

Recoverable amount

Irrecoverable amount
```

---

# 14. Data Integrity Impact

Includes:

```text
Deletion

Corruption

Incorrect mutation

Schema damage

Loss of provenance

Loss of audit history

Cross-record inconsistency
```

---

# 15. Privacy Impact

Includes:

```text
Unauthorized access

Unauthorized disclosure

Incorrect recipient

Excessive data exposure

Cross-tenant leakage

Public publication
```

Privacy harm may remain after technical rollback.

---

# 16. Security Impact

Includes:

```text
Credential exposure

Privilege escalation

Policy weakening

Access-control mutation

Secret leakage

Attack-surface expansion
```

---

# 17. Availability Impact

Includes:

```text
Service outage

Degraded performance

Resource exhaustion

Dependency failure

Regional unavailability
```

---

# 18. Operational Impact

Includes:

```text
Manual remediation

Support load

Workflow disruption

Backlog creation

Reconciliation work

Human review burden
```

---

# 19. Legal and Compliance Impact

Includes:

```text
Unauthorized commitment

Regulatory violation

Contract violation

Retention-policy breach

Audit failure

Illegal disclosure

Incorrect legal representation
```

---

# 20. Reputational Impact

Includes:

```text
Customer trust loss

Public criticism

Partner confidence loss

Brand damage
```

V1 should treat reputational impact as categorical.

It should not pretend to calculate precise monetary value.

---

# 21. Customer Impact

Includes:

```text
Incorrect charge

Loss of access

Delayed service

Confusion

Stress

Incorrect communication

Unfair treatment
```

---

# 22. External-System Impact

Includes:

```text
Third-party API mutation

Partner notification

Public publication

External transaction

Webhook cascade

External workflow trigger
```

External effects are especially important because AEGIS may not control their rollback.

---

# 23. Physical Impact

Relevant for future deployments involving:

```text
Robotics

Vehicles

Industrial systems

Medical devices

Physical infrastructure
```

V1 architecture must support the domain.

The flagship benchmark does not require physical actuation.

---

# 24. Impact Event

Conceptual schema:

```typescript
interface ImpactEvent {
  impactEventId: string;

  actionId: string;

  impactDomain: string;

  affectedAssetIds: string[];

  affectedSubjectIds: string[];

  effectType: string;

  directness:
    | "DIRECT"
    | "INDIRECT"
    | "CASCADED";

  severity:
    | "NEGLIGIBLE"
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "CRITICAL"
    | "CATASTROPHIC";

  estimatedMagnitude?: number;

  maximumMagnitude?: number;

  unit?: string;

  timeToHarmMs?: number;

  durationEstimateMs?: number;

  reversibilityProfileId?: string;
}
```

---

# 25. Direct Impact

A direct impact is created by the action itself.

Example:

```text
Action:
Refund ₹10,000
```

Direct effect:

```text
₹10,000 transferred.
```

---

# 26. Indirect Impact

Example:

```text
Incorrect refund
```

causes:

```text
Accounting discrepancy

Manual investigation

Customer communication

Potential collection process
```

These are indirect consequences.

---

# 27. Cascaded Impact

Example:

```text
Agent disables authentication service.
```

This causes:

```text
Login failure
```

which causes:

```text
Payment workflow failure
```

which causes:

```text
Order failure
```

which causes:

```text
Customer support spike.
```

AEGIS must model propagation.

---

# 28. Blast Radius

Blast radius answers:

> How much of the reachable system can this action affect?

It includes:

```text
Target count

Asset count

Subject count

Tenant count

Service count

Region count

Financial scope

Data scope

External recipient count
```

---

# 29. Intended Blast Radius

Example:

```text
Refund one transaction.
```

Intended scope:

```text
1 customer

1 transaction

₹5,000
```

---

# 30. Reachable Blast Radius

The execution mechanism may permit:

```text
All customer transactions.
```

If a parameter bug or malformed query can expand the target, the reachable blast radius is larger than intended scope.

AEGIS must expose both.

---

# 31. Maximum Credible Blast Radius

AEGIS should estimate:

> Under a credible execution failure, how far could the action spread?

This is not:

```text
Theoretically infinite worst case.
```

It is:

```text
The maximum impact reachable through realistic failure modes.
```

---

# 32. Blast Radius Dimensions

Conceptual schema:

```typescript
interface BlastRadius {
  intendedTargetCount: number;

  reachableTargetCount: number;

  maximumCredibleTargetCount: number;

  affectedAssetCount: number;

  affectedSubjectCount: number;

  affectedTenantCount: number;

  affectedServiceCount: number;

  affectedRegionCount: number;

  financialExposure?: MoneyRange;

  dataExposure?: DataScope;

  externalRecipientCount?: number;

  scopeExpansionRatio: number;
}
```

---

# 33. Scope Expansion Ratio

Define:

\[
SER
=
\frac{
Maximum\ Credible\ Scope
}{
Intended\ Scope
}
\]

Example:

```text
Intended:
1 record

Maximum credible:
1,000,000 records
```

Then:

\[
SER = 1,000,000
\]

A large scope expansion ratio is a major consequence signal.

---

# 34. Why Intended Scope Is Insufficient

SQL action:

```text
DELETE FROM transactions
WHERE transaction_id = ?
```

Intended:

```text
1 row
```

Malformed execution:

```text
DELETE FROM transactions
```

Reachable:

```text
All rows
```

Consequence assessment must inspect execution semantics.

---

# 35. Containment Boundary

A containment boundary limits propagation.

Examples:

```text
Single tenant

Single account

Single database transaction

Single region

Single sandbox

Single canary group

Single financial limit
```

Conceptual schema:

```typescript
interface ContainmentBoundary {
  boundaryId: string;

  boundaryType:
    | "TENANT"
    | "ACCOUNT"
    | "TRANSACTION"
    | "SERVICE"
    | "REGION"
    | "ENVIRONMENT"
    | "FINANCIAL_LIMIT"
    | "RECIPIENT_SET"
    | "CUSTOM";

  enforcedBy:
    | "DATABASE"
    | "API"
    | "INFRASTRUCTURE"
    | "AEGIS"
    | "EXTERNAL_SYSTEM";

  verificationState:
    | "VERIFIED"
    | "ASSUMED"
    | "UNKNOWN"
    | "FAILED";
}
```

---

# 36. Containment Strength

Containment should be classified:

```text
STRONG

MODERATE

WEAK

NONE

UNKNOWN
```

A parameter in an LLM prompt is not strong containment.

A database-level tenant constraint may be.

---

# 37. Hard vs Soft Containment

Hard containment:

```text
Database row-level security

API-enforced transaction limit

Sandbox boundary

Cryptographic tenant isolation
```

Soft containment:

```text
Prompt instruction

Agent intention

Natural-language policy

Application convention
```

AEGIS must distinguish them.

---

# 38. Propagation Graph

Actions can create effects that trigger other effects.

Conceptual graph:

```text
ACTION
  ↓
DIRECT EFFECT
  ↓
SYSTEM EVENT
  ↓
DOWNSTREAM SERVICE
  ↓
EXTERNAL ACTION
  ↓
SECONDARY CONSEQUENCE
```

---

# 39. Propagation Graph Model

Nodes:

```text
Action

Effect

Asset

Service

Event

External System

Human Recipient
```

Edges:

```text
MUTATES

TRIGGERS

NOTIFIES

PUBLISHES_TO

DEPENDS_ON

REPLICATES_TO

EXECUTES

PROPAGATES_TO
```

---

# 40. Example Propagation

```text
Refund created
    ↓
Ledger updated
    ↓
Webhook emitted
    ↓
Accounting system updated
    ↓
Customer email sent
    ↓
Partner reconciliation initiated
```

Rollback of the original refund may not automatically reverse all downstream effects.

---

# 41. Propagation Depth

Define:

```text
Depth 0:
Direct action

Depth 1:
Immediate effects

Depth 2:
Effects triggered by immediate effects

Depth 3+:
Cascading effects
```

High propagation depth increases recovery complexity.

---

# 42. Propagation Breadth

One action may trigger:

```text
1 downstream system
```

or:

```text
50 downstream systems.
```

Breadth matters independently from depth.

---

# 43. Propagation Velocity

Propagation may occur:

```text
Immediately

Within seconds

Within minutes

Over hours

Over days
```

Fast propagation reduces the intervention window.

---

# 44. Escape from Control

An effect escapes control when it reaches:

```text
External email recipient

Public internet

Third-party payment network

Partner system

Customer device

Human decision process
```

Once escaped, rollback guarantees weaken.

---

# 45. External Effect

Conceptual schema:

```typescript
interface ExternalEffect {
  externalEffectId: string;

  targetSystem: string;

  effectType: string;

  transmissionState:
    | "NOT_SENT"
    | "QUEUED"
    | "SENT"
    | "ACKNOWLEDGED"
    | "PROPAGATED";

  recallCapability:
    | "FULL"
    | "PARTIAL"
    | "NONE"
    | "UNKNOWN";

  downstreamControl:
    | "FULL"
    | "PARTIAL"
    | "NONE"
    | "UNKNOWN";
}
```

---

# 46. Reversibility

Reversibility asks:

> Can the system restore the relevant state after the action executes?

This is not Boolean.

AEGIS evaluates:

```text
Technical reversibility

Operational reversibility

Financial reversibility

Data reversibility

External reversibility

Human reversibility

Temporal reversibility
```

---

# 47. Reversibility Levels

Recommended classification:

```typescript
type ReversibilityLevel =
  | "FULLY_REVERSIBLE"
  | "MOSTLY_REVERSIBLE"
  | "PARTIALLY_REVERSIBLE"
  | "EFFECTIVELY_IRREVERSIBLE"
  | "STRICTLY_IRREVERSIBLE"
  | "UNKNOWN";
```

---

# 48. Fully Reversible

Requirements:

```text
Original state is known.

Rollback mechanism exists.

Rollback is tested.

All effects remain within controlled boundaries.

No material residual harm remains.

Rollback can complete within acceptable time.
```

This should be rare.

---

# 49. Mostly Reversible

Example:

```text
Configuration changed.

Rollback tested.

Brief service disruption may remain.
```

Technical state can be restored.

Small residual harm remains.

---

# 50. Partially Reversible

Example:

```text
Incorrect customer email sent.

Correction can be sent.

Original email cannot be unread.
```

---

# 51. Effectively Irreversible

A theoretical recovery mechanism exists, but practical recovery is infeasible.

Example:

```text
Restore 10 PB backup

Estimated recovery:
4 months
```

The action is effectively irreversible for runtime autonomy purposes.

---

# 52. Strictly Irreversible

Examples:

```text
Cryptographic key destruction without backup

Public disclosure of secret information

Physical destruction

Expired external legal deadline
```

---

# 53. Unknown Reversibility

Unknown must not default to:

```text
Reversible.
```

Unknown reversibility is itself a consequence concern.

---

# 54. Reversibility Profile

Conceptual schema:

```typescript
interface ReversibilityProfile {
  profileId: string;

  actionId: string;

  reversibilityLevel: ReversibilityLevel;

  rollbackMechanismIds: string[];

  rollbackCoverage: number;

  rollbackLatencyMs?: number;

  rollbackCost?: number;

  rollbackTestState:
    | "VERIFIED"
    | "TESTED_HISTORICALLY"
    | "UNTESTED"
    | "FAILED"
    | "UNKNOWN";

  externalEffectsRecoverable: boolean;

  residualHarmScore: number;

  reasonCodes: string[];
}
```

---

# 55. Rollback Coverage

Rollback coverage asks:

> What percentage of meaningful effects can the recovery mechanism reverse?

Example:

```text
Database state:
100% recoverable

Customer email:
0% recallable

Accounting webhook:
50% reversible

Customer confusion:
Not technically reversible
```

Overall rollback coverage must not hide domain-specific gaps.

---

# 56. Rollback Latency

Recovery time matters.

Example A:

```text
Rollback:
100 ms
```

Example B:

```text
Rollback:
72 hours
```

Both may technically be reversible.

Their consequence profiles differ substantially.

---

# 57. Rollback Cost

Recovery may require:

```text
Automated transaction

One engineer

Entire incident team

Legal intervention

Customer remediation

Partner coordination
```

Cost is part of practical reversibility.

---

# 58. Rollback Confidence

The system must distinguish:

```text
Rollback exists in documentation.
```

from:

```text
Rollback has been tested successfully.
```

Recommended states:

```text
VERIFIED

HISTORICALLY_PROVEN

UNTESTED

FAILED

UNKNOWN
```

---

# 59. Recovery Mechanism

Conceptual schema:

```typescript
interface RecoveryMechanism {
  mechanismId: string;

  mechanismType:
    | "TRANSACTION_ROLLBACK"
    | "COMPENSATING_ACTION"
    | "SNAPSHOT_RESTORE"
    | "BACKUP_RESTORE"
    | "VERSION_REVERT"
    | "RECALL"
    | "CANCELLATION"
    | "MANUAL_REMEDIATION";

  targetEffectTypes: string[];

  automated: boolean;

  testedAt?: Timestamp;

  successRate?: number;

  estimatedLatencyMs?: number;

  authorityRequired?: string;

  availabilityState:
    | "AVAILABLE"
    | "DEGRADED"
    | "UNAVAILABLE"
    | "UNKNOWN";
}
```

---

# 60. True Rollback vs Compensating Action

True rollback:

```text
Restore original state.
```

Compensating action:

```text
Create a new action intended to offset the previous action.
```

Example:

```text
Refund issued incorrectly.
```

Possible response:

```text
Request repayment.
```

This is not rollback.

It is compensation.

The distinction must remain visible.

---

# 61. Why Compensation Is Weaker

Compensation may:

```text
Fail

Require cooperation

Create fees

Take time

Create legal issues

Create customer harm
```

Therefore:

\[
Compensatable
\neq
Reversible
\]

---

# 62. Recovery Plan

A recovery plan must exist before high-consequence execution where policy requires it.

Conceptual schema:

```typescript
interface RecoveryPlan {
  recoveryPlanId: string;

  actionId: string;

  triggerConditions: string[];

  mechanismIds: string[];

  executionOrder: string[];

  authorityRequirements: string[];

  estimatedRecoveryTimeMs: number;

  expectedCoverage: number;

  residualEffects: string[];

  verificationProcedure: string[];

  version: number;
}
```

---

# 63. Pre-Execution Recovery Readiness

Before execution, AEGIS should ask:

```text
Is rollback available now?

Is the required backup current?

Is the recovery authority available?

Is the compensating endpoint operational?

Is the recovery plan compatible with this action version?
```

A rollback mechanism that becomes available only after failure is not reliable protection.

---

# 64. Recovery Point Objective

For data mutation:

```text
How much state can be lost?
```

Example:

```text
Backup interval:
24 hours
```

A restore may lose:

```text
Up to 24 hours of valid data.
```

This residual loss matters.

---

# 65. Recovery Time Objective

For service impact:

```text
How long until acceptable service is restored?
```

This should contribute to consequence severity.

---

# 66. Residual Harm

Residual harm is damage that remains after the best available recovery.

Examples:

```text
Customer saw incorrect balance.

Email was already read.

Secret was copied.

Service was unavailable for 20 minutes.

Market reacted.

Partner acted on incorrect webhook.
```

---

# 67. Residual Harm Object

Conceptual schema:

```typescript
interface ResidualHarm {
  residualHarmId: string;

  impactDomain: string;

  descriptionCode: string;

  severity: string;

  affectedSubjectCount?: number;

  durationEstimateMs?: number;

  recoverable: boolean;
}
```

---

# 68. Time-to-Harm

Some actions cause harm:

```text
Immediately
```

Others:

```text
After minutes

After hours

After external processing

After human response
```

Time-to-harm defines the intervention window.

---

# 69. Intervention Window

Conceptually:

\[
W_i
=
T_{harm}
-
T_{detect}
-
T_{stop}
\]

where:

```text
T_harm
=
time until meaningful harm

T_detect
=
time required to detect failure

T_stop
=
time required to halt propagation
```

If:

\[
W_i > 0
\]

intervention may be possible.

If:

\[
W_i \leq 0
\]

harm occurs before effective intervention.

---

# 70. Time-to-Detection

The system should estimate:

```text
How quickly would an incorrect action be noticed?
```

Examples:

```text
Synchronous invariant check:
milliseconds

Reconciliation:
hours

Customer complaint:
days

Regulatory discovery:
months
```

Slow detection increases consequence.

---

# 71. Time-to-Containment

After detection:

```text
How quickly can propagation be stopped?
```

This depends on:

```text
Kill switch

Queue cancellation

Transaction state

External propagation

Human availability
```

---

# 72. Damage Duration

A consequence may last:

```text
Milliseconds

Minutes

Hours

Days

Permanent
```

Duration is independent from initial severity.

---

# 73. Catastrophic Transient Harm

A short duration does not imply low severity.

Example:

```text
Expose authentication keys publicly for 30 seconds.
```

Duration:

```text
Short
```

Consequence:

```text
Potentially catastrophic.
```

---

# 74. Small Permanent Harm

Likewise:

```text
Delete one low-value test record permanently.
```

Irreversible:

```text
Yes
```

Consequence:

```text
Low
```

Irreversibility and severity remain separate.

---

# 75. Consequence Magnitude

Each impact domain receives a structured magnitude.

Conceptually:

\[
M_d
=
f(
Severity,
Scope,
Duration,
Sensitivity,
Externality
)
\]

where \(d\) is an impact domain.

The engine must preserve domain-level values.

---

# 76. Consequence Aggregation

The engine may calculate:

\[
K(x) \in [0,1]
\]

where:

```text
0
=
negligible consequence

1
=
catastrophic consequence
```

But the score must remain decomposable.

Conceptually:

\[
K
=
1-
\prod_d
(1-w_dK_d)
\]

Exact weights require benchmarking.

---

# 77. Why Simple Average Is Rejected

Suppose:

```text
Financial:
0.1

Availability:
0.1

Operational:
0.1

Privacy:
1.0
```

A simple average:

```text
0.325
```

could hide catastrophic privacy exposure.

Critical domain flags must survive aggregation.

---

# 78. Consequence Level

Recommended classification:

```typescript
type ConsequenceLevel =
  | "NEGLIGIBLE"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL"
  | "CATASTROPHIC";
```

---

# 79. NEGLIGIBLE

Characteristics:

```text
No meaningful external effect

Tiny controlled scope

Fully reversible

Immediate recovery

No residual harm
```

---

# 80. LOW

Characteristics:

```text
Limited local impact

Small scope

Strong containment

Reliable recovery

Minor residual effects
```

---

# 81. MODERATE

Characteristics:

```text
Meaningful customer or operational effect

Limited financial exposure

Partial external propagation

Recovery available
```

---

# 82. HIGH

Characteristics:

```text
Large financial impact

Material customer harm

Significant outage

Sensitive data exposure

Difficult recovery
```

---

# 83. CRITICAL

Characteristics:

```text
Major multi-subject impact

Large-scale data damage

Major security effect

Serious legal exposure

Weak recovery
```

---

# 84. CATASTROPHIC

Characteristics:

```text
System-wide destruction

Mass irreversible disclosure

Unbounded propagation

Severe physical harm

Existential organizational damage

No credible recovery
```

---

# 85. Hard Consequence Flags

Examples:

```text
CON_MASS_SCOPE

CON_SCOPE_EXPANSION_EXTREME

CON_CROSS_TENANT_IMPACT

CON_PUBLIC_DISCLOSURE

CON_SENSITIVE_DATA_EXPOSURE

CON_EXTERNAL_IRREVERSIBLE_EFFECT

CON_NO_ROLLBACK

CON_ROLLBACK_UNTESTED

CON_ROLLBACK_UNAVAILABLE

CON_RECOVERY_EXCEEDS_TOLERANCE

CON_HIGH_RESIDUAL_HARM

CON_UNBOUNDED_PROPAGATION

CON_CASCADE_RISK

CON_FAST_PROPAGATION

CON_NO_INTERVENTION_WINDOW

CON_CATASTROPHIC_DOMAIN_IMPACT

CON_CONSEQUENCE_UNKNOWN
```

---

# 86. Consequence Model

Different action types require different consequence logic.

Conceptual schema:

```typescript
interface ConsequenceModel {
  modelId: string;

  actionType: string;

  contextSelector?: string;

  impactRules: ImpactRule[];

  blastRadiusRules: BlastRadiusRule[];

  propagationRules: PropagationRule[];

  reversibilityRules: ReversibilityRule[];

  criticalFlags: CriticalConsequenceRule[];

  version: number;

  createdAt: Timestamp;
}
```

---

# 87. Why Consequence Models Must Be Versioned

Suppose:

```text
Old architecture:
Refund triggers only ledger update.
```

Later:

```text
New architecture:
Refund triggers ledger,
customer email,
partner webhook,
tax reconciliation.
```

The same action now has different propagation.

Historical assessments must use the consequence model active at decision time.

---

# 88. Action Effect Template

For known actions, AEGIS should maintain expected effects.

Example:

```text
ISSUE_CUSTOMER_REFUND
```

Expected direct effects:

```text
Create refund request

Reduce refundable balance

Update refund ledger
```

Expected downstream effects:

```text
Payment processor mutation

Customer notification

Accounting event

Reconciliation event
```

---

# 89. Effect Discovery

Effects may be learned from:

```text
Static configuration

API schemas

Event definitions

Workflow graphs

Historical execution traces

Service dependency maps
```

V1 should prioritize explicit configuration and observed traces.

---

# 90. Unknown Effects

If AEGIS cannot determine what an action triggers:

```text
Consequence:
UNKNOWN
```

must remain explicit.

Unknown downstream behavior is not equivalent to no downstream behavior.

---

# 91. Safer Action Transformation

The Consequence Engine should identify whether the proposed action can be transformed into a lower-consequence equivalent.

Examples:

```text
Delete
→
Soft delete

Publish globally
→
Draft privately

Refund ₹5,00,000
→
Refund ₹5,000 first

Update all users
→
Canary 100 users

Execute immediately
→
Queue with cancellation window

Overwrite
→
Create new version
```

---

# 92. Safer Action Variant

Conceptual schema:

```typescript
interface SaferActionVariant {
  variantId: string;

  originalActionId: string;

  transformationType:
    | "SCOPE_REDUCTION"
    | "STAGING"
    | "SOFT_MUTATION"
    | "DELAYED_COMMIT"
    | "CANARY"
    | "DRY_RUN"
    | "SHADOW_EXECUTION"
    | "VERSIONED_WRITE"
    | "APPROVAL_BEFORE_COMMIT";

  transformedActionReference: string;

  expectedConsequenceReduction: number;

  expectedUtilityRetention: number;

  additionalLatencyMs?: number;

  reasonCodes: string[];
}
```

---

# 93. Scope Reduction

Original:

```text
Refund 10,000 transactions.
```

Safer variant:

```text
Refund 10 transactions.

Validate.

Continue in batches.
```

---

# 94. Soft Mutation

Original:

```text
DELETE customer.
```

Safer variant:

```text
SET deletion_pending = true
```

with delayed hard deletion.

---

# 95. Delayed Commit

Original:

```text
Send immediately.
```

Safer variant:

```text
Queue for 5 minutes.

Allow automated cancellation.
```

This creates an intervention window.

---

# 96. Canary Execution

Original:

```text
Apply configuration globally.
```

Safer:

```text
Apply to 1% of targets.

Observe.

Expand.
```

---

# 97. Dry Run

A dry run estimates:

```text
Targets affected

Expected mutations

External effects

Invariant violations
```

without committing state.

---

# 98. Shadow Execution

A shadow execution runs decision logic without real-world effect.

Useful for:

```text
New agents

New action classes

High-novelty behavior

Benchmarking
```

---

# 99. Staged Execution

Some actions should be decomposed.

Example:

```text
Stage 1:
Validate targets

Stage 2:
Reserve funds

Stage 3:
Execute small batch

Stage 4:
Verify outcomes

Stage 5:
Expand
```

Each stage has its own consequence boundary.

---

# 100. Staged Execution Plan

Conceptual schema:

```typescript
interface StagedExecutionPlan {
  planId: string;

  actionId: string;

  stages: ExecutionStage[];

  expansionCriteria: string[];

  stopConditions: string[];

  rollbackCheckpoints: string[];

  maximumStageBlastRadius: number;
}
```

---

# 101. Why Staging Matters

A binary choice:

```text
Execute everything

or

Do nothing
```

is often unnecessary.

AEGIS should support:

```text
Execute a bounded subset.

Observe.

Reassess.

Expand.
```

This is a major mechanism for adaptive autonomy.

---

# 102. Consequence Reduction Ratio

For a safer variant:

\[
CRR
=
\frac{
K_{original}
-
K_{variant}
}{
K_{original}
}
\]

The system should also preserve utility.

A transformation that removes all useful effect is not necessarily valuable.

---

# 103. Utility Retention

Example:

```text
Original:
Refund ₹10,000 correctly

Variant:
Do nothing
```

Consequence reduced:

```text
Yes
```

Utility retained:

```text
No
```

A useful safer transformation should balance:

```text
Consequence reduction

Utility retention
```

---

# 104. Consequence Assessment Pipeline

The conceptual order is:

```text
STEP 1

Receive immutable Canonical Action.
```

```text
STEP 2

Resolve execution environment.
```

```text
STEP 3

Load versioned Consequence Model.
```

```text
STEP 4

Resolve intended targets.
```

```text
STEP 5

Resolve reachable targets.
```

```text
STEP 6

Identify affected assets.
```

```text
STEP 7

Identify affected subjects.
```

```text
STEP 8

Evaluate direct impact domains.
```

```text
STEP 9

Build propagation graph.
```

```text
STEP 10

Evaluate downstream effects.
```

```text
STEP 11

Identify external effects.
```

```text
STEP 12

Estimate propagation depth.
```

```text
STEP 13

Estimate propagation breadth.
```

```text
STEP 14

Estimate propagation velocity.
```

```text
STEP 15

Evaluate containment boundaries.
```

```text
STEP 16

Estimate maximum credible blast radius.
```

```text
STEP 17

Calculate scope expansion ratio.
```

```text
STEP 18

Resolve recovery mechanisms.
```

```text
STEP 19

Evaluate rollback coverage.
```

```text
STEP 20

Evaluate rollback readiness.
```

```text
STEP 21

Estimate rollback latency.
```

```text
STEP 22

Estimate recovery cost.
```

```text
STEP 23

Estimate residual harm.
```

```text
STEP 24

Estimate time-to-harm.
```

```text
STEP 25

Estimate time-to-detection.
```

```text
STEP 26

Estimate intervention window.
```

```text
STEP 27

Decompose consequence by domain.
```

```text
STEP 28

Apply critical consequence flags.
```

```text
STEP 29

Generate safer action variants.
```

```text
STEP 30

Generate staged execution opportunities.
```

```text
STEP 31

Aggregate consequence score.
```

```text
STEP 32

Classify consequence level.
```

```text
STEP 33

Generate explanations.
```

```text
STEP 34

Persist immutable Consequence Assessment.
```

---

# 105. Consequence Assessment

Conceptual schema:

```typescript
interface ConsequenceAssessment {
  assessmentId: string;

  actionId: string;

  actionVersion: number;

  agentId: string;

  consequenceModelId: string;

  consequenceScore: number;

  consequenceLevel: ConsequenceLevel;

  domainScores: Record<string, number>;

  intendedBlastRadius: BlastRadius;

  maximumCredibleBlastRadius: BlastRadius;

  scopeExpansionRatio: number;

  propagationDepth: number;

  propagationBreadth: number;

  propagationVelocityClass: string;

  containmentStrength: string;

  reversibilityLevel: ReversibilityLevel;

  rollbackCoverage: number;

  rollbackLatencyMs?: number;

  rollbackReadiness: string;

  residualHarmScore: number;

  timeToHarmMs?: number;

  timeToDetectionMs?: number;

  interventionWindowMs?: number;

  externalEffectCount: number;

  irreversibleEffectCount: number;

  criticalFlags: string[];

  topConsequenceDrivers: ConsequenceDriver[];

  saferVariantIds: string[];

  stagedExecutionPlanIds: string[];

  reasonCodes: string[];

  engineVersion: string;

  createdAt: Timestamp;
}
```

---

# 106. Consequence Driver

Conceptual schema:

```typescript
interface ConsequenceDriver {
  driverType:
    | "MAGNITUDE"
    | "BLAST_RADIUS"
    | "IRREVERSIBILITY"
    | "PROPAGATION"
    | "EXTERNALITY"
    | "RECOVERY_LATENCY"
    | "RESIDUAL_HARM"
    | "CONTAINMENT_FAILURE";

  score: number;

  impactDomain?: string;

  affectedAssetIds: string[];

  explanationCode: string;
}
```

---

# 107. Explainability Requirement

The engine must be able to say:

```text
CONSEQUENCE:
CRITICAL

WHY:

1. The action can affect 250,000 customer records.

2. Intended scope is 1 record, but execution mechanism can reach the full table.

3. Scope expansion ratio is 250,000×.

4. Database rollback exists but is untested.

5. Customer emails and partner webhooks cannot be fully recalled.

6. Downstream effects propagate within seconds.

7. Estimated intervention window is negative.

8. A staged execution plan can reduce initial blast radius to 100 records.
```

It must not return only:

```text
Risk score:
0.83
```

---

# 108. Consequence Reason Codes

Stable reason codes include:

```text
CON_LOW_IMPACT_LOCAL_SCOPE

CON_HIGH_FINANCIAL_EXPOSURE

CON_HIGH_DATA_INTEGRITY_IMPACT

CON_HIGH_PRIVACY_IMPACT

CON_HIGH_SECURITY_IMPACT

CON_HIGH_AVAILABILITY_IMPACT

CON_HIGH_LEGAL_IMPACT

CON_MASS_SUBJECT_IMPACT

CON_CROSS_TENANT_SCOPE

CON_SCOPE_EXPANSION_HIGH

CON_SCOPE_EXPANSION_EXTREME

CON_EXTERNAL_EFFECT_PRESENT

CON_EXTERNAL_EFFECT_IRREVERSIBLE

CON_PROPAGATION_DEPTH_HIGH

CON_PROPAGATION_BREADTH_HIGH

CON_PROPAGATION_FAST

CON_CONTAINMENT_STRONG

CON_CONTAINMENT_WEAK

CON_CONTAINMENT_UNKNOWN

CON_FULL_ROLLBACK_AVAILABLE

CON_PARTIAL_ROLLBACK_ONLY

CON_NO_ROLLBACK

CON_ROLLBACK_UNTESTED

CON_ROLLBACK_FAILED

CON_ROLLBACK_UNAVAILABLE

CON_RECOVERY_LATENCY_HIGH

CON_RESIDUAL_HARM_HIGH

CON_INTERVENTION_WINDOW_AVAILABLE

CON_NO_INTERVENTION_WINDOW

CON_SAFER_VARIANT_AVAILABLE

CON_STAGED_EXECUTION_AVAILABLE

CON_CONSEQUENCE_MODEL_INCOMPLETE
```

---

# 109. V1 Refund Consequence Model

For:

```text
ISSUE_CUSTOMER_REFUND
```

direct consequences include:

```text
Financial transfer

Refund ledger mutation

Reduction in refundable balance
```

Potential downstream consequences:

```text
Payment processor state change

Customer notification

Accounting event

Reconciliation event

Tax event

Partner webhook
```

---

# 110. V1 Refund Impact Dimensions

Required:

```text
Refund amount

Currency

Customer count

Transaction count

Prior refund state

Processor recall capability

Accounting propagation

Customer notification state

External partner propagation
```

---

# 111. V1 Refund Financial Exposure

For a single refund:

\[
Exposure
=
RefundAmount
\]

For batch actions:

\[
Exposure
=
\sum_i RefundAmount_i
\]

Maximum credible exposure must consider:

```text
Duplicate execution

Incorrect target expansion

Retry behavior

Idempotency failure
```

---

# 112. Duplicate Execution Consequence

Suppose:

```text
Intended refund:
₹10,000
```

Retry mechanism can issue:

```text
3 duplicate refunds
```

Maximum credible exposure:

```text
₹30,000
```

The engine must consider execution semantics.

---

# 113. Idempotency as Consequence Containment

An idempotency key may constrain:

```text
Duplicate financial execution.
```

If verified:

```text
Containment strength increases.
```

If absent:

```text
Duplicate execution consequence increases.
```

---

# 114. Example 1 — Small Reversible Refund

Action:

```text
Refund ₹500
```

Context:

```text
One customer

One transaction

Verified idempotency

Processor cancellation window

No external propagation yet
```

Result:

```text
Consequence:
LOW

Blast radius:
1 customer

Reversibility:
MOSTLY_REVERSIBLE

Containment:
STRONG
```

---

# 115. Example 2 — Large Irreversible Refund

Action:

```text
Refund ₹8,00,000
```

Context:

```text
Immediate external settlement

No cancellation

Recovery requires customer cooperation
```

Result:

```text
Consequence:
HIGH

Reversibility:
PARTIALLY_REVERSIBLE

Recovery:
COMPENSATING ACTION ONLY
```

---

# 116. Example 3 — Batch Scope Expansion

Intended:

```text
Refund 10 transactions
```

Reachable:

```text
Entire merchant account
```

Maximum credible:

```text
120,000 transactions
```

Result:

```text
Scope expansion:
EXTREME

Consequence:
CRITICAL
```

---

# 117. Example 4 — Technically Reversible, Externally Irreversible

Action:

```text
Update customer status.
```

Direct database mutation:

```text
Fully reversible.
```

Downstream effect:

```text
Termination email sent.
```

Result:

```text
Technical reversibility:
HIGH

Overall reversibility:
PARTIAL
```

---

# 118. Example 5 — High Consequence, Strong Containment

Action:

```text
Deploy new payment logic.
```

Execution:

```text
1% canary

Automatic rollback

Real-time error monitoring
```

Result:

```text
Inherent consequence:
HIGH

Effective initial blast radius:
LOW

Containment:
STRONG
```

This distinction is important.

---

# 119. Example 6 — No Intervention Window

Action:

```text
Publish secret publicly.
```

Time-to-harm:

```text
Milliseconds
```

Time-to-detection:

```text
Seconds
```

Result:

```text
Intervention window:
NEGATIVE

Reversibility:
EFFECTIVELY IRREVERSIBLE
```

---

# 120. Example 7 — Long Recovery

Action:

```text
Corrupt analytics warehouse.
```

Backup:

```text
Available
```

Restore time:

```text
9 days
```

Result:

```text
Technically reversible:
YES

Operational consequence:
HIGH

Effective reversibility:
PARTIAL
```

---

# 121. Example 8 — Competent, Certain, Catastrophic

SPEC-003:

```text
Competence:
STRONG
```

SPEC-004:

```text
Novelty:
LOW
```

SPEC-005:

```text
Uncertainty:
LOW
```

SPEC-006:

```text
Consequence:
CATASTROPHIC
```

Meaning:

```text
The agent probably knows exactly what it is doing.

The action is still too consequential for unrestricted execution.
```

---

# 122. Example 9 — Incompetent but Harmless

SPEC-003:

```text
Competence:
LOW
```

SPEC-004:

```text
Novelty:
HIGH
```

SPEC-005:

```text
Uncertainty:
HIGH
```

SPEC-006:

```text
Consequence:
NEGLIGIBLE
```

Action:

```text
Generate a temporary preview
in an isolated sandbox.
```

Meaning:

```text
Failure is likely.

But failure is cheap and contained.
```

This may justify experimentation.

---

# 123. Example 10 — Safer Transformation

Original:

```text
Delete 1 million records.
```

Variant:

```text
Mark records for deletion.

Wait 24 hours.

Delete in batches of 1,000.

Verify after each batch.
```

Result:

```text
Consequence reduction:
HIGH

Utility retention:
HIGH
```

---

# 124. Example 11 — Cascading External Effects

Action:

```text
Change invoice state.
```

Propagation:

```text
Invoice update
→
Accounting webhook
→
Tax report
→
Partner settlement
→
Customer email
```

Result:

```text
Propagation depth:
4

External effects:
3

Full rollback:
Unavailable
```

---

# 125. Example 12 — Unknown Consequence

Action:

```text
Call undocumented external tool.
```

Unknown:

```text
Target scope

Side effects

Rollback capability

Downstream triggers
```

Result:

```text
Consequence:
UNKNOWN

Flag:
CON_CONSEQUENCE_MODEL_INCOMPLETE
```

Unknown must not become:

```text
LOW CONSEQUENCE
```

---

# 126. Database Ownership

The Consequence Intelligence System owns conceptually:

```text
consequence_models

impact_rules

blast_radius_rules

propagation_rules

reversibility_rules

affected_assets

affected_subjects

impact_events

containment_boundaries

propagation_nodes

propagation_edges

external_effects

reversibility_profiles

recovery_mechanisms

recovery_plans

residual_harms

safer_action_variants

staged_execution_plans

consequence_assessments

consequence_drivers
```

Exact relational design belongs to SPEC-011.

---

# 127. Event Model

The system emits:

```text
CONSEQUENCE_ASSESSMENT_STARTED

AFFECTED_ASSET_IDENTIFIED

AFFECTED_SUBJECT_IDENTIFIED

BLAST_RADIUS_ESTIMATED

SCOPE_EXPANSION_DETECTED

CRITICAL_SCOPE_EXPANSION_DETECTED

PROPAGATION_PATH_DETECTED

EXTERNAL_EFFECT_DETECTED

IRREVERSIBLE_EFFECT_DETECTED

ROLLBACK_MECHANISM_RESOLVED

ROLLBACK_UNAVAILABLE

ROLLBACK_UNTESTED

RECOVERY_PLAN_REQUIRED

RESIDUAL_HARM_IDENTIFIED

NO_INTERVENTION_WINDOW_DETECTED

SAFER_ACTION_VARIANT_GENERATED

STAGED_EXECUTION_PLAN_GENERATED

CONSEQUENCE_ASSESSED

CRITICAL_CONSEQUENCE_DETECTED

CATASTROPHIC_CONSEQUENCE_DETECTED
```

---

# 128. Performance Requirements

Initial runtime target:

```text
Consequence model resolution:
< 20 ms

Target scope resolution:
< 50 ms

Asset and subject mapping:
< 50 ms

Propagation graph evaluation:
< 80 ms

Blast radius estimation:
< 40 ms

Reversibility resolution:
< 40 ms

Consequence aggregation:
< 20 ms

Initial assessment:
< 300 ms
```

The critical runtime path must not require an LLM.

---

# 129. Storage Architecture

V1 uses:

```text
PostgreSQL
```

for:

```text
Consequence models

Asset metadata

Subject scope metadata

Propagation edges

Recovery mechanisms

Assessments
```

Existing infrastructure metadata may be referenced from external systems.

---

# 130. Graph Resolution in PostgreSQL

Propagation can be represented using:

```text
Adjacency tables

Recursive CTEs

Cached downstream effect paths
```

V1 should avoid requiring a graph database.

---

# 131. LLM Role

LLMs may assist with:

```text
Extracting possible consequences from documentation

Mapping natural-language action descriptions to known effect templates

Generating human-readable explanations

Suggesting candidate safer variants

Identifying undocumented consequence questions
```

LLMs may not:

```text
Declare an action harmless

Invent rollback guarantees

Override blast radius limits

Mark external effects reversible without evidence

Set final autonomy
```

---

# 132. Deterministic Core

The final Consequence Assessment must derive from:

```text
Canonical Action

Versioned consequence model

Target scope

Asset metadata

Propagation graph

Containment configuration

Recovery mechanisms

External effect state
```

The core assessment must be reproducible.

---

# 133. Testing Strategy

Required tests:

```text
Impact domain tests

Target scope tests

Blast radius tests

Scope expansion tests

Propagation tests

Containment tests

Reversibility tests

Rollback readiness tests

Residual harm tests

Intervention window tests

Safer transformation tests

Staged execution tests

Replay tests
```

---

# 134. Mathematical Unit Tests

Examples:

```text
Increasing target count
must not reduce blast radius.
```

```text
Removing rollback capability
must not improve reversibility.
```

```text
Adding irreversible external effects
must not improve consequence.
```

```text
Strengthening verified containment
must not increase reachable blast radius.
```

```text
Increasing rollback latency
must not improve effective reversibility.
```

```text
Same action and consequence snapshot
must produce same assessment.
```

---

# 135. Property-Based Tests

Required properties:

```text
Increasing maximum credible scope
must not reduce consequence.

Adding affected subjects
must not reduce subject impact.

Removing a propagation edge
must not increase propagation breadth.

Adding a tested rollback mechanism
must not reduce recovery readiness.

Adding residual harm
must not improve reversibility.

Changing consequence policy
must create a new model version.

Future recovery evidence
must not alter historical assessments.
```

---

# 136. Adversarial Tests

The benchmark must include:

```text
Hidden batch expansion

Missing WHERE clause

Cross-tenant mutation

Duplicate execution

Retry storm

Webhook cascade

External publication

False rollback claim

Untested backup

Stale backup

Compensation misclassified as rollback

Delayed harm

Fast irreversible propagation

Unknown downstream dependency

Prompt-based containment

Scope understatement
```

---

# 137. Benchmark Ground Truth

Synthetic cases should contain controlled consequence states.

Example:

```text
Case A:
₹500 refund
one customer
tested cancellation

Case B:
₹8,00,000 refund
no cancellation

Case C:
10 intended targets
100,000 reachable targets

Case D:
database rollback available
external email irreversible

Case E:
global mutation
1% canary containment

Case F:
public disclosure
no intervention window
```

AEGIS should distinguish them.

---

# 138. Core Benchmark Metrics

Required metrics:

```text
Critical consequence recall

False critical consequence rate

Blast radius estimation error

Scope expansion detection recall

Propagation path recall

External effect detection recall

Irreversibility classification accuracy

Rollback readiness accuracy

Residual harm detection recall

Safer variant utility retention

Consequence reduction from staging

Assessment latency
```

---

# 139. Research Question 1

Does consequence-aware autonomy outperform confidence-based autonomy?

Compare:

```text
Execute when confidence is high
```

against:

```text
Execute based on competence,
novelty,
uncertainty,
and consequence.
```

Hypothesis:

```text
High-confidence catastrophic failures
are substantially reduced.
```

---

# 140. Research Question 2

Does blast-radius-aware staging enable more autonomy than static approval rules?

Compare:

```text
High consequence
→
human approval
```

against:

```text
High global consequence
→
small canary
→
verify
→
expand
```

Measure:

```text
Autonomous completion rate

Failure cost

Human review rate

Execution latency
```

---

# 141. Research Question 3

Can reversibility act as an autonomy multiplier?

Compare two equally uncertain actions:

```text
Action A:
Fully reversible

Action B:
Irreversible
```

Hypothesis:

```text
AEGIS can safely grant greater autonomy
to reversible actions.
```

---

# 142. Research Question 4

Can scope reduction preserve utility while lowering risk?

Compare:

```text
Full execution

Human escalation

Staged execution
```

Measure:

```text
Utility achieved

Damage avoided

Human intervention

Time to completion
```

---

# 143. Research Question 5

Does propagation modeling outperform direct-effect analysis?

Compare:

```text
Only immediate action effect
```

against:

```text
Full downstream propagation graph
```

Hypothesis:

```text
Many severe failures are caused
by downstream effects rather than
the original mutation.
```

---

# 144. Research Question 6

Can intervention-window modeling predict when monitoring is useful?

Monitoring is useful only if:

```text
Failure can be detected

and

Propagation can be stopped

before meaningful harm.
```

This creates a measurable distinction between:

```text
MONITORABLE AUTONOMY
```

and:

```text
MONITORING THE DAMAGE AFTER IT HAPPENS.
```

---

# 145. Research Question 7

Can safer action transformations outperform denial?

Compare:

```text
Deny dangerous action
```

against:

```text
Transform dangerous action
into lower-consequence execution.
```

This is central to AEGIS.

The system should not merely answer:

```text
YES

or

NO
```

It should sometimes answer:

```text
NOT LIKE THAT.

DO IT THIS WAY.
```

---

# 146. Dashboard Representation

The dashboard should eventually show:

```text
Current consequence level

Impact domains

Intended blast radius

Maximum credible blast radius

Scope expansion ratio

Affected subjects

Propagation graph

External effects

Reversibility level

Rollback readiness

Recovery time

Residual harm

Intervention window

Safer action variants

Staged execution plan
```

The UI is outside this specification.

The data requirements are not.

---

# 147. Security Requirements

Protect against unauthorized mutation of:

```text
Consequence models

Blast radius rules

Containment state

Propagation edges

Recovery mechanisms

Rollback readiness

External effect metadata
```

An attacker who can mark:

```text
Irreversible
```

as:

```text
Fully reversible
```

can manipulate autonomy.

---

# 148. Consequence Understatement Attack

Attack:

```text
Agent declares:

Target count = 1
```

while the actual execution primitive can reach:

```text
All records.
```

Defense:

```text
Resolve reachable scope independently
from agent-declared intent.
```

---

# 149. Rollback Illusion Attack

Attack:

```text
Rollback endpoint exists.
```

System assumes:

```text
Action is reversible.
```

Reality:

```text
Endpoint is broken

Backup is stale

External effects remain
```

Defense:

```text
Rollback readiness

Testing state

Coverage

Latency

Residual harm
```

---

# 150. Soft Containment Attack

Attack:

```text
Prompt says:
Only affect one customer.
```

Execution credential permits:

```text
All customers.
```

Defense:

```text
Hard containment and reachable scope analysis.
```

---

# 151. Propagation Concealment Attack

Attack:

```text
Present action as:
Update one database row.
```

Hide:

```text
Webhook

Email

Partner sync

Billing event
```

Defense:

```text
Effect templates

Observed execution traces

Propagation graph
```

---

# 152. Compensation Laundering

Attack:

```text
Call a compensating action
a rollback.
```

Defense:

```text
True rollback and compensation
are separate recovery classes.
```

---

# 153. Delayed Harm Attack

Attack:

```text
Action appears harmless immediately.

Damage occurs after 24 hours.
```

Defense:

```text
Propagation and time-to-harm modeling.
```

---

# 154. Unknown Consequence Laundering

Attack:

```text
No consequence data available.
```

Convert to:

```text
No consequence.
```

Prohibited.

Unknown remains unknown.

---

# 155. Rejected Alternative — One Risk Score

Rejected because it cannot distinguish:

```text
Large reversible impact

Small irreversible impact

Mass contained impact

Small uncontained cascade

Fast recoverable damage

Slow permanent damage
```

---

# 156. Rejected Alternative — Financial Thresholds Only

Rejected because:

```text
Privacy

Security

Availability

Legal harm

External propagation
```

cannot be represented adequately by money alone.

---

# 157. Rejected Alternative — Action-Type Risk Labels

Rejected because:

```text
SEND_EMAIL
```

may be trivial or catastrophic depending on context.

---

# 158. Rejected Alternative — Boolean Reversibility

Rejected because reversibility depends on:

```text
Coverage

Latency

Cost

Testing

External effects

Residual harm
```

---

# 159. Rejected Alternative — Rollback Endpoint Means Safe

Rejected because the endpoint may be:

```text
Untested

Unavailable

Incomplete

Too slow
```

---

# 160. Rejected Alternative — Direct Effects Only

Rejected because downstream propagation may dominate consequence.

---

# 161. Rejected Alternative — Worst Case Only

Rejected because impossible theoretical scenarios can make every action catastrophic.

AEGIS uses:

```text
Maximum credible consequence
```

rather than:

```text
Unlimited imagination.
```

---

# 162. Rejected Alternative — Average Case Only

Rejected because rare but credible catastrophic failure modes matter.

---

# 163. Rejected Alternative — Human Approval for Every High-Consequence Action

Rejected because consequence can sometimes be reduced through:

```text
Scope reduction

Canary execution

Staging

Delayed commit

Strong containment

Recovery preparation
```

AEGIS should seek safer execution before defaulting to escalation.

---

# 164. V1 Implementation Boundary

The first production-grade implementation must include:

```text
Versioned Consequence Models

Affected Asset representation

Affected Subject representation

Multi-domain impact analysis

Intended blast radius

Reachable blast radius

Maximum credible blast radius

Scope expansion ratio

Containment boundaries

Hard vs soft containment

Basic propagation graph

External effect detection

Propagation depth

Propagation breadth

Propagation velocity

Reversibility profiles

True rollback vs compensation

Rollback coverage

Rollback readiness

Rollback latency

Residual harm

Time-to-harm

Time-to-detection

Intervention window

Critical consequence flags

Safer action variants

Scope reduction

Delayed commit

Canary execution

Dry run

Staged execution plans

Decomposed consequence scoring

Immutable Consequence Assessment
```

V1 should not require:

```text
Perfect economic loss prediction

Full causal inference

Global infrastructure graph

Precise reputation valuation

Open-world consequence discovery

Physical-world simulation

LLM-defined consequence policy

Unlimited recursive propagation
```

The architecture remains extensible.

---

# 165. Decisions Locked by SPEC-006

The following are now architectural commitments:

```text
1. Consequence is independent from competence.

2. Consequence is independent from novelty.

3. Consequence is independent from epistemic uncertainty.

4. High confidence does not reduce inherent consequence.

5. Action type alone does not determine consequence.

6. Monetary value alone does not determine consequence.

7. Consequence is evaluated across multiple impact domains.

8. Assets and affected subjects are separate system objects.

9. Intended scope and reachable scope are separate.

10. Maximum credible blast radius is explicitly estimated.

11. Scope expansion ratio is a first-class signal.

12. Agent-declared scope is not trusted as the only scope source.

13. Containment boundaries are explicitly represented.

14. Hard containment and soft containment are separate.

15. Downstream effects are represented through a propagation graph.

16. Propagation depth, breadth, and velocity are separate.

17. External effects are explicitly identified.

18. Escape from AEGIS control reduces reversibility.

19. Reversibility is not Boolean.

20. Technical rollback is not equivalent to full recovery.

21. True rollback and compensating actions are separate.

22. Rollback coverage must be measured.

23. Rollback latency affects effective reversibility.

24. Rollback readiness must be verified.

25. Untested rollback is weaker than verified rollback.

26. Recovery cost affects practical reversibility.

27. Residual harm remains visible after recovery.

28. Time-to-harm is explicitly modeled.

29. Time-to-detection is explicitly modeled.

30. The intervention window is a first-class signal.

31. Monitoring is useful only when intervention can occur before meaningful harm.

32. Unknown consequence is not low consequence.

33. Critical consequence dimensions survive aggregation.

34. Safer action transformation is a core system capability.

35. Scope reduction is preferred over unnecessary binary denial.

36. Canary execution is a first-class autonomy mechanism.

37. Delayed commit may create a valuable intervention window.

38. Dry runs are a first-class consequence-reduction mechanism.

39. Staged execution allows bounded autonomy.

40. Consequence reduction and utility retention are evaluated together.

41. High inherent consequence may be made operationally safer through strong containment.

42. Every consequence assessment uses a versioned consequence model.

43. Historical consequence assessments remain reproducible.

44. The critical runtime path must not require an LLM.

45. PostgreSQL is sufficient for the V1 propagation graph.

46. The flagship benchmark remains customer refund operations.

47. Consequence remains an independent dimension in the final autonomy decision.
```

---

# 166. Final Consequence Mental Model

A conventional agent asks:

```text
Am I confident this action is correct?
```

AEGIS asks:

```text
What happens if it is not?

What can be damaged?

Who can be harmed?

How much can be lost?

How many targets are intended?

How many targets are actually reachable?

Can a one-record action accidentally become a million-record action?

What systems will this trigger?

How far can the effect propagate?

How quickly will it propagate?

Will the effect leave our control?

Can we detect failure before harm?

Can we stop propagation before harm?

Can we reverse the action?

Can we reverse every downstream effect?

Has the rollback mechanism actually been tested?

How long will recovery take?

What damage remains after recovery?

Can we reduce the scope?

Can we delay commitment?

Can we execute a canary?

Can we stage the action?

Can we preserve most of the utility
while dramatically reducing consequence?
```

The result is not:

```text
Risk:
82%
```

The result is:

```text
CONSEQUENCE:
CRITICAL

INTENDED SCOPE:
1 transaction

MAXIMUM CREDIBLE SCOPE:
120,000 transactions

SCOPE EXPANSION:
120,000×

DIRECT IMPACT:
Financial mutation

DOWNSTREAM EFFECTS:
Ledger
Customer email
Accounting webhook
Partner reconciliation

PROPAGATION:
Fast

CONTAINMENT:
Weak

REVERSIBILITY:
Partial

ROLLBACK:
Untested

EXTERNAL EFFECTS:
2

INTERVENTION WINDOW:
Negative

RESIDUAL HARM:
High

SAFER VARIANT:
Execute 10-transaction canary

EXPECTED CONSEQUENCE REDUCTION:
92%
```

That is an actionable consequence assessment.

---

# 167. Final Definition

The AEGIS Consequence, Reversibility, and Blast Radius Engine is:

> A versioned, multi-domain, propagation-aware system for determining the magnitude, scope, reachability, recoverability, containment, downstream propagation, externality, duration, and residual harm of a proposed autonomous action, while identifying safer execution forms that preserve utility and reduce potential damage.

Its central relationships are:

\[
\boxed{
Probability\ of\ Failure
\neq
Consequence\ of\ Failure
}
\]

\[
\boxed{
Technically\ Reversible
\neq
Fully\ Recoverable
}
\]

\[
\boxed{
Intended\ Scope
\neq
Reachable\ Scope
}
\]

\[
\boxed{
Rollback
\neq
Zero\ Residual\ Harm
}
\]

and:

\[
\boxed{
Dangerous\ Action
\neq
Action\ That\ Must\ Always\ Be\ Denied
}
\]

because sometimes:

\[
\boxed{
Reduce\ Scope
+
Strengthen\ Containment
+
Stage\ Execution
+
Prepare\ Recovery
=
Safe\ Enough\ Autonomy
}
\]

SPEC-003 maps:

```text
ABILITY
```

SPEC-004 maps:

```text
FAMILIARITY
```

SPEC-005 maps:

```text
KNOWLEDGE
```

SPEC-006 maps:

```text
CONSEQUENCE
```

Together:

```text
CAN THE AGENT DO IT?

HAS IT SEEN THIS BEFORE?

DOES IT KNOW ENOUGH?

WHAT HAPPENS IF IT IS WRONG?
```

AEGIS now has four independent views of autonomous action:

```text
COMPETENCE

NOVELTY

EPISTEMIC STATE

CONSEQUENCE
```

An agent may be:

```text
Highly competent.

Operating in familiar territory.

Working from excellent evidence.

And still require strict limits
because the cost of one mistake
is too large.
```

That distinction is the foundation of consequence-aware autonomy.