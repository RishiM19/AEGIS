# AEGIS TECHNICAL SPECIFICATION 003

## Contextual Competence Topology Engine

**Document ID:** AEGIS-SPEC-003  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Mathematical Intelligence Architecture  
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-002  
**Primary Owner:** Competence Intelligence System  
**Primary Runtime Component:** Competence Engine  
**Consumers:** Novelty Engine, Uncertainty Engine, Autonomy Engine, Contract Engine, Dashboard, Research Harness, Benchmark System

---

# 0. Purpose of This Specification

This specification defines how AEGIS measures, represents, updates, retrieves, and reasons about an agent's demonstrated competence.

The Competence Engine exists because agent ability is not uniform.

An agent may be highly reliable for:

```text
Domestic duplicate-charge refunds
between ₹500 and ₹5,000
with complete payment evidence.
```

The same agent may be weak for:

```text
International fraud disputes
above ₹50,000
with conflicting evidence.
```

A global score such as:

```text
Agent trust score:
94%
```

destroys this distinction.

AEGIS therefore models competence as a function of context.

Formally:

\[
C(a,x)
=
P(
\text{successful outcome}
\mid
a,\phi(x),H_a
)
\]

where:

```text
a
=
specific agent identity

x
=
current Canonical Action

φ(x)
=
versioned competence feature representation of the action

Hₐ
=
relevant historical evidence for that agent
```

The Competence Engine must answer:

```text
What has this agent demonstrated?

In which region of action space?

Based on how much evidence?

How recent is that evidence?

How similar is it to the current action?

How uncertain is our estimate?

Is the agent improving?

Is the agent degrading?

Did the agent change materially?

Are we extrapolating beyond observed experience?
```

The output is not permission.

The output is not final autonomy.

The output is a contextual estimate of demonstrated capability.

---

# 1. Foundational Principle

AEGIS separates:

```text
AUTHORITY

What may this agent do?
```

from:

```text
COMPETENCE

What has this agent demonstrated it can do well?
```

An action may be:

```text
AUTHORIZED
```

but:

```text
LOW COMPETENCE
```

The result may be:

```text
Human approval

Simulation

Shadow execution

Reduced autonomy
```

An action may also be:

```text
HIGH COMPETENCE
```

but:

```text
NOT AUTHORIZED
```

The result remains:

```text
DENY
```

Therefore:

\[
Competence
\not\Rightarrow
Authority
\]

and:

\[
Authority
\not\Rightarrow
Competence
\]

These are independent dimensions.

---

# 2. Why a Global Trust Score Fails

Consider one agent with the following history:

```text
9,900 successful low-value domestic refunds

100 failed international fraud disputes
```

A global score gives:

\[
\frac{9900}{10000}
=
99\%
\]

The agent appears excellent.

Now the proposed action is:

```text
Refund ₹2,50,000

International transaction

Fraud dispute

Conflicting evidence
```

A 99% global score is dangerously misleading.

The correct question is:

> How much relevant evidence exists near this action in competence space?

AEGIS therefore models:

```text
Competence over regions
```

rather than:

```text
One score per agent
```

---

# 3. Why Exact-Match Statistics Also Fail

The opposite extreme is also wrong.

Suppose the current action is:

```text
Refund ₹18,400

Domestic

Duplicate charge

Case age:
3 days
```

Historical action:

```text
Refund ₹18,100

Domestic

Duplicate charge

Case age:
4 days
```

These actions are not identical.

But they are highly similar.

A system requiring exact matches would discard valuable evidence.

Therefore AEGIS needs:

```text
Exact evidence

Regional evidence

Similarity-weighted neighboring evidence
```

The system must generalize.

But it must generalize conservatively.

---

# 4. The Competence Topology Concept

The action space is multidimensional.

For refund operations, dimensions may include:

```text
Action type

Case type

Amount

Payment environment

Evidence completeness

Evidence conflict

Customer risk class

Prior refund attempts

Case age

Tool version

Execution provider
```

Each historical action occupies a location in this space.

Conceptually:

```text
                    HIGH AMOUNT
                         ▲
                         │
       weak evidence     │     strong evidence
                         │
             ●           │
                         │       ● ● ●
                         │     ● ● ● ●
                         │       ● ●
─────────────────────────┼──────────────────────►
                         │
                         │
             ○           │
                         │
                         │
                         │
                         ▼
                    LOW AMOUNT
```

Where:

```text
●
successful outcomes

○
failed outcomes
```

Dense regions with strong evidence may support high competence.

Sparse or contradictory regions should produce uncertainty.

The resulting structure is the:

# Contextual Competence Topology

It is not necessarily one literal geometric surface stored in a database.

It is the combined representation of:

```text
Competence regions

Historical observations

Feature-space relationships

Posterior beliefs

Evidence density

Temporal dynamics

Agent identity lineage
```

---

# 5. Core Competence Question

For a current action \(x\), AEGIS estimates:

\[
C(a,x)
=
P(Y=1 \mid a,\phi(x),H_a)
\]

where:

```text
Y = 1
means successful outcome

Y = 0
means unsuccessful outcome
```

But AEGIS must not return only:

```text
0.93
```

A useful competence result requires:

```text
Estimated success probability

Credible interval

Effective evidence count

Exact-region evidence

Neighbor evidence

Evidence recency

Similarity distribution

Outcome ambiguity

Agent identity continuity

Extrapolation distance
```

A score without evidence quality is incomplete.

---

# 6. Competence System Responsibilities

The Competence Intelligence System owns:

```text
1. Define versioned competence feature spaces.

2. Convert Canonical Actions into competence feature vectors.

3. Partition action space into interpretable competence regions.

4. Store historical competence observations.

5. Update region-level competence beliefs.

6. Retrieve relevant historical evidence.

7. Weight evidence by similarity and recency.

8. Estimate contextual competence.

9. Quantify confidence in that estimate.

10. Detect degradation and regime change.

11. Prevent unsafe competence inheritance.

12. Produce immutable Competence Assessments.
```

---

# 7. Competence System Non-Responsibilities

The Competence Engine does not determine:

```text
Whether the action is authorized

Whether the action is novel

Whether the evidence supporting the action is epistemically reliable

How severe failure would be

How reversible the action is

How much autonomy budget remains

The final autonomy level
```

These belong elsewhere.

The Competence Engine answers one narrow question:

> What does the available historical evidence indicate about this agent's ability in this context?

---

# 8. Competence System Invariants

## COMP-INV-001 — Competence Is Contextual

No production decision may rely solely on one global agent competence score.

---

## COMP-INV-002 — Competence Is Agent-Specific

Evidence from Agent A does not automatically become competence evidence for Agent B.

---

## COMP-INV-003 — Competence Is Version-Sensitive

Material changes to:

```text
Model

System prompt

Toolset

Runtime configuration

Decision policy
```

may reduce or invalidate historical evidence transfer.

---

## COMP-INV-004 — Competence Requires Outcomes

A completed action is not automatically a successful action.

Competence updates require outcome evidence.

---

## COMP-INV-005 — Unknown Outcome Is Not Success

If the outcome cannot be determined:

```text
UNKNOWN ≠ SUCCESS
```

---

## COMP-INV-006 — More Data Does Not Mean More Relevant Data

Ten thousand distant observations must not automatically dominate ten highly relevant observations.

---

## COMP-INV-007 — Similarity Must Be Versioned

Changing feature extraction or similarity logic changes the meaning of competence estimates.

---

## COMP-INV-008 — Sparse Regions Must Remain Uncertain

The system must not manufacture confidence where evidence density is low.

---

## COMP-INV-009 — Recent Degradation Must Be Detectable

Ancient success must not permanently hide current failure.

---

## COMP-INV-010 — Simulation Is Not Equivalent to Production Success

Different evidence sources must have different evidential weights.

---

## COMP-INV-011 — Human Rescue Is Not Full Agent Success

If an agent succeeds only after major human correction, the observation must preserve that fact.

---

## COMP-INV-012 — Competence Cannot Grant Authority

No competence threshold may override SPEC-002.

---

## COMP-INV-013 — Competence Assessment Must Be Reproducible

The same:

```text
Action version

Feature extractor version

Historical evidence snapshot

Similarity configuration

Weighting configuration

Posterior algorithm version
```

must produce the same assessment.

---

# 9. Core Domain Objects

SPEC-003 defines:

```text
Competence Feature Schema

Competence Feature Vector

Competence Region

Competence Observation

Outcome Assessment

Evidence Weight

Region Posterior

Neighbor Set

Competence Assessment

Competence Drift Signal

Agent Competence Lineage
```

Each object has one distinct responsibility.

---

# 10. Competence Feature Schema

The Competence Feature Schema defines which dimensions matter for a specific action family.

Conceptual schema:

```typescript
interface CompetenceFeatureSchema {
  schemaId: string;

  actionType: string;

  version: number;

  features: CompetenceFeatureDefinition[];

  regionDefinitionVersion: string;

  similarityProfileId: string;

  createdAt: Timestamp;
}
```

Example:

```text
Schema:
refund-competence-v1

Action type:
ISSUE_CUSTOMER_REFUND
```

Features:

```text
case_type

amount_minor

payment_environment

evidence_completeness

evidence_conflict

customer_risk_class

prior_refund_attempts

case_age_days
```

The schema is action-type-specific.

A refund and an external email should not share the same competence dimensions.

---

# 11. Feature Selection Principle

A feature belongs in competence space if it plausibly changes task difficulty.

Good competence features:

```text
Refund amount

Case type

Evidence conflict

Payment environment
```

Poor competence features:

```text
Dashboard theme

Request UUID

Database row ID
```

The feature question is:

> Could two otherwise similar actions differ materially in difficulty because this value changed?

If yes, it may belong in competence space.

---

# 12. Feature Categories

AEGIS supports:

```text
CATEGORICAL

ORDINAL

CONTINUOUS

BOOLEAN

SET-VALUED

EMBEDDING

DERIVED
```

Example:

```text
case_type
→ CATEGORICAL
```

```text
amount_minor
→ CONTINUOUS
```

```text
evidence_completeness
→ ORDINAL
```

```text
has_conflicting_evidence
→ BOOLEAN
```

```text
semantic_case_embedding
→ EMBEDDING
```

V1 should prioritize interpretable structured features.

---

# 13. Feature Definition

Conceptual schema:

```typescript
interface CompetenceFeatureDefinition {
  featureName: string;

  sourcePath: string;

  featureType:
    | "CATEGORICAL"
    | "ORDINAL"
    | "CONTINUOUS"
    | "BOOLEAN"
    | "SET"
    | "EMBEDDING"
    | "DERIVED";

  required: boolean;

  normalizationRule?: string;

  missingValuePolicy: MissingValuePolicy;

  similarityFunction: string;

  similarityWeight: number;

  regionRole:
    | "PARTITION"
    | "DISTANCE"
    | "BOTH"
    | "AUXILIARY";
}
```

---

# 14. Source of Competence Features

Competence features must derive from the authoritative CAM.

Example:

```text
CAM:

operation.action_type
=
ISSUE_CUSTOMER_REFUND
```

becomes:

```text
Competence feature:

action_type
=
ISSUE_CUSTOMER_REFUND
```

Another:

```text
CAM:

context.structured.case_type
=
DUPLICATE_CHARGE
```

becomes:

```text
Competence feature:

case_type
=
DUPLICATE_CHARGE
```

The feature extractor must record provenance.

---

# 15. Derived Features

Some useful competence dimensions are derived.

Example:

```text
amount_minor:
1,840,000
```

Derived:

```text
amount_band:
₹5,000–₹25,000
```

Another:

```text
evidence items:
4

critical claims:
3

supported critical claims:
3
```

Derived:

```text
evidence_completeness:
COMPLETE
```

Derived features must be:

```text
Deterministic where possible

Versioned

Reproducible

Auditable
```

---

# 16. Competence Feature Vector

For every assessed action, the feature extractor produces:

```typescript
interface CompetenceFeatureVector {
  actionId: string;

  actionVersion: number;

  agentId: string;

  agentVersion: string;

  schemaId: string;

  schemaVersion: number;

  values: Record<string, unknown>;

  vectorFingerprint: string;

  extractorVersion: string;

  createdAt: Timestamp;
}
```

Example:

```text
COMPETENCE FEATURE VECTOR

action_type:
ISSUE_CUSTOMER_REFUND

case_type:
DUPLICATE_CHARGE

amount_minor:
1840000

amount_band:
5000_TO_25000

payment_environment:
DOMESTIC

evidence_completeness:
COMPLETE

evidence_conflict:
NONE

customer_risk_class:
STANDARD

prior_refund_attempts:
0

case_age_days:
3
```

---

# 17. Missing Feature Values

Missing values must remain explicit.

Example:

```text
customer_risk_class:
UNKNOWN
```

The system must not silently substitute:

```text
STANDARD
```

Possible missing-value policies:

```typescript
type MissingValuePolicy =
  | "EXPLICIT_UNKNOWN_CATEGORY"
  | "DISTANCE_PENALTY"
  | "EXCLUDE_FEATURE"
  | "ASSESSMENT_DEGRADATION"
  | "REJECT_FEATURE_VECTOR";
```

The policy is defined per feature.

---

# 18. Why Missingness Itself Matters

Unknown information may indicate a harder case.

Example:

```text
Case A:
payment_environment = DOMESTIC
```

Case B:

```text
payment_environment = UNKNOWN
```

The second action should not necessarily be treated as identical.

Missingness can itself be a competence feature.

An agent may perform well when context is complete and poorly when information is missing.

---

# 19. Competence Regions

A Competence Region is an interpretable area of action space.

Example:

```text
REGION R-17

Action type:
ISSUE_CUSTOMER_REFUND

Case type:
DUPLICATE_CHARGE

Amount band:
₹5,000–₹25,000

Payment environment:
DOMESTIC

Evidence completeness:
COMPLETE
```

Conceptual schema:

```typescript
interface CompetenceRegion {
  regionId: string;

  schemaId: string;

  schemaVersion: number;

  predicates: RegionPredicate[];

  parentRegionId?: string;

  regionLevel: number;

  status:
    | "ACTIVE"
    | "DEPRECATED";

  createdAt: Timestamp;
}
```

---

# 20. Why Regions Exist

Pure nearest-neighbor retrieval is flexible.

But it can be difficult to explain.

Pure fixed buckets are explainable.

But they can be too rigid.

AEGIS therefore uses a hybrid model:

```text
INTERPRETABLE REGIONS
+
SIMILARITY-WEIGHTED NEIGHBORS
```

The region provides:

```text
Stable local prior

Interpretability

Aggregation

Efficient retrieval
```

Neighbors provide:

```text
Smooth generalization

Boundary awareness

Fine-grained context
```

---

# 21. Hierarchical Regions

Regions may exist at multiple levels.

Example:

```text
LEVEL 0

All ISSUE_CUSTOMER_REFUND actions
```

```text
LEVEL 1

Domestic refunds
```

```text
LEVEL 2

Domestic duplicate-charge refunds
```

```text
LEVEL 3

Domestic duplicate-charge refunds
between ₹5,000 and ₹25,000
```

```text
LEVEL 4

Same region
with complete evidence
and no conflict
```

This creates a hierarchy.

Sparse specific regions may borrow weak prior information from broader parent regions.

But parent evidence must not erase local contradictory evidence.

---

# 22. Region Hierarchy Principle

Specific evidence dominates broad evidence.

Suppose:

```text
All refunds:
98% success
```

But:

```text
International fraud disputes:
52% success
```

For an international fraud dispute, the system must not report:

```text
98%
```

The specific local region matters more.

Broad parent regions provide priors.

They do not override local observations.

---

# 23. Region Construction Strategy

V1 uses deterministic region definitions.

Example:

```text
case_type

amount_band

payment_environment

evidence_completeness
```

Region ID may derive from:

```text
schema version

ordered region predicates
```

Later versions may support adaptive region discovery.

V1 should not begin with opaque unsupervised clustering.

---

# 24. Why Not Start With Clustering

Automatic clustering may discover useful structure.

But V1 requires:

```text
Interpretability

Reproducibility

Benchmarkability

Clear failure analysis
```

Therefore:

```text
V1:
Human-designed region dimensions
```

Later:

```text
Research extension:
Adaptive topology refinement
```

---

# 25. Competence Observation

A Competence Observation records one piece of historical evidence about agent performance.

Conceptual schema:

```typescript
interface CompetenceObservation {
  observationId: string;

  agentId: string;

  agentVersion: string;

  actionId: string;

  actionVersion: number;

  featureVectorId: string;

  outcomeAssessmentId: string;

  environment:
    | "SIMULATION"
    | "SANDBOX"
    | "STAGING"
    | "PRODUCTION";

  supervisionMode:
    | "AUTONOMOUS"
    | "HUMAN_APPROVED"
    | "HUMAN_ASSISTED"
    | "SHADOW";

  observedAt: Timestamp;

  eligibleForLearning: boolean;

  evidenceClass: string;
}
```

One action may produce one primary competence observation.

---

# 26. Outcome Assessment

Competence requires an outcome label.

Conceptual schema:

```typescript
interface OutcomeAssessment {
  outcomeAssessmentId: string;

  actionId: string;

  outcomeStatus:
    | "SUCCESS"
    | "PARTIAL_SUCCESS"
    | "FAILURE"
    | "UNKNOWN";

  correctnessScore?: number;

  interventionLevel:
    | "NONE"
    | "MINOR"
    | "MAJOR"
    | "TAKEOVER";

  observedEffectsMatchedExpectation?: boolean;

  delayedFailureDetected?: boolean;

  evaluatorType:
    | "DETERMINISTIC"
    | "HUMAN"
    | "EXTERNAL_SYSTEM"
    | "AI_ASSISTED"
    | "COMPOSITE";

  evaluatorVersion: string;

  evidenceRefs: string[];

  assessedAt: Timestamp;

  finalAt?: Timestamp;
}
```

---

# 27. Success Must Be Defined Per Action Type

For:

```text
ISSUE_CUSTOMER_REFUND
```

success may require:

```text
Correct customer

Correct amount

Exactly one refund

Provider confirms settlement

No duplicate execution

Case state remains consistent
```

For:

```text
SEND_CUSTOMER_EMAIL
```

success may require:

```text
Correct recipient

Correct content

No prohibited disclosure

Delivery accepted
```

Therefore success is not one universal boolean rule.

Each action type requires an outcome evaluator.

---

# 28. Execution Success Is Not Outcome Success

Example:

```text
API returned HTTP 200.
```

This means:

```text
Execution succeeded.
```

It does not necessarily mean:

```text
Agent decision was correct.
```

If the agent refunded the wrong customer:

```text
Tool execution:
SUCCESS

Action outcome:
FAILURE
```

Competence must learn from the latter.

---

# 29. Partial Success

Some actions are neither fully successful nor fully failed.

Example:

```text
Correct refund amount

Correct customer

But human had to repair the case state
```

Possible result:

```text
PARTIAL_SUCCESS
```

V1 should map outcomes to a numeric learning value.

Recommended:

```text
SUCCESS
→ 1.0

PARTIAL_SUCCESS
→ configurable value

FAILURE
→ 0.0

UNKNOWN
→ excluded from posterior update
```

The partial-success value must be action-type-specific.

---

# 30. Human Intervention Semantics

Suppose an agent proposes the wrong amount.

A human corrects it.

The final refund succeeds.

The system must not record:

```text
Agent success:
1.0
```

The observation should preserve:

```text
Initial proposal quality

Human correction

Final execution outcome
```

A competence learning value may be reduced.

Example:

```text
Correct without intervention:
1.0

Minor human correction:
0.7

Major correction:
0.3

Human takeover:
0.0
```

These are illustrative.

Exact values must be benchmarked.

---

# 31. Delayed Outcomes

Some failures appear later.

Example:

```text
Refund initially succeeds.

Two days later:

Duplicate refund discovered.
```

The outcome must support revision.

Therefore outcome assessments may transition:

```text
PROVISIONAL
→ FINAL
```

Conceptually:

```text
Initial outcome:
SUCCESS

Later:
FAILURE
```

The competence system must update affected posterior state.

---

# 32. Outcome Revision

Historical learning must not assume outcomes are immutable from the first observation.

When an outcome changes:

```text
Old contribution
must be removed
```

and:

```text
New contribution
must be applied
```

The system must not simply append both.

Otherwise one action becomes two observations.

---

# 33. Evidence Classes

Not all experience is equally strong.

Recommended classes:

```text
PRODUCTION_AUTONOMOUS

PRODUCTION_HUMAN_APPROVED

PRODUCTION_HUMAN_ASSISTED

STAGING

SANDBOX

SIMULATION

SHADOW
```

Each class receives a base evidence weight.

Example ordering:

\[
w_{production\_autonomous}
>
w_{simulation}
\]

But the exact weights are configurable.

---

# 34. Why Simulation Evidence Is Weaker

Simulation may fail to capture:

```text
Real provider behavior

Latency

Race conditions

Unexpected side effects

Human reactions

Distribution shift
```

Therefore:

```text
100 simulation successes
```

must not automatically equal:

```text
100 production successes
```

Simulation is valuable.

It is not identical evidence.

---

# 35. Shadow Evidence

In shadow mode:

```text
Agent proposes action.

Action is not executed by the agent.

System compares proposal against trusted reference.
```

This can produce competence evidence.

But it must be weighted according to:

```text
Reference quality

Task realism

Whether execution effects matter
```

Shadow success is not production execution success.

---

# 36. Agent Identity Continuity

SPEC-001 records:

```text
agent_id

agent_version

model identity

system prompt version

toolset version

runtime config version
```

SPEC-003 uses these to determine evidence continuity.

The central question is:

> How much historical competence should the current agent inherit from prior versions?

---

# 37. Material Agent Changes

Potentially competence-relevant changes include:

```text
Base model changed

System prompt changed

Toolset changed

Tool schema changed

Planning strategy changed

Memory system changed

Retrieval system changed

Runtime policy changed
```

Not every change has equal impact.

Example:

```text
UI label changed
```

should not reset competence.

Example:

```text
Model provider changed
```

may require substantial evidence discounting.

---

# 38. Agent Competence Lineage

Conceptual schema:

```typescript
interface AgentCompetenceLineage {
  lineageId: string;

  parentAgentVersion: string;

  childAgentVersion: string;

  changeClassification:
    | "NON_MATERIAL"
    | "LOW_IMPACT"
    | "MEDIUM_IMPACT"
    | "HIGH_IMPACT"
    | "UNKNOWN";

  inheritanceFactor: number;

  evidenceRefs: string[];

  createdAt: Timestamp;
}
```

Example:

```text
RefundAgent 4.1
→ RefundAgent 4.2

Change:
Prompt wording improvement

Inheritance factor:
0.85
```

Another:

```text
RefundAgent 4.2
→ RefundAgent 5.0

Change:
Different model family

Inheritance factor:
0.20
```

Exact factors require policy and benchmarking.

---

# 39. No Automatic Full Inheritance

The following is prohibited:

```text
Agent ID unchanged
therefore
all historical competence transfers fully.
```

Competence belongs to a behavior-producing system configuration.

Not merely a display name.

---

# 40. Competence Cold Start

A new agent may have:

```text
No historical evidence.
```

The system must not output:

```text
50% competent
```

as though this were an empirical estimate.

Cold start must be explicit.

Possible state:

```text
COMPETENCE_STATE:
UNESTABLISHED
```

The agent may then gain evidence through:

```text
Simulation

Shadow mode

Human-approved actions

Low-consequence production actions
```

The Autonomy Engine determines how that state affects autonomy.

---

# 41. Cold Start Priors

A Bayesian model requires a prior.

V1 uses a Beta prior.

For binary outcomes:

\[
p \sim Beta(\alpha_0,\beta_0)
\]

The prior must be conservative.

Example:

\[
Beta(1,1)
\]

is uniform.

But a uniform prior may still be too permissive for autonomy.

Therefore AEGIS separates:

```text
Statistical prior
```

from:

```text
Autonomy eligibility requirements
```

A posterior mean of 0.8 based on one success must not imply high autonomy.

Evidence count matters separately.

---

# 42. Region-Level Beta Posterior

For a region \(r\):

\[
p_r \sim Beta(\alpha_r,\beta_r)
\]

Starting with:

\[
\alpha_r = \alpha_0
\]

\[
\beta_r = \beta_0
\]

For weighted success evidence:

\[
\alpha_r
=
\alpha_0
+
\sum_i w_i y_i
\]

\[
\beta_r
=
\beta_0
+
\sum_i w_i(1-y_i)
\]

where:

```text
yᵢ
=
outcome learning value

wᵢ
=
effective evidence weight
```

The posterior mean is:

\[
\mu_r
=
\frac{\alpha_r}
{\alpha_r+\beta_r}
\]

But AEGIS must not rely only on the mean.

---

# 43. Credible Interval

The posterior provides uncertainty.

For example:

```text
Posterior mean:
0.94
```

But:

```text
95% credible interval:
[0.52, 0.99]
```

means the evidence is weak.

Another region:

```text
Posterior mean:
0.92

95% credible interval:
[0.89, 0.95]
```

is far more established.

Therefore the Competence Assessment must expose:

```text
Posterior mean

Lower credible bound

Upper credible bound

Interval width
```

---

# 44. Conservative Competence Bound

For autonomy decisions, the useful quantity may be:

\[
C_{lower}(a,x)
\]

the lower credible bound.

Example:

```text
Mean:
0.97

Lower bound:
0.74
```

The system should not behave as though competence is certainly 97%.

SPEC-008 will decide how the Autonomy Engine uses these values.

SPEC-003 only produces them.

---

# 45. Effective Evidence Count

Weighted evidence requires a meaningful sample-size measure.

A naive sum:

\[
\sum_i w_i
\]

is useful but incomplete.

If one observation has enormous weight, it should not necessarily look like many independent observations.

AEGIS should expose:

```text
Weighted evidence mass
```

and:

```text
Effective sample size
```

A common form is:

\[
N_{eff}
=
\frac{(\sum_i w_i)^2}
{\sum_i w_i^2}
\]

This helps distinguish:

```text
Many independent observations
```

from:

```text
One heavily weighted observation
```

---

# 46. Evidence Weight Decomposition

For observation \(i\), effective weight is:

\[
w_i
=
w_{source}
\times
w_{similarity}
\times
w_{recency}
\times
w_{lineage}
\times
w_{outcome}
\times
w_{quality}
\]

where:

```text
w_source
=
environment and supervision strength

w_similarity
=
closeness to current action

w_recency
=
age of evidence

w_lineage
=
agent-version inheritance

w_outcome
=
outcome certainty

w_quality
=
evaluator and evidence quality
```

Every component must be inspectable.

---

# 47. Weight Bounds

Each component should generally satisfy:

\[
0 \leq w \leq 1
\]

and therefore:

\[
0 \leq w_i \leq 1
\]

V1 should avoid weights above 1.

No single observation should count as multiple independent observations.

---

# 48. Source Weight

Example configurable defaults:

```text
Production autonomous:
1.00

Production human approved:
0.90

Production human assisted:
0.60

Staging:
0.50

Sandbox:
0.35

Simulation:
0.25

Shadow:
0.20–0.60
depending on reference quality
```

These are initial research values.

They are not universal truths.

The benchmark system must test them.

---

# 49. Similarity Weight

For current action \(x\) and historical action \(x_i\):

\[
w_{sim,i}
=
K(d(\phi(x),\phi(x_i)))
\]

where:

```text
d
=
mixed-type distance function

K
=
distance-to-weight kernel
```

Possible kernel:

\[
K(d)
=
e^{-\lambda d^2}
\]

V1 may use this form because it is:

```text
Smooth

Bounded

Monotonic

Easy to inspect
```

---

# 50. Mixed-Type Distance

The feature space contains mixed data.

Therefore distance is not one Euclidean calculation.

Conceptually:

\[
d(x,x_i)
=
\frac{
\sum_j \omega_j d_j(x_j,x_{ij})
}{
\sum_j \omega_j
}
\]

where:

```text
ωⱼ
=
feature importance weight

dⱼ
=
feature-specific distance
```

---

# 51. Categorical Distance

Simple form:

\[
d_j =
\begin{cases}
0 & \text{if equal}\\
1 & \text{if different}
\end{cases}
\]

But some categories may have structured similarity.

Example:

```text
DUPLICATE_CHARGE
```

may be closer to:

```text
SERVICE_FAILURE
```

than:

```text
FRAUD_DISPUTE
```

V1 should use exact categorical distance unless domain evidence justifies a similarity matrix.

---

# 52. Continuous Distance

For amount:

\[
d_{amount}
=
\min
\left(
1,
\frac{|a-b|}{s}
\right)
\]

where:

```text
s
=
domain-specific scale
```

But raw linear amount may be poor.

Difference between:

```text
₹500 and ₹1,000
```

may matter differently from:

```text
₹5,00,000 and ₹5,00,500
```

Therefore log-scaled distance may be better:

\[
d_{amount}
=
\min
\left(
1,
\frac{
|\log(1+a)-\log(1+b)|
}{s}
\right)
\]

V1 should benchmark both.

---

# 53. Ordinal Distance

For:

```text
Evidence completeness:

NONE

PARTIAL

SUBSTANTIAL

COMPLETE
```

map to ordered values.

Then:

\[
d_j
=
\frac{|rank(a)-rank(b)|}
{maxRank-minRank}
\]

This preserves ordering.

---

# 54. Boolean Distance

\[
d_j =
\begin{cases}
0 & \text{if equal}\\
1 & \text{if different}
\end{cases}
\]

Example:

```text
evidence_conflict:
true vs false
```

---

# 55. Missing-Value Distance

If one value is unknown and one known:

```text
Apply configured missingness penalty.
```

Example:

\[
d_{missing}
=
0.5
\]

If both are unknown:

```text
Do not automatically treat as identical.
```

Two unknowns do not prove semantic similarity.

V1 should define per-feature missingness behavior.

---

# 56. Feature Importance Weights

Not all dimensions matter equally.

For refunds:

```text
case_type:
high importance

evidence_conflict:
high importance

amount:
high importance

case_age:
lower importance
```

The similarity profile stores these weights.

Conceptual schema:

```typescript
interface SimilarityProfile {
  profileId: string;

  schemaId: string;

  version: number;

  featureWeights: Record<string, number>;

  distanceFunctions: Record<string, string>;

  kernelType: string;

  kernelParameters: Record<string, number>;
}
```

---

# 57. Similarity Must Be Learned Carefully

A dangerous system may assume:

```text
All refunds are similar.
```

Another may assume:

```text
No two refunds are similar.
```

Both fail.

Similarity configuration must be validated using historical predictive performance.

The question is:

> Do nearby actions actually have similar outcome behavior?

---

# 58. Neighbor Retrieval

For a current action, AEGIS retrieves:

```text
Exact-region observations

Parent-region observations

Nearest neighboring observations
```

Conceptual output:

```typescript
interface NeighborSet {
  queryFeatureVectorId: string;

  observationRefs: NeighborObservation[];

  retrievalVersion: string;

  maximumDistance: number;

  createdAt: Timestamp;
}
```

Each neighbor records:

```text
Distance

Similarity weight

Region relationship

Recency

Lineage relationship

Outcome
```

---

# 59. Maximum Neighbor Distance

Distant observations must eventually contribute zero evidence.

If:

\[
d > d_{max}
\]

then:

\[
w_{similarity} = 0
\]

This prevents the system from treating all history as relevant.

---

# 60. Neighbor Count Limit

V1 should use:

```text
Maximum K neighbors
```

for computational control.

But retrieval should also require:

```text
Maximum distance
```

Using only K is unsafe.

If the nearest 50 observations are all extremely distant, they should not become strong evidence merely because they are the nearest.

---

# 61. Recency Weight

Agent performance changes over time.

A simple decay function:

\[
w_{recency}
=
e^{-\lambda t}
\]

where:

```text
t
=
age of observation
```

Equivalent half-life form:

\[
w_{recency}
=
2^{-t/h}
\]

where:

```text
h
=
evidence half-life
```

This is easier to interpret.

Example:

```text
Half-life:
90 days
```

Evidence from 90 days ago receives:

```text
0.5 recency weight
```

---

# 62. Different Domains Need Different Half-Lives

A stable deterministic agent may change slowly.

A frequently updated LLM agent may change quickly.

Therefore half-life may depend on:

```text
Agent update frequency

Action family

Environment

Observed drift
```

V1 should begin with configured action-family half-lives.

---

# 63. Recency Is Not Deletion

Old evidence remains in the ledger.

It simply contributes less to current competence.

Historical analysis must remain possible.

---

# 64. Outcome Certainty Weight

Suppose outcome label:

```text
SUCCESS
```

came from deterministic reconciliation.

Strong.

Another:

```text
SUCCESS
```

came from an uncertain AI evaluator.

Weaker.

Therefore:

```text
Deterministic verified outcome:
high weight

Human adjudicated outcome:
high weight

AI-assisted uncertain outcome:
lower weight
```

The label and confidence remain separate.

---

# 65. The Hybrid Competence Estimate

For current action \(x\), AEGIS combines:

```text
Region posterior

Neighbor-weighted evidence
```

A conceptual V1 model is:

\[
\alpha_x
=
\alpha_{region}
+
\sum_{i \in N(x)}
w_i y_i
\]

\[
\beta_x
=
\beta_{region}
+
\sum_{i \in N(x)}
w_i(1-y_i)
\]

But care is required.

If the region posterior already contains the same observations, adding neighbors duplicates evidence.

Therefore the implementation must prevent double counting.

---

# 66. No Double Counting

V1 should use one of two valid strategies.

Recommended:

```text
Region posterior supplies prior evidence
from non-overlapping broader evidence.

Neighbor set supplies local evidence.
```

Or:

```text
Region posterior alone for exact region.

Neighbors only from outside exact region.
```

The system must record observation IDs used in each contribution.

One historical action must not count twice in one assessment.

---

# 67. Recommended V1 Estimation Strategy

Use:

```text
STEP 1

Select most specific competence region
containing the current action.
```

```text
STEP 2

Load exact-region observations.
```

```text
STEP 3

Load neighboring observations
outside the exact region.
```

```text
STEP 4

Apply source, recency, lineage,
outcome-quality, and similarity weights.
```

```text
STEP 5

Update conservative Beta prior.
```

```text
STEP 6

Calculate posterior mean,
credible interval,
evidence mass,
and effective sample size.
```

This is mathematically understandable and implementable by one strong developer.

---

# 68. Competence State

The engine should classify evidence state separately from probability.

Recommended:

```typescript
type CompetenceEvidenceState =
  | "UNESTABLISHED"
  | "EMERGING"
  | "ESTABLISHED"
  | "STRONG"
  | "DEGRADED"
  | "CONFLICTED";
```

These labels describe evidence quality.

They do not directly determine autonomy.

---

# 69. UNESTABLISHED

Characteristics:

```text
Little or no relevant evidence

High posterior uncertainty

Large extrapolation
```

---

# 70. EMERGING

Characteristics:

```text
Some relevant evidence

Insufficient density for strong confidence
```

---

# 71. ESTABLISHED

Characteristics:

```text
Adequate relevant evidence

Reasonably narrow credible interval

No major degradation signal
```

---

# 72. STRONG

Characteristics:

```text
Large relevant evidence base

High lower credible bound

Stable recent performance
```

---

# 73. DEGRADED

Characteristics:

```text
Historical competence existed

Recent evidence shows significant decline
```

---

# 74. CONFLICTED

Characteristics:

```text
Relevant evidence strongly disagrees

Different nearby subregions have different outcomes

Current estimate is unstable
```

A high mean with conflicted evidence must not look equivalent to stable competence.

---

# 75. Competence Assessment

Conceptual output:

```typescript
interface CompetenceAssessment {
  assessmentId: string;

  actionId: string;

  actionVersion: number;

  agentId: string;

  agentVersion: string;

  featureVectorId: string;

  primaryRegionId: string;

  competenceMean: number;

  credibleInterval: {
    level: number;
    lower: number;
    upper: number;
  };

  evidenceState: CompetenceEvidenceState;

  weightedEvidenceMass: number;

  effectiveSampleSize: number;

  exactRegionEvidenceCount: number;

  neighborEvidenceCount: number;

  nearestNeighborDistance?: number;

  meanNeighborDistance?: number;

  extrapolationLevel:
    | "NONE"
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "EXTREME";

  driftStatus:
    | "STABLE"
    | "IMPROVING"
    | "DEGRADING"
    | "UNKNOWN";

  evidenceBreakdown: EvidenceBreakdown;

  reasonCodes: string[];

  snapshotReference: string;

  engineVersion: string;

  createdAt: Timestamp;
}
```

---

# 76. Why Mean Alone Is Insufficient

Compare:

```text
Agent A

Competence mean:
0.95

Effective sample size:
2
```

with:

```text
Agent B

Competence mean:
0.93

Effective sample size:
500
```

Agent A does not clearly have stronger competence.

The second estimate is far better established.

Therefore dashboards and APIs must never show competence probability without evidence context.

---

# 77. Extrapolation Level

Competence estimation may rely on unfamiliar territory.

The engine should expose how far it is extrapolating.

Possible inputs:

```text
Nearest-neighbor distance

Local evidence density

Region occupancy

Feature boundary violations
```

Example:

```text
Current action:

₹5,00,000 international fraud refund
```

History:

```text
₹500–₹5,000 domestic duplicate-charge refunds
```

Result:

```text
EXTRAPOLATION:
EXTREME
```

Even if the broad refund region has excellent performance.

---

# 78. Competence vs Novelty

These concepts are related but distinct.

Competence asks:

> How well has this agent performed in relevant contexts?

Novelty asks:

> How unfamiliar is this action relative to known experience?

Possible combinations:

```text
HIGH COMPETENCE
LOW NOVELTY
```

Normal familiar action.

```text
HIGH COMPETENCE
HIGH NOVELTY
```

Strong agent facing unusual case.

```text
LOW COMPETENCE
LOW NOVELTY
```

Repeatedly poor performance in familiar region.

```text
LOW COMPETENCE
HIGH NOVELTY
```

Weak evidence in unfamiliar territory.

SPEC-004 will formalize novelty.

---

# 79. Local Competence Failure

An agent may have:

```text
Global refund success:
98%
```

but:

```text
Fraud-dispute success:
43%
```

The topology must preserve the low-performing region.

This is a core reason the platform is resume-worthy and research-worthy.

AEGIS does not ask:

```text
Is this a good agent?
```

It asks:

```text
Where is this agent good?
```

---

# 80. Competence Holes

A competence hole is a weak region surrounded by strong regions.

Example:

```text
Domestic duplicate-charge:
97%

Domestic service failure:
95%

Domestic fraud dispute:
42%

Domestic cancellation:
96%
```

The fraud-dispute region is a competence hole.

A global score would hide it.

The topology exposes it.

---

# 81. Competence Frontiers

A competence frontier is the boundary between:

```text
Well-supported competence
```

and:

```text
Sparse or uncertain territory
```

Example:

```text
Refund amount:

₹0–₹25,000
strong evidence

₹25,000–₹50,000
emerging evidence

Above ₹50,000
unestablished
```

This boundary is valuable for adaptive autonomy.

The agent may be allowed to learn gradually near the frontier.

It should not leap blindly far beyond it.

---

# 82. Competence Expansion

Competence should expand through evidence.

Example:

```text
Initially:

Strong competence up to ₹5,000
```

After successful supervised experience:

```text
Emerging competence:
₹5,000–₹10,000
```

Then:

```text
Established competence:
₹5,000–₹10,000
```

The topology changes over time.

This is the foundation of adaptive autonomy.

---

# 83. Exploration Must Not Contaminate Evidence

Suppose AEGIS intentionally allows a frontier action under human approval.

The outcome becomes competence evidence.

But the system must preserve:

```text
It was exploratory.

It was supervised.

It was near the frontier.
```

This allows research into safe competence expansion.

---

# 84. Competence Drift

Agents can degrade.

Causes:

```text
Model update

Prompt regression

Tool API change

Data distribution shift

Provider behavior change

Memory corruption

Retrieval degradation
```

The Competence Engine must detect changes.

---

# 85. Short-Term and Long-Term Performance

For each region, maintain conceptually:

```text
Long-term posterior

Recent-window posterior
```

Example:

```text
Long-term success:
96%

Recent success:
61%
```

This indicates possible degradation.

---

# 86. Drift Detection

V1 should use interpretable methods.

Recommended combination:

```text
Rolling posterior comparison

Exponentially weighted moving outcome rate

Minimum evidence threshold

Consecutive degradation requirement
```

Possible later methods:

```text
CUSUM

Page-Hinkley

Bayesian change-point detection
```

V1 should not begin with opaque drift detection.

---

# 87. Drift Signal

Conceptual schema:

```typescript
interface CompetenceDriftSignal {
  signalId: string;

  agentId: string;

  regionId: string;

  status:
    | "IMPROVING"
    | "STABLE"
    | "DEGRADING";

  longTermEstimate: number;

  recentEstimate: number;

  difference: number;

  evidenceCount: number;

  confidence: number;

  detectorVersion: string;

  createdAt: Timestamp;
}
```

---

# 88. Degradation Rule

Illustrative rule:

```text
If:

recent lower bound
<
long-term lower bound - δ

and:

recent evidence count >= N

for:

M consecutive assessments

then:

DEGRADING
```

The exact values must be configurable and benchmarked.

---

# 89. Why Not Immediately Reset on One Failure

One failure may be:

```text
Random variance

Bad external service

Incorrect outcome label

Unusual case
```

Immediate competence collapse would create instability.

The system needs:

```text
Sensitivity
without
overreaction
```

---

# 90. Catastrophic Failure Exception

Some failures are so severe that normal gradual drift logic is insufficient.

Example:

```text
Wrong customer received money.

Mass data disclosure.

Repeated duplicate financial execution.
```

The Consequence Engine will classify severity.

A catastrophic verified failure may trigger:

```text
Immediate regional competence suspension

Agent-wide review

Autonomy downgrade
```

The exact cross-engine behavior belongs to later specifications.

SPEC-003 must support a:

```text
CRITICAL_FAILURE
```

observation class.

---

# 91. External Failure vs Agent Failure

Suppose:

```text
Agent selected correct action.

Payment provider was unavailable.
```

This should not automatically become:

```text
Agent competence failure.
```

Outcome evaluation must distinguish:

```text
Decision failure

Execution failure

External dependency failure

System failure
```

Conceptual failure attribution:

```typescript
type FailureAttribution =
  | "AGENT_DECISION"
  | "AGENT_EXECUTION"
  | "TOOL"
  | "EXTERNAL_SERVICE"
  | "AEGIS"
  | "HUMAN"
  | "MIXED"
  | "UNKNOWN";
```

---

# 92. Failure Attribution Weight

If failure is clearly external:

```text
Agent competence update:
none or minimal
```

If clearly agent-caused:

```text
Full negative evidence
```

If mixed:

```text
Partial negative evidence
```

This must remain configurable.

---

# 93. Counterfactual Evaluation

Sometimes an action is blocked.

We may still want to know:

```text
Would the agent's proposed action have been correct?
```

A trusted evaluator may generate:

```text
Counterfactual competence evidence
```

This must be marked separately.

It should not receive the same weight as observed production outcome.

---

# 94. Data Leakage Prevention

Competence estimation must use only evidence available before the assessment timestamp.

The system must prevent:

```text
Future outcome leakage
```

During replay and benchmark evaluation.

Otherwise historical competence results become artificially strong.

---

# 95. Snapshot Semantics

Every Competence Assessment must reference:

```text
Historical observation cutoff time

Observation versions

Outcome versions

Feature schema version

Similarity profile version

Region definition version

Agent lineage version

Weight configuration version

Posterior algorithm version
```

This creates reproducibility.

---

# 96. Competence Assessment Pipeline

The runtime flow is:

```text
STEP 1

Receive immutable Canonical Action.
```

```text
STEP 2

Resolve exact agent identity.
```

```text
STEP 3

Load competence feature schema.
```

```text
STEP 4

Extract competence feature vector.
```

```text
STEP 5

Resolve agent competence lineage.
```

```text
STEP 6

Identify most specific containing region.
```

```text
STEP 7

Retrieve exact-region evidence.
```

```text
STEP 8

Retrieve neighboring evidence.
```

```text
STEP 9

Remove ineligible observations.
```

```text
STEP 10

Prevent duplicate evidence contribution.
```

```text
STEP 11

Calculate source weights.
```

```text
STEP 12

Calculate similarity weights.
```

```text
STEP 13

Calculate recency weights.
```

```text
STEP 14

Calculate lineage weights.
```

```text
STEP 15

Calculate outcome-quality weights.
```

```text
STEP 16

Construct posterior.
```

```text
STEP 17

Calculate credible interval.
```

```text
STEP 18

Calculate evidence mass and effective sample size.
```

```text
STEP 19

Calculate extrapolation level.
```

```text
STEP 20

Resolve drift status.
```

```text
STEP 21

Classify evidence state.
```

```text
STEP 22

Persist immutable Competence Assessment.
```

---

# 97. Observation Eligibility

An observation may be excluded if:

```text
Outcome unknown

Outcome evaluator invalidated

Action corrupted

Feature schema incompatible

Agent lineage incompatible

Duplicate observation

Known benchmark contamination

Evidence marked fraudulent

Timestamp exceeds assessment cutoff
```

Exclusion reasons must be recorded.

---

# 98. Competence Reason Codes

Stable reason codes include:

```text
COMP_COLD_START

COMP_LOW_EVIDENCE

COMP_STRONG_LOCAL_EVIDENCE

COMP_HIGH_POSTERIOR_UNCERTAINTY

COMP_EXTREME_EXTRAPOLATION

COMP_RECENT_DEGRADATION

COMP_CONFLICTED_NEIGHBORHOOD

COMP_AGENT_VERSION_SHIFT

COMP_SIMULATION_HEAVY_EVIDENCE

COMP_HUMAN_ASSISTANCE_HEAVY

COMP_OUTCOME_QUALITY_LOW

COMP_LOCAL_FAILURE_CLUSTER

COMP_STRONG_COMPETENCE_REGION

COMP_UNKNOWN_CRITICAL_FEATURE

COMP_INSUFFICIENT_NEIGHBORS
```

---

# 99. V1 Refund Competence Feature Space

For the flagship implementation:

```text
ACTION TYPE

ISSUE_CUSTOMER_REFUND
```

Primary competence dimensions:

```text
case_type

amount_band

payment_environment

evidence_completeness

evidence_conflict

prior_refund_attempts
```

Secondary dimensions:

```text
customer_risk_class

case_age_band

tool_version
```

---

# 100. V1 Amount Bands

Initial bands:

```text
₹0–₹1,000

₹1,001–₹5,000

₹5,001–₹25,000

₹25,001–₹1,00,000

Above ₹1,00,000
```

The exact boundaries are domain configuration.

They should not be hardcoded into the engine.

---

# 101. V1 Case Types

```text
DUPLICATE_CHARGE

SERVICE_FAILURE

CANCELLATION

FRAUD_DISPUTE

OTHER

UNKNOWN
```

---

# 102. V1 Evidence Completeness

```text
NONE

PARTIAL

SUBSTANTIAL

COMPLETE

UNKNOWN
```

---

# 103. V1 Evidence Conflict

```text
NONE

MINOR

MAJOR

UNKNOWN
```

---

# 104. V1 Primary Region Definition

Recommended V1 region key:

```text
action_type

case_type

amount_band

payment_environment
```

Evidence completeness and conflict remain distance features.

This prevents region explosion.

---

# 105. Region Explosion Problem

Suppose we partition by:

```text
6 case types

5 amount bands

3 payment environments

5 evidence states

4 conflict states

4 risk classes
```

Total possible regions:

\[
6 \times 5 \times 3 \times 5 \times 4 \times 4
=
7200
\]

Most will be sparse.

Therefore not every feature should define hard partitions.

The hybrid topology avoids this.

---

# 106. V1 Similarity Profile

Illustrative starting weights:

```text
case_type:
0.25

amount:
0.25

payment_environment:
0.15

evidence_completeness:
0.15

evidence_conflict:
0.10

prior_refund_attempts:
0.05

case_age:
0.05
```

These values are initial hypotheses.

The benchmark harness must tune and challenge them.

---

# 107. Example 1 — Strong Local Competence

Current action:

```text
₹18,400 refund

Duplicate charge

Domestic

Complete evidence

No conflict
```

History:

```text
143 highly similar actions

139 successful

4 failed

Mostly recent

Same agent version
```

Possible output:

```text
Competence mean:
0.96

95% credible interval:
[0.92, 0.98]

Effective sample size:
118

Evidence state:
STRONG

Extrapolation:
NONE

Drift:
STABLE
```

This is strong demonstrated competence.

---

# 108. Example 2 — Misleading Global Score

Agent global history:

```text
10,000 actions

98% success
```

Current action:

```text
₹2,50,000

International

Fraud dispute

Major evidence conflict
```

Relevant history:

```text
2 nearby actions

1 success

1 failure
```

Output:

```text
Competence mean:
uncertain

Wide credible interval

Evidence state:
UNESTABLISHED

Extrapolation:
HIGH
```

The global 98% score is irrelevant.

---

# 109. Example 3 — Competence Hole

History:

```text
Domestic duplicate charge:
98%

Domestic service failure:
96%

Domestic fraud dispute:
44%
```

Current action:

```text
Domestic fraud dispute
```

Output:

```text
Evidence state:
ESTABLISHED

Competence:
LOW
```

This is important.

Low competence can be strongly established.

Uncertainty and incompetence are not the same.

---

# 110. Example 4 — High Mean, Weak Evidence

History:

```text
3 similar actions

3 successes
```

Output may be:

```text
Posterior mean:
high

Credible interval:
wide

Evidence state:
EMERGING
```

The engine must not call this strong competence.

---

# 111. Example 5 — Recent Degradation

Long-term:

```text
500 similar actions

96% success
```

Recent:

```text
20 similar actions

55% success
```

Output:

```text
Competence mean:
still moderately high
```

but:

```text
Drift:
DEGRADING
```

and:

```text
Reason:
COMP_RECENT_DEGRADATION
```

This prevents historical success from hiding regression.

---

# 112. Example 6 — Agent Version Change

Old version:

```text
RefundAgent 4.2

500 successful observations
```

New version:

```text
RefundAgent 5.0

Different model family
```

Lineage:

```text
HIGH_IMPACT

Inheritance factor:
0.20
```

Old evidence contributes weakly.

The new version must rebuild competence.

---

# 113. Example 7 — Human Rescue

Agent proposes:

```text
Refund ₹18,400
```

Correct amount:

```text
₹8,400
```

Human corrects the action.

Final execution succeeds.

Outcome:

```text
Final business outcome:
SUCCESS

Agent decision:
FAILURE

Intervention:
MAJOR
```

Competence learning must reflect agent failure.

---

# 114. Example 8 — External Provider Failure

Agent proposes correct refund.

Provider is unavailable.

Result:

```text
Execution:
FAILURE

Failure attribution:
EXTERNAL_SERVICE
```

Agent competence should not receive a full negative update.

---

# 115. Example 9 — Unknown Outcome

Action executed.

No reconciliation data exists.

Result:

```text
Outcome:
UNKNOWN
```

The observation remains in the ledger.

It does not update competence until resolved.

---

# 116. Example 10 — Competence Frontier

Strong evidence:

```text
₹0–₹25,000
```

Current action:

```text
₹28,000
```

This may be:

```text
LOW or MEDIUM extrapolation
```

Current action:

```text
₹8,00,000
```

This may be:

```text
EXTREME extrapolation
```

The topology distinguishes near-frontier learning from blind leaps.

---

# 117. Database Ownership

The Competence Intelligence System owns conceptually:

```text
competence_feature_schemas

competence_feature_definitions

competence_feature_vectors

competence_regions

competence_region_predicates

competence_observations

outcome_assessments

outcome_assessment_versions

similarity_profiles

agent_competence_lineage

competence_drift_signals

competence_assessments

competence_assessment_evidence
```

Exact relational design belongs to SPEC-011.

---

# 118. Event Model

The system emits:

```text
COMPETENCE_FEATURE_VECTOR_CREATED

COMPETENCE_OBSERVATION_CREATED

OUTCOME_ASSESSED

OUTCOME_REVISED

COMPETENCE_REGION_UPDATED

COMPETENCE_ASSESSMENT_STARTED

COMPETENCE_ASSESSED

COMPETENCE_COLD_START_DETECTED

COMPETENCE_FRONTIER_DETECTED

COMPETENCE_DEGRADATION_DETECTED

COMPETENCE_RECOVERED

CRITICAL_COMPETENCE_FAILURE_RECORDED
```

---

# 119. Performance Requirements

Initial target:

```text
Feature extraction:
< 20 ms

Region resolution:
< 20 ms

Neighbor retrieval:
< 100 ms

Weight calculation:
< 50 ms

Posterior calculation:
< 20 ms

Total deterministic competence assessment:
< 250 ms
```

This excludes:

```text
External outcome evaluation

Offline embedding generation

Asynchronous drift analysis
```

The critical path should not require an LLM.

---

# 120. Retrieval Architecture

V1 should use:

```text
PostgreSQL
```

for:

```text
Structured features

Region queries

Historical observations

Posterior state

Assessment evidence
```

If semantic embeddings are used:

```text
pgvector
```

is sufficient for V1.

A separate vector database is not required.

---

# 121. Precomputation

Safe precomputed data:

```text
Feature vectors

Region membership

Outcome learning values

Agent lineage factors

Long-term region statistics
```

Dynamic per-action calculations:

```text
Current neighbor set

Current recency weights

Current extrapolation

Current drift state
```

---

# 122. Caching

Safe cache candidates:

```text
Feature schemas

Similarity profiles

Region definitions

Agent lineage metadata
```

Potentially unsafe stale cache:

```text
Latest outcome revisions

Latest drift status

Recent competence observations
```

Freshness must be explicit.

---

# 123. Testing Strategy

The Competence Engine requires:

```text
Feature extraction tests

Distance-function tests

Region assignment tests

Posterior-update tests

Evidence-weight tests

No-double-counting tests

Outcome-revision tests

Lineage-inheritance tests

Drift-detection tests

Replay tests

Adversarial tests
```

---

# 124. Mathematical Unit Tests

Examples:

```text
Identical actions
→ distance 0
```

```text
Action beyond maximum configured distance
→ similarity weight 0
```

```text
One success with weight 1
→ alpha increases by 1
```

```text
One failure with weight 1
→ beta increases by 1
```

```text
Unknown outcome
→ no posterior update
```

```text
Outcome revision
→ old contribution removed
```

---

# 125. Property-Based Tests

Required properties:

```text
More identical successes
must not lower posterior mean.

More identical failures
must not raise posterior mean.

Increasing distance
must not increase similarity weight.

Expired evidence
must not gain recency weight.

Child agent evidence inheritance
must not exceed configured lineage factor.

The same observation
must never contribute twice.
```

---

# 126. Adversarial Tests

The benchmark must include:

```text
Global-score masking

Sparse-region overconfidence

Simulation evidence flooding

Duplicate observation injection

Outcome-label manipulation

Human-rescue laundering

Agent-version identity spoofing

Feature omission attacks

Region-boundary gaming

Many distant successes

Recent degradation hidden by old history

Outcome revision races

Future-data leakage
```

---

# 127. Simulation Evidence Flooding Attack

Attack:

```text
Generate 1,000,000 trivial simulation successes.
```

Goal:

```text
Artificially inflate competence.
```

Defenses:

```text
Source weighting

Effective sample size controls

Environment-specific caps

Similarity requirements

Production evidence requirements

Duplicate-task detection
```

The Autonomy Engine may require minimum production evidence for higher levels.

---

# 128. Region Boundary Gaming

Suppose amount bands are:

```text
₹0–₹5,000

₹5,001–₹25,000
```

An action at:

```text
₹5,001
```

should not become completely unrelated to:

```text
₹5,000
```

The neighbor model smooths hard region boundaries.

This is one reason for the hybrid architecture.

---

# 129. Benchmark Dataset

The V1 benchmark should generate refund cases across:

```text
Case types

Amount ranges

Domestic and international contexts

Evidence completeness levels

Evidence conflicts

Agent versions

Outcome distributions

Drift periods

Competence holes

Frontier regions
```

The benchmark must contain known ground-truth competence surfaces.

---

# 130. Synthetic Ground-Truth Topology

For research evaluation, create agents with controlled behavior.

Example:

```text
Synthetic Agent A

Duplicate-charge domestic:
95% success

Fraud dispute domestic:
60%

International:
50%

Above ₹1,00,000:
30%
```

Then test whether AEGIS reconstructs the topology.

Metrics:

```text
Probability calibration

Region ranking accuracy

Competence-hole detection

Frontier detection

Drift detection latency
```

---

# 131. Core Benchmark Metrics

Required metrics:

```text
Brier score

Log loss

Expected calibration error

Credible interval coverage

Competence-hole detection precision

Competence-hole detection recall

Drift detection delay

False degradation alert rate

Cold-start calibration

Neighbor retrieval relevance

Assessment latency
```

---

# 132. Calibration

If AEGIS predicts:

```text
80% competence
```

for 100 comparable actions, approximately:

```text
80
```

should succeed.

Calibration matters more than raw classification accuracy.

A badly calibrated 99% estimate is dangerous.

---

# 133. Research Question 1

Can contextual competence topology outperform:

```text
Global agent success rate
```

for autonomy decisions?

Expected hypothesis:

```text
Yes.
```

The benchmark must test it.

---

# 134. Research Question 2

Does hybrid:

```text
Region posterior
+
neighbor evidence
```

outperform:

```text
Fixed buckets only
```

and:

```text
Nearest neighbors only
```

?

This becomes a strong research contribution.

---

# 135. Research Question 3

Can competence frontiers support safer autonomy expansion?

Compare:

```text
Static autonomy
```

against:

```text
Topology-aware frontier exploration
```

Measure:

```text
Failure rate

Human review burden

Competence expansion speed
```

---

# 136. Research Question 4

How should competence transfer across agent versions?

Compare:

```text
Full reset

Full inheritance

Change-weighted inheritance
```

This is highly relevant to production AI agents.

---

# 137. Research Question 5

How quickly can AEGIS detect local degradation?

Compare:

```text
Global drift detection
```

against:

```text
Region-specific drift detection
```

A local regression may be invisible globally.

---

# 138. Dashboard Representation

The dashboard should eventually show:

```text
Agent competence map

Strong regions

Weak regions

Competence holes

Frontiers

Recent degradation

Evidence density
```

For V1, a 2D projection may use:

```text
X-axis:
Refund amount

Y-axis:
Case type

Cell:
Posterior competence

Overlay:
Evidence density
```

The UI is not part of this specification.

The underlying data requirements are.

---

# 139. Privacy Requirements

Competence history should avoid unnecessary sensitive duplication.

Store:

```text
Feature values required for competence
```

not:

```text
Entire customer documents
```

Use references to evidence where possible.

---

# 140. Security Requirements

The system must defend against:

```text
Fake success injection

Observation duplication

Outcome tampering

Agent identity spoofing

Feature manipulation

Timestamp manipulation

Simulation flooding

Version downgrade attacks

Assessment replay with future evidence
```

Competence observations and outcome revisions must be auditable.

---

# 141. Rejected Alternative — One Trust Score

Rejected because it hides:

```text
Local weakness

Sparse evidence

Context shift

Competence holes

Frontiers

Version changes
```

---

# 142. Rejected Alternative — Exact Match Statistics

Rejected because:

```text
Action space is continuous.

Useful neighboring evidence would be discarded.

Cold start would persist too long.
```

---

# 143. Rejected Alternative — Pure Vector Similarity

Rejected as the complete V1 model because:

```text
Hard to explain

Difficult to debug

Sensitive to embedding behavior

Weak statistical uncertainty semantics
```

Embeddings may assist.

They do not replace structured topology.

---

# 144. Rejected Alternative — Pure Fixed Buckets

Rejected because:

```text
Boundary discontinuities

Region sparsity

Poor generalization
```

---

# 145. Rejected Alternative — LLM Self-Confidence

Rejected:

```text
Agent says:

"I am 97% confident."
```

Self-reported confidence is not demonstrated competence.

It may be stored as a feature.

It cannot replace historical outcome evidence.

---

# 146. Rejected Alternative — Reward Model Score

A reward model may estimate quality.

But:

```text
Predicted quality
```

is not:

```text
Observed contextual competence
```

Reward models may assist outcome evaluation.

They do not replace competence history.

---

# 147. Rejected Alternative — Full Competence Reset on Every Version

Rejected because:

```text
Minor changes would destroy useful evidence.
```

---

# 148. Rejected Alternative — Full Competence Inheritance

Rejected because:

```text
Major model or prompt changes may invalidate history.
```

AEGIS uses explicit competence lineage.

---

# 149. V1 Implementation Boundary

The first production-grade implementation should include:

```text
Versioned refund competence feature schema

Deterministic feature extraction

Hierarchical fixed regions

Mixed-type distance

K-nearest relevant observations

Maximum distance threshold

Similarity weighting

Recency weighting

Evidence-source weighting

Agent-version lineage weighting

Beta posterior

Credible interval

Effective sample size

Evidence state

Extrapolation state

Simple regional drift detection

Immutable Competence Assessment
```

V1 should not require:

```text
Deep neural competence model

Graph neural network

Online reinforcement learning

Autonomous feature discovery

Complex Bayesian nonparametrics

Separate vector database
```

The architecture remains extensible.

---

# 150. Decisions Locked by SPEC-003

The following are now architectural commitments:

```text
1. AEGIS will not use one global trust score as its competence model.

2. Competence is estimated contextually for a specific agent and action.

3. The Canonical Action Model is the source of competence features.

4. Every action family has a versioned competence feature schema.

5. Competence space uses interpretable structured features first.

6. AEGIS uses a hybrid topology:
   regions plus similarity-weighted neighbors.

7. V1 regions are deterministic and hierarchical.

8. Neighbor evidence requires both K limits and maximum distance limits.

9. Evidence is weighted by source, similarity, recency, lineage, outcome certainty, and quality.

10. Region-level competence uses Bayesian Beta posteriors.

11. Competence assessments expose credible intervals.

12. Evidence mass and effective sample size are first-class outputs.

13. Unknown outcomes do not update competence.

14. Human rescue does not count as full agent success.

15. Simulation evidence is weaker than production evidence.

16. Agent-version changes use explicit competence lineage.

17. Major agent changes cannot inherit full competence automatically.

18. Sparse regions remain explicitly uncertain.

19. Low competence and uncertain competence are different states.

20. The topology must expose competence holes and frontiers.

21. Recent degradation must be detectable locally.

22. External failures must not automatically count as agent failures.

23. Outcome revisions must remove prior contributions before applying new ones.

24. One observation may not be double counted.

25. Every assessment must prevent future-data leakage.

26. Competence cannot create authority.

27. V1 uses PostgreSQL and may use pgvector if embeddings are added.

28. The critical competence path must not require an LLM.

29. The flagship domain remains customer refund operations.

30. The system will benchmark contextual topology against global-score baselines.
```

---

# 151. Final Competence Mental Model

The old way asks:

```text
Is this agent trustworthy?
```

AEGIS asks:

```text
WHICH exact agent version is acting?

WHAT exact kind of action is this?

WHERE does this action lie in competence space?

HOW much relevant experience exists nearby?

HOW similar is that experience?

HOW recent is it?

WAS it production, simulation, shadow, or human-assisted?

WHAT actually happened after those actions?

HOW certain are those outcome labels?

HAS the agent changed since then?

IS performance stable or degrading?

ARE we inside a known region?

NEAR the competence frontier?

OR far outside demonstrated experience?
```

The result is not:

```text
Agent trust:
94%
```

The result is closer to:

```text
For this agent,

in this specific region,

given this evidence,

the estimated probability of successful performance is:

0.93

with:

95% credible interval:
[0.88, 0.96]

effective sample size:
84

evidence state:
ESTABLISHED

extrapolation:
LOW

drift:
STABLE
```

That is a defensible competence claim.

---

# 152. Final Definition

The Contextual Competence Topology Engine is:

> A versioned, evidence-weighted, uncertainty-aware system for estimating what a specific AI agent has demonstrated it can do successfully in a specific region of action space, using interpretable competence regions, similarity-weighted historical experience, Bayesian posterior estimation, agent-version lineage, temporal decay, outcome attribution, and local drift detection.

Its central idea is:

\[
\boxed{
C(a,x)
\neq
C(a)
}
\]

An agent does not possess one universal competence score.

It possesses a changing landscape of demonstrated ability.

Some regions are:

```text
Strong
```

Some:

```text
Weak
```

Some:

```text
Sparse
```

Some:

```text
Degrading
```

Some:

```text
Entirely unknown
```

AEGIS maps that landscape.

That map becomes one of the foundations of adaptive autonomy.