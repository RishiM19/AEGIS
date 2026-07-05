# AEGIS TECHNICAL SPECIFICATION 004

## Novelty and Distribution Shift Engine

**Document ID:** AEGIS-SPEC-004  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Context Intelligence Architecture  
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-003  
**Primary Owner:** Novelty Intelligence System  
**Primary Runtime Component:** Novelty Engine  
**Consumers:** Uncertainty Engine, Consequence Engine, Adaptive Autonomy Engine, Contract Engine, Dashboard, Research Harness, Benchmark System

---

# 0. Purpose of This Specification

This specification defines how AEGIS determines whether a proposed action is:

```text
FAMILIAR

LOCALLY UNUSUAL

STRUCTURALLY NOVEL

COMPOSITIONALLY NOVEL

OUT OF DISTRIBUTION

PART OF A DISTRIBUTION SHIFT
```

The central problem is simple.

Suppose an agent has successfully completed:

```text
10,000 refunds
```

with:

```text
Amounts:
₹500–₹25,000

Environment:
Domestic

Case types:
Duplicate charge
Service failure

Evidence:
Mostly complete
```

The agent now proposes:

```text
Refund:
₹8,00,000

Environment:
International

Case type:
Fraud dispute

Evidence:
Conflicting

Payment provider:
Never previously used
```

SPEC-003 may still find:

```text
Broad historical competence:
HIGH
```

But SPEC-004 must detect:

```text
This exact action lies far outside
the agent's established experience distribution.
```

The Novelty Engine therefore answers:

> How unfamiliar is this exact action relative to the experience distribution relevant to this exact agent?

Formally:

\[
N(a,x)
=
f(
d_{local},
\rho_{local},
B,
R,
C,
S
)
\]

where:

```text
a
=
agent identity

x
=
current Canonical Action

d_local
=
distance from relevant historical experience

ρ_local
=
local evidence density

B
=
boundary novelty

R
=
range novelty

C
=
compositional novelty

S
=
distribution shift state
```

The output is not:

```text
SAFE
```

or:

```text
UNSAFE
```

The output is:

```text
How unfamiliar is this action?

Why is it unfamiliar?

Which dimensions caused the unfamiliarity?

Is the unfamiliarity local or global?

Is this one unusual case?

Or is the environment itself changing?
```

---

# 1. Foundational Principle

Competence and novelty are separate.

SPEC-003 estimates:

\[
C(a,x)
\]

SPEC-004 estimates:

\[
N(a,x)
\]

Possible combinations:

```text
HIGH COMPETENCE
LOW NOVELTY
```

The agent is operating in familiar territory.

```text
HIGH COMPETENCE
HIGH NOVELTY
```

The agent has historically performed well, but this case is unusual.

```text
LOW COMPETENCE
LOW NOVELTY
```

The agent is repeatedly poor at a familiar task.

```text
LOW COMPETENCE
HIGH NOVELTY
```

The agent is both weakly established and far outside known experience.

These conditions must not collapse into one score.

---

# 2. Why Competence Alone Is Insufficient

Consider:

```text
Agent history:

9,000 domestic refunds

Success rate:
98%
```

Current action:

```text
International refund
```

A broad competence model may infer:

```text
This is still a refund.
```

The Novelty Engine asks:

```text
Has this agent ever operated internationally?

How far is the current amount from historical values?

Has this combination of case type and environment appeared?

How dense is evidence near this action?

Does the action contain previously unseen values?

Is the entire incoming workload changing?
```

Competence measures demonstrated performance.

Novelty measures distance from demonstrated experience.

---

# 3. Why Nearest-Neighbor Distance Alone Fails

A naive novelty system may calculate:

```text
Distance to nearest historical action:
0.12
```

and conclude:

```text
Low novelty.
```

This can fail.

Example:

```text
One historical action exists nearby.

Everything else is far away.
```

The nearest action may be an isolated accident.

The local region is still sparse.

Another case:

```text
Nearest neighbors are individually similar.

But the exact combination of features
has never occurred.
```

Therefore novelty requires more than nearest distance.

AEGIS must evaluate:

```text
Nearest distance

Neighbor distance distribution

Local density

Feature range violations

Unseen categorical values

Novel combinations

Region occupancy

Historical support

Population shift
```

---

# 4. Why Global Outlier Detection Also Fails

Suppose most refund actions are:

```text
₹500–₹5,000
```

An action for:

```text
₹20,000
```

may be globally unusual.

But the agent may have:

```text
500 successful ₹15,000–₹25,000 refunds.
```

For this agent:

```text
Low novelty.
```

Therefore novelty is primarily:

\[
Agent\text{-}Relative
\]

not merely:

\[
Population\text{-}Relative
\]

However, population-level shift remains useful.

SPEC-004 therefore distinguishes:

```text
AGENT NOVELTY

SYSTEM NOVELTY

ENVIRONMENT SHIFT
```

---

# 5. Novelty System Responsibilities

The Novelty Intelligence System owns:

```text
1. Define versioned novelty feature spaces.

2. Reuse compatible competence features.

3. Build historical reference distributions.

4. Measure local action unfamiliarity.

5. Detect unseen values.

6. Detect out-of-range values.

7. Detect novel feature combinations.

8. Measure local evidence density.

9. Detect boundary crossing.

10. Detect agent-specific out-of-distribution actions.

11. Detect workload distribution shift.

12. Identify the dimensions causing novelty.

13. Produce immutable Novelty Assessments.
```

---

# 6. Novelty System Non-Responsibilities

The Novelty Engine does not determine:

```text
Whether the action is authorized

Whether the agent is competent

Whether source evidence is trustworthy

How severe failure would be

Whether the action is reversible

How much autonomy budget remains

The final autonomy level
```

Novelty answers one narrow question:

> How unfamiliar is this action relative to the relevant historical experience distribution?

---

# 7. Novelty System Invariants

## NOV-INV-001 — Novelty Is Contextual

No single global novelty score may represent every action family.

---

## NOV-INV-002 — Novelty Is Agent-Relative

An action familiar to Agent A may be novel to Agent B.

---

## NOV-INV-003 — Unseen Does Not Mean Dangerous

Novelty is not consequence.

---

## NOV-INV-004 — Familiar Does Not Mean Safe

A familiar action may still be high consequence.

---

## NOV-INV-005 — One Nearby Observation Does Not Establish Familiarity

Local density matters.

---

## NOV-INV-006 — Large Historical Volume Does Not Eliminate Local Novelty

Ten thousand distant observations do not make a sparse local region familiar.

---

## NOV-INV-007 — Novel Combinations Matter

Previously seen individual values may form an unseen combination.

---

## NOV-INV-008 — Unknown Values Must Not Be Treated as Familiar

```text
UNKNOWN ≠ KNOWN
```

---

## NOV-INV-009 — Feature Scaling Must Be Versioned

Changing normalization changes novelty geometry.

---

## NOV-INV-010 — Distribution Shift Is Not Individual Novelty

One unusual action is not automatically a changing environment.

---

## NOV-INV-011 — Historical Reference Windows Must Be Explicit

The system must know which history defines normality.

---

## NOV-INV-012 — Novelty Must Be Explainable

The engine must identify which dimensions created novelty.

---

## NOV-INV-013 — Future Data Leakage Is Prohibited

Only evidence available before the assessment timestamp may define familiarity.

---

## NOV-INV-014 — Novelty Assessment Must Be Reproducible

The same:

```text
Action version

Feature vector

Reference snapshot

Distance configuration

Density configuration

Shift detector version
```

must produce the same assessment.

---

# 8. Core Domain Objects

SPEC-004 defines:

```text
Novelty Feature Schema

Novelty Feature Vector

Reference Distribution

Local Neighborhood

Feature Novelty Assessment

Compositional Novelty Assessment

Boundary Assessment

Density Assessment

Distribution Shift Signal

Novelty Assessment
```

---

# 9. Novelty Feature Schema

Conceptual schema:

```typescript
interface NoveltyFeatureSchema {
  schemaId: string;

  actionType: string;

  version: number;

  features: NoveltyFeatureDefinition[];

  distanceProfileId: string;

  densityProfileId: string;

  compositionProfileId: string;

  createdAt: Timestamp;
}
```

SPEC-004 should reuse SPEC-003 competence features where appropriate.

It must not create a second inconsistent representation of the same action.

---

# 10. Competence Features vs Novelty Features

Some dimensions matter to both systems.

Example:

```text
case_type

amount

payment_environment

evidence_completeness

evidence_conflict
```

Some may matter mainly to novelty.

Example:

```text
tool_version

provider

jurisdiction

action sequence position

new target type
```

Some may matter mainly to competence.

Example:

```text
historical intervention pattern
```

Therefore:

\[
FeatureSpace_{novelty}
\neq
FeatureSpace_{competence}
\]

but:

\[
FeatureSpace_{novelty}
\cap
FeatureSpace_{competence}
\neq
\emptyset
\]

---

# 11. Novelty Feature Definition

Conceptual schema:

```typescript
interface NoveltyFeatureDefinition {
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

  noveltyRoles:
    | "DISTANCE"
    | "RANGE"
    | "CATEGORY"
    | "COMPOSITION"
    | "SHIFT"
    | "MULTIPLE";

  normalizationRule?: string;

  missingValuePolicy: string;

  importanceWeight: number;
}
```

---

# 12. Novelty Feature Vector

Conceptual schema:

```typescript
interface NoveltyFeatureVector {
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
action_type:
ISSUE_CUSTOMER_REFUND

case_type:
FRAUD_DISPUTE

amount_minor:
80000000

payment_environment:
INTERNATIONAL

evidence_completeness:
PARTIAL

evidence_conflict:
MAJOR

provider:
NEW_PROVIDER_X

prior_refund_attempts:
2
```

---

# 13. Reference Distribution

Novelty requires a definition of:

```text
What counts as normal?
```

A Reference Distribution is the historical experience set against which the current action is compared.

Conceptual schema:

```typescript
interface ReferenceDistribution {
  referenceId: string;

  agentId: string;

  agentVersionScope: string[];

  actionType: string;

  observationCutoff: Timestamp;

  referenceWindow: ReferenceWindow;

  inclusionPolicyId: string;

  featureSchemaVersion: number;

  snapshotFingerprint: string;

  createdAt: Timestamp;
}
```

---

# 14. Reference Distribution Hierarchy

AEGIS may use multiple reference levels:

```text
LEVEL 1

Current agent version
```

```text
LEVEL 2

Compatible agent lineage
```

```text
LEVEL 3

Agent family
```

```text
LEVEL 4

System population
```

Primary novelty should be measured against:

```text
Current agent
+
valid inherited lineage
```

Population references are secondary diagnostics.

---

# 15. Why Reference Selection Matters

Suppose:

```text
Agent A:
Specialized domestic refund agent
```

System population:

```text
Includes international specialist agents.
```

An international refund may be:

```text
Common globally
```

but:

```text
Novel for Agent A
```

AEGIS must preserve that distinction.

---

# 16. Reference Window

Historical normality changes.

Possible windows:

```text
ALL VALID HISTORY

ROLLING 30 DAYS

ROLLING 90 DAYS

SINCE AGENT VERSION

WEIGHTED DECAY WINDOW
```

V1 should use:

```text
Valid lineage history
+
explicit recency weighting
```

for action novelty.

Distribution shift detection should use separate recent and baseline windows.

---

# 17. Observation Eligibility for Novelty

An observation may belong to the novelty reference set even if its outcome was:

```text
SUCCESS

FAILURE

PARTIAL SUCCESS
```

Novelty asks:

```text
Has the agent encountered this?
```

not:

```text
Did the agent succeed?
```

Therefore outcome is not the primary inclusion criterion.

However, corrupted or invalid actions must be excluded.

---

# 18. Encountered vs Executed Experience

AEGIS distinguishes:

```text
PROPOSED

ASSESSED

SIMULATED

SHADOWED

EXECUTED
```

An action seen only in simulation may reduce novelty somewhat.

But it should not necessarily create the same familiarity as production execution.

Therefore reference observations receive experience-strength weights.

---

# 19. Experience Strength

Illustrative ordering:

```text
Production executed:
1.00

Production human approved:
0.90

Shadow evaluated:
0.60

Staging:
0.50

Simulation:
0.35

Proposal only:
0.10
```

These weights influence density.

They do not directly determine competence.

---

# 20. Novelty Decomposition

The overall novelty assessment is decomposed into:

```text
DISTANCE NOVELTY

DENSITY NOVELTY

RANGE NOVELTY

CATEGORY NOVELTY

COMPOSITIONAL NOVELTY

BOUNDARY NOVELTY

SEQUENCE NOVELTY

SHIFT CONTEXT
```

This decomposition is a core architectural decision.

AEGIS must not produce only one opaque anomaly score.

---

# 21. Distance Novelty

Distance novelty asks:

> How far is this action from relevant historical experience?

Let:

\[
d_k(x)
\]

be the distance to the \(k\)-th nearest relevant historical observation.

Possible normalized score:

\[
N_{distance}
=
g(d_k)
\]

where:

\[
0 \leq N_{distance} \leq 1
\]

and:

```text
0
=
highly familiar

1
=
extremely distant
```

---

# 22. Why Use More Than One Neighbor

Distance to the nearest neighbor can be unstable.

Recommended V1 statistics:

```text
Nearest-neighbor distance

Mean distance to K neighbors

Median distance to K neighbors

Distance to K-th neighbor
```

The K-th neighbor distance is especially useful for local density.

---

# 23. Distance Function Reuse

SPEC-004 should reuse compatible mixed-type distance infrastructure from SPEC-003.

This includes:

```text
Categorical distance

Continuous distance

Ordinal distance

Boolean distance

Missingness penalties

Feature importance weights
```

But the weights may differ.

A feature may be weakly predictive of competence yet highly important for novelty.

---

# 24. Distance Novelty Example

Historical actions:

```text
₹17,000

₹18,000

₹19,500

₹21,000
```

Current action:

```text
₹18,400
```

Distance novelty:

```text
LOW
```

Current action:

```text
₹8,00,000
```

Distance novelty:

```text
HIGH
```

assuming other features are equal.

---

# 25. Density Novelty

Density novelty asks:

> How much relevant historical support exists around this action?

A current action may have one close neighbor but still occupy a sparse region.

Conceptually:

\[
\rho(x)
=
\sum_{i \in N(x)}
w_i K(d_i)
\]

where:

```text
w_i
=
experience strength

K(d_i)
=
distance kernel
```

Novelty increases as local density decreases.

---

# 26. Density Score

Possible normalized form:

\[
N_{density}
=
1-
\frac{\rho(x)}
{\rho(x)+c}
\]

where:

```text
c
=
calibration constant
```

The exact transformation must be benchmarked.

V1 must expose raw density and normalized density novelty.

---

# 27. Density Example

Case A:

```text
20 highly similar historical actions
```

Result:

```text
LOW DENSITY NOVELTY
```

Case B:

```text
1 similar historical action
```

Result:

```text
HIGHER DENSITY NOVELTY
```

even if nearest-neighbor distance is identical.

---

# 28. Range Novelty

Range novelty detects values outside historically observed numerical ranges.

Example:

Historical refund amounts:

```text
Minimum:
₹500

Maximum:
₹25,000
```

Current:

```text
₹8,00,000
```

This is:

```text
OUT-OF-RANGE
```

But raw minimum and maximum are sensitive to outliers.

Therefore V1 should track:

```text
Observed minimum

Observed maximum

Robust lower percentile

Robust upper percentile

Median

Interquartile range
```

---

# 29. Robust Range Novelty

Recommended interpretation:

```text
Inside central historical range:
LOW

Outside robust range but inside observed extremes:
MODERATE

Outside observed range:
HIGH
```

Example:

```text
Historical 99th percentile:
₹23,000

Historical maximum:
₹40,000

Current:
₹30,000
```

The value is unusual but not unprecedented.

---

# 30. Normalized Range Exceedance

For upper-bound violation:

\[
E_{upper}
=
\frac{x-U}
{s}
\]

where:

```text
U
=
historical upper reference boundary

s
=
robust scale
```

This distinguishes:

```text
Barely outside range
```

from:

```text
Orders of magnitude outside range
```

---

# 31. Category Novelty

Category novelty detects unseen categorical values.

Example history:

```text
Payment environment:

DOMESTIC
```

Current:

```text
INTERNATIONAL
```

Result:

```text
UNSEEN CATEGORY
```

Another:

```text
Provider:
NEW_PROVIDER_X
```

if never encountered:

```text
CATEGORY NOVELTY
```

---

# 32. Rare Category vs Unseen Category

These are different.

```text
UNSEEN

Historical count:
0
```

```text
RARE

Historical count:
2
```

```text
COMMON

Historical count:
2,000
```

V1 should expose:

```text
Historical count

Weighted count

Historical frequency
```

for categorical values.

---

# 33. Compositional Novelty

This is one of the most important parts of SPEC-004.

Suppose the agent has seen:

```text
INTERNATIONAL transactions
```

and:

```text
FRAUD_DISPUTE cases
```

and:

```text
₹1,00,000+ refunds
```

But never:

```text
INTERNATIONAL
+
FRAUD_DISPUTE
+
₹1,00,000+
```

Each feature value is familiar.

The combination is novel.

This is:

```text
COMPOSITIONAL NOVELTY
```

---

# 34. Why Compositional Novelty Matters

Agent failures often occur not because one variable is new.

They occur because familiar factors interact in a new way.

Examples:

```text
Known tool
+
known target
+
new sequence
```

```text
Known jurisdiction
+
known action
+
unseen amount range
```

```text
Known evidence source
+
known case type
+
previously unseen contradiction
```

A feature-by-feature novelty detector would miss this.

---

# 35. V1 Composition Model

V1 should track:

```text
PAIRWISE FEATURE COMBINATIONS
```

for high-importance dimensions.

Example pairs:

```text
case_type × payment_environment

case_type × amount_band

payment_environment × provider

evidence_completeness × evidence_conflict
```

Optional selected triples:

```text
case_type
×
payment_environment
×
amount_band
```

V1 should not track every possible combination.

That would create combinatorial explosion.

---

# 36. Composition Profile

Conceptual schema:

```typescript
interface CompositionProfile {
  profileId: string;

  schemaId: string;

  version: number;

  trackedPairs: FeaturePair[];

  trackedTriples: FeatureTriple[];

  minimumSupportThreshold: number;

  createdAt: Timestamp;
}
```

---

# 37. Compositional Support

For a combination \(c\):

```text
support(c)
=
weighted number of historical observations
matching the combination
```

Novelty increases when support decreases.

Possible states:

```text
ESTABLISHED

RARE

UNSEEN
```

---

# 38. Boundary Novelty

Boundary novelty asks:

> Is this action crossing a historically meaningful edge of demonstrated experience?

Example:

```text
Strong experience:
₹0–₹25,000

Weak experience:
₹25,001–₹50,000

No experience:
Above ₹50,000
```

Current:

```text
₹24,500
```

Inside established region.

Current:

```text
₹27,000
```

Near frontier.

Current:

```text
₹5,00,000
```

Far beyond frontier.

---

# 39. Boundary Types

AEGIS should detect:

```text
NUMERICAL FRONTIER

CATEGORICAL FRONTIER

REGION FRONTIER

AGENT-VERSION FRONTIER

TOOL FRONTIER

SEQUENCE FRONTIER
```

---

# 40. Frontier Distance

For continuous features:

\[
D_{frontier}
=
\frac{|x-b|}
{s}
\]

where:

```text
b
=
nearest established boundary

s
=
feature scale
```

The result helps distinguish:

```text
Near-frontier exploration
```

from:

```text
Extreme extrapolation
```

---

# 41. Novelty and Competence Frontier Relationship

SPEC-003 identifies competence frontiers.

SPEC-004 measures the current action's relationship to them.

Possible states:

```text
INSIDE_ESTABLISHED_REGION

NEAR_FRONTIER

CROSSING_FRONTIER

BEYOND_FRONTIER

FAR_OUTSIDE_FRONTIER
```

This information will become important in SPEC-008.

---

# 42. Sequence Novelty

Autonomous agents often perform multi-step workflows.

Each individual action may be familiar.

The sequence may be novel.

Example history:

```text
Read case

Read transaction

Issue refund

Update case
```

Current sequence:

```text
Issue refund

Delete case

Issue second refund
```

Each tool call may individually exist in history.

The sequence is unusual.

---

# 43. Sequence Representation

Conceptually:

```text
READ_CASE
→
READ_TRANSACTION
→
ISSUE_REFUND
→
UPDATE_CASE
```

V1 may track:

```text
Previous action type

Current action type

Objective-relative step number
```

Later versions may support:

```text
N-gram sequence models

Workflow graphs

Trajectory embeddings
```

---

# 44. V1 Sequence Novelty

For current action \(A_t\), evaluate:

```text
P(
A_t
|
A_{t-1},
objective_type
)
```

Rare transitions increase sequence novelty.

Example:

```text
READ_CASE
→
ISSUE_REFUND
```

may be common.

```text
SEND_EMAIL
→
DELETE_CUSTOMER
```

may be unseen.

---

# 45. Sequence Novelty Is Not Authority

An unusual sequence may still be authorized.

An ordinary sequence may be unauthorized.

SPEC-002 remains the authority boundary.

---

# 46. Structural Novelty

Structural novelty detects changes in the action itself.

Examples:

```text
Previously unseen action type

Previously unseen tool

New parameter field

New target class

New dependency type

New side-effect class
```

This is especially important after system updates.

---

# 47. Tool Novelty

Suppose the agent historically uses:

```text
stripe.refund.create
```

Current action uses:

```text
new_provider.refund.execute
```

Semantic capability may be the same.

Authority may still be valid.

But execution behavior is unfamiliar.

The Novelty Engine should emit:

```text
TOOL_NOVELTY
```

---

# 48. Schema Novelty

Suppose a tool introduces:

```text
force_settlement = true
```

and the agent has never encountered that parameter.

This is not ordinary value novelty.

It is structural schema novelty.

The CAM must preserve tool and schema version information.

---

# 49. Unknown Feature Novelty

Unknown values require special handling.

Example:

```text
payment_environment:
UNKNOWN
```

This should not be scored as:

```text
Familiar because UNKNOWN appeared often.
```

Repeated missingness is not equivalent to understanding.

AEGIS should expose:

```text
INFORMATION NOVELTY
```

or:

```text
UNKNOWN_CONTEXT
```

separately.

---

# 50. Missingness Shift

Suppose historically:

```text
2% of cases
have unknown payment environment.
```

Recently:

```text
45%
```

This may indicate:

```text
Upstream data failure

Integration change

New workload

Attack

Schema regression
```

This is a distribution shift.

---

# 51. Overall Novelty Score

AEGIS may produce a normalized score:

\[
N(x) \in [0,1]
\]

where:

```text
0
=
highly familiar

1
=
extremely novel
```

But the score must be decomposable.

Conceptual V1 combination:

\[
N(x)
=
1-
\prod_j
(1-w_jN_j)
\]

where:

```text
N_j
=
novelty component

w_j
=
component importance
```

This form ensures one extreme novelty component can materially affect the result.

Exact aggregation must be benchmarked.

---

# 52. Why Not Simple Average

Suppose:

```text
Distance novelty:
0.1

Density novelty:
0.1

Range novelty:
1.0

Category novelty:
0.0

Composition novelty:
0.0
```

Simple average:

```text
0.24
```

may hide a severe out-of-range action.

Therefore extreme components must remain visible.

The Autonomy Engine must receive both:

```text
Overall novelty

Component novelty
```

---

# 53. Hard Novelty Flags

Some novelty conditions should create explicit flags.

Examples:

```text
UNSEEN_ACTION_TYPE

UNSEEN_TOOL

UNSEEN_TARGET_CLASS

UNSEEN_CRITICAL_CATEGORY

EXTREME_RANGE_EXCEEDANCE

UNSEEN_CRITICAL_COMBINATION

FAR_BEYOND_COMPETENCE_FRONTIER
```

These are not automatic denials.

They are strong autonomy signals.

---

# 54. Novelty Level

Recommended classification:

```typescript
type NoveltyLevel =
  | "FAMILIAR"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "EXTREME";
```

The level is derived from:

```text
Overall score

Critical novelty flags

Reference quality
```

---

# 55. FAMILIAR

Characteristics:

```text
Dense local evidence

No unseen critical values

Inside established ranges

Known feature combinations

Known sequence pattern
```

---

# 56. LOW

Characteristics:

```text
Slightly unusual

Still well supported locally

No major frontier crossing
```

---

# 57. MODERATE

Characteristics:

```text
Sparse local evidence

Rare combinations

Near competence frontier

Some unusual values
```

---

# 58. HIGH

Characteristics:

```text
Strong local sparsity

Unseen combinations

Major range exceedance

Frontier crossing

New tool or context
```

---

# 59. EXTREME

Characteristics:

```text
Far outside historical experience

Multiple unseen critical dimensions

No meaningful neighbors

New action structure

Extreme range violation
```

---

# 60. Reference Quality

Novelty itself may be uncertain.

Suppose the agent has:

```text
Only 5 historical actions.
```

Can AEGIS confidently say a new action is novel?

It can say:

```text
The action is unsupported.
```

But the historical distribution is poorly established.

Therefore the assessment must expose:

```text
REFERENCE_QUALITY
```

Recommended states:

```text
INSUFFICIENT

WEAK

ADEQUATE

STRONG
```

---

# 61. Cold Start Novelty

A new agent with no history creates a special case.

The engine must not say:

```text
Novelty:
0
```

or confidently:

```text
Novelty:
1
```

The correct state is:

```text
NOVELTY_STATE:
UNESTABLISHED_REFERENCE
```

For autonomy purposes, this still represents lack of demonstrated familiarity.

But mathematically it is distinct from proven out-of-distribution behavior.

---

# 62. Unsupported vs Novel

This distinction is important.

```text
UNSUPPORTED
```

means:

```text
Not enough reference data exists.
```

```text
NOVEL
```

means:

```text
A meaningful reference distribution exists,
and the action differs strongly from it.
```

These should not be conflated.

---

# 63. Novelty Assessment

Conceptual output:

```typescript
interface NoveltyAssessment {
  assessmentId: string;

  actionId: string;

  actionVersion: number;

  agentId: string;

  agentVersion: string;

  featureVectorId: string;

  referenceDistributionId: string;

  noveltyScore: number;

  noveltyLevel: NoveltyLevel;

  distanceNovelty: number;

  densityNovelty: number;

  rangeNovelty: number;

  categoryNovelty: number;

  compositionalNovelty: number;

  boundaryNovelty: number;

  sequenceNovelty?: number;

  structuralNovelty?: number;

  nearestNeighborDistance?: number;

  kthNeighborDistance?: number;

  localDensity?: number;

  referenceQuality:
    | "INSUFFICIENT"
    | "WEAK"
    | "ADEQUATE"
    | "STRONG";

  frontierRelationship:
    | "INSIDE_ESTABLISHED_REGION"
    | "NEAR_FRONTIER"
    | "CROSSING_FRONTIER"
    | "BEYOND_FRONTIER"
    | "FAR_OUTSIDE_FRONTIER"
    | "UNKNOWN";

  criticalNoveltyFlags: string[];

  topNovelDimensions: NovelDimension[];

  shiftContext: ShiftContext;

  reasonCodes: string[];

  snapshotReference: string;

  engineVersion: string;

  createdAt: Timestamp;
}
```

---

# 64. Novel Dimension Explanation

Conceptual schema:

```typescript
interface NovelDimension {
  featureName: string;

  noveltyType:
    | "DISTANCE"
    | "RANGE"
    | "CATEGORY"
    | "COMPOSITION"
    | "BOUNDARY"
    | "STRUCTURAL";

  score: number;

  currentValue: unknown;

  historicalContext: unknown;

  explanationCode: string;
}
```

Example:

```text
Feature:
amount_minor

Current:
₹8,00,000

Historical 99th percentile:
₹23,000

Historical maximum:
₹40,000

Novelty:
EXTREME_RANGE_EXCEEDANCE
```

---

# 65. Explainability Requirement

The engine must be able to say:

```text
Novelty is HIGH because:

1. Refund amount is 20× above the historical maximum.

2. INTERNATIONAL × FRAUD_DISPUTE
   has never been observed.

3. The payment provider is unseen.

4. Local neighborhood density is near zero.
```

It must not return only:

```text
Anomaly score:
0.91
```

---

# 66. Distribution Shift

Individual novelty asks:

> Is this action unusual?

Distribution shift asks:

> Is the stream of actions changing?

This distinction is fundamental.

---

# 67. Distribution Shift Examples

Example A:

```text
One unusual international refund.
```

Likely:

```text
Individual novelty
```

Example B:

```text
40% of today's cases are international.

Historical baseline:
2%.
```

Possible:

```text
Distribution shift
```

---

# 68. Shift Types

AEGIS distinguishes:

```text
COVARIATE SHIFT

CATEGORY FREQUENCY SHIFT

RANGE SHIFT

MISSINGNESS SHIFT

COMPOSITION SHIFT

SEQUENCE SHIFT

OUTCOME SHIFT
```

Outcome shift overlaps with SPEC-003 drift.

SPEC-004 focuses primarily on input distribution.

---

# 69. Covariate Shift

The distribution of input features changes.

Example:

```text
Historical median refund:
₹2,000

Recent median:
₹18,000
```

The agent may still be competent.

But the operating environment has changed.

---

# 70. Category Frequency Shift

Historical:

```text
FRAUD_DISPUTE:
5%
```

Recent:

```text
FRAUD_DISPUTE:
45%
```

This may create a new workload regime.

---

# 71. Composition Shift

Individual feature frequencies may remain stable.

But combinations may change.

Example:

```text
INTERNATIONAL:
10%

FRAUD_DISPUTE:
10%
```

Historically they rarely co-occurred.

Recently:

```text
INTERNATIONAL
+
FRAUD_DISPUTE
```

becomes common.

Marginal statistics may miss this.

Composition monitoring detects it.

---

# 72. Shift Windows

V1 uses:

```text
BASELINE WINDOW

RECENT WINDOW
```

Example:

```text
Baseline:
Previous 90 days

Recent:
Previous 24 hours
```

Exact windows are action-family configuration.

---

# 73. Minimum Sample Requirements

The engine must not declare shift from tiny samples.

Example:

```text
Recent window:
2 actions
```

One unusual action means:

```text
50%
```

but this is statistically weak.

Every detector requires:

```text
Minimum recent sample count

Minimum baseline sample count
```

---

# 74. V1 Shift Detection Methods

Use interpretable methods.

For categorical features:

```text
Jensen-Shannon divergence

Population Stability Index

Chi-square test where appropriate
```

For continuous features:

```text
Kolmogorov-Smirnov statistic

Wasserstein distance

Quantile movement
```

For missingness:

```text
Rate difference
```

For combinations:

```text
Support distribution divergence
```

---

# 75. Why Multiple Shift Metrics

No single metric works equally well for:

```text
Continuous features

Categorical features

Sparse combinations

Missingness
```

AEGIS should use feature-type-appropriate detectors.

---

# 76. Jensen-Shannon Divergence

For categorical distributions:

\[
JSD(P,Q)
=
\frac{1}{2}KL(P\|M)
+
\frac{1}{2}KL(Q\|M)
\]

where:

\[
M
=
\frac{P+Q}{2}
\]

Advantages:

```text
Symmetric

Bounded

Interpretable

Handles distribution comparison
```

---

# 77. Wasserstein Distance

For continuous features:

\[
W(P,Q)
\]

measures the amount of distribution movement.

Useful for:

```text
Refund amount

Case age

Evidence counts
```

It can capture shifts that mean-only comparisons miss.

---

# 78. Population Stability Index

PSI may be useful for dashboard diagnostics.

But V1 should not rely on PSI alone.

It is sensitive to:

```text
Bin definitions

Sample size

Sparse categories
```

---

# 79. Shift Signal

Conceptual schema:

```typescript
interface DistributionShiftSignal {
  signalId: string;

  agentId?: string;

  actionType: string;

  featureName?: string;

  shiftType:
    | "COVARIATE"
    | "CATEGORY_FREQUENCY"
    | "RANGE"
    | "MISSINGNESS"
    | "COMPOSITION"
    | "SEQUENCE";

  severity:
    | "NONE"
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "CRITICAL";

  baselineWindow: TimeWindow;

  recentWindow: TimeWindow;

  baselineSampleSize: number;

  recentSampleSize: number;

  detectorType: string;

  statistic: number;

  threshold: number;

  confidence: number;

  reasonCodes: string[];

  detectorVersion: string;

  createdAt: Timestamp;
}
```

---

# 80. Shift Severity

Recommended states:

```text
NONE

LOW

MODERATE

HIGH

CRITICAL
```

Severity depends on:

```text
Magnitude

Persistence

Number of affected dimensions

Criticality of affected dimensions

Sample strength
```

---

# 81. Persistence Requirement

A transient spike should not always create a critical shift alert.

V1 should support:

```text
Single-window signal

Persistent signal
```

Example:

```text
HIGH shift
for 3 consecutive windows
```

is stronger than:

```text
HIGH shift
for one window
```

---

# 82. Shift Context in Action Assessment

The current action's novelty assessment should include:

```text
Is the action individually novel?

Is it part of a broader emerging shift?
```

Example:

```text
Action novelty:
MODERATE

Environment shift:
HIGH
```

This means the action is not isolated.

The whole workload may be changing.

---

# 83. Novelty During Shift

Suppose international cases become common.

Initially:

```text
High novelty
```

Over time:

```text
Novelty decreases
```

as the reference distribution changes.

But competence does not automatically increase.

This is critical.

The system may reach:

```text
LOW NOVELTY

LOW COMPETENCE
```

because the agent repeatedly encounters the new workload but still performs poorly.

Familiarity is not mastery.

---

# 84. Shift Does Not Rewrite History Immediately

The reference distribution should not adapt so quickly that anomalies disappear instantly.

Otherwise:

```text
Attack begins.

System sees attack repeatedly.

Attack becomes "normal."
```

Therefore reference updates require controlled adaptation.

---

# 85. Reference Adaptation Policy

V1 should maintain:

```text
STABLE BASELINE

RECENT WINDOW
```

rather than one rapidly moving reference.

A new regime becomes baseline only through explicit lifecycle rules.

---

# 86. Poisoning Resistance

Attack:

```text
Repeatedly inject unusual actions
until they appear familiar.
```

This is:

```text
NOVELTY REFERENCE POISONING
```

Defenses:

```text
Rate-limited reference admission

Source quality weighting

Quarantine periods

Separate recent and stable baselines

Outlier admission controls

Auditability
```

---

# 87. Reference Admission

Not every observed action should immediately update the stable reference.

Possible states:

```text
PENDING

RECENT_ONLY

STABLE_REFERENCE

EXCLUDED
```

Production actions may first enter:

```text
RECENT_ONLY
```

before becoming part of long-term normality.

---

# 88. Quarantine Window

Highly novel observations may remain outside the stable baseline temporarily.

Example:

```text
Novelty:
EXTREME
```

Action is observed.

It should not immediately make the next identical action:

```text
FAMILIAR
```

V1 should support a configurable quarantine period.

---

# 89. Duplicate Novelty Flooding

Attack:

```text
Send same unusual action 10,000 times.
```

Without protection:

```text
Local density becomes high.
```

Defenses:

```text
Duplicate fingerprint detection

Rate-aware density

Source diversity

Objective diversity

Temporal burst detection
```

---

# 90. Density Must Consider Independence

Ten thousand identical actions from one burst are not equivalent to:

```text
Ten thousand independent experiences
across time and objectives.
```

V1 should expose:

```text
Raw local count

Weighted local density

Unique action fingerprints

Unique objectives

Temporal spread
```

---

# 91. Novelty Attack Surface

The engine must defend against:

```text
Feature omission

Value normalization attacks

Boundary gaming

Reference poisoning

Duplicate flooding

Agent identity switching

Schema downgrade

Timestamp manipulation

Population-reference laundering

Unknown-value laundering
```

---

# 92. Boundary Gaming Attack

Suppose a threshold is:

```text
₹25,000
```

Attacker repeatedly submits:

```text
₹24,999
```

to create familiarity.

Then gradually increases:

```text
₹25,500

₹26,000

₹27,000
```

This is gradual frontier poisoning.

The engine must preserve:

```text
Historical frontier movement

Rate of frontier expansion

Evidence source quality
```

---

# 93. Frontier Expansion Velocity

Conceptually:

\[
V_f
=
\frac{\Delta Frontier}{\Delta t}
\]

Rapid movement may be suspicious.

Example:

```text
Established maximum:

Day 1:
₹25,000

Day 2:
₹50,000

Day 3:
₹2,00,000
```

The frontier is expanding unusually fast.

This should emit a signal.

---

# 94. Agent Identity Switching Attack

An actor may attempt:

```text
New agent ID
```

to avoid historical novelty context.

SPEC-003 lineage and SPEC-004 reference lineage must cooperate.

A new display identifier must not automatically create a clean novelty state.

---

# 95. Structural Change and Reference Reset

A major agent version change creates a difficult question.

Should historical familiarity transfer?

Recommended rule:

```text
Action-space familiarity
may transfer more strongly
than competence.
```

Why?

A new model may still have encountered the same operational environment through inherited system history.

But agent-specific behavioral familiarity may differ.

Therefore SPEC-004 supports:

```text
ENVIRONMENT REFERENCE

AGENT EXPERIENCE REFERENCE
```

as separate concepts.

---

# 96. Environment Novelty vs Agent Novelty

Example:

```text
International fraud refunds
are common in the system.
```

But:

```text
Agent A has never handled one.
```

Result:

```text
Environment novelty:
LOW

Agent novelty:
HIGH
```

This is useful.

It tells AEGIS:

```text
The problem is known to the organization,
but unfamiliar to this agent.
```

---

# 97. Cross-Agent Evidence

Cross-agent evidence must not erase agent novelty.

But it may support:

```text
System novelty context

Known-case retrieval

Human routing

Specialist-agent selection
```

The Novelty Assessment may therefore include:

```text
Agent-relative novelty

Population-relative novelty
```

Primary autonomy reasoning should prioritize agent-relative novelty.

---

# 98. Specialist Routing Opportunity

Suppose:

```text
Agent A novelty:
HIGH
```

but:

```text
Agent B novelty:
LOW
```

and:

```text
Agent B competence:
STRONG
```

Later AEGIS may route the action to Agent B.

This is not part of SPEC-004 execution logic.

But the architecture must preserve the information required.

---

# 99. Novelty Assessment Pipeline

The exact conceptual order is:

```text
STEP 1

Receive immutable Canonical Action.
```

```text
STEP 2

Resolve exact agent identity and lineage.
```

```text
STEP 3

Load novelty feature schema.
```

```text
STEP 4

Extract novelty feature vector.
```

```text
STEP 5

Resolve agent reference distribution.
```

```text
STEP 6

Assess reference quality.
```

```text
STEP 7

Retrieve relevant historical neighbors.
```

```text
STEP 8

Calculate distance novelty.
```

```text
STEP 9

Calculate local density novelty.
```

```text
STEP 10

Evaluate continuous range novelty.
```

```text
STEP 11

Evaluate categorical novelty.
```

```text
STEP 12

Evaluate compositional novelty.
```

```text
STEP 13

Evaluate competence-frontier relationship.
```

```text
STEP 14

Evaluate sequence novelty.
```

```text
STEP 15

Evaluate structural novelty.
```

```text
STEP 16

Load active distribution shift signals.
```

```text
STEP 17

Aggregate novelty components.
```

```text
STEP 18

Apply critical novelty flags.
```

```text
STEP 19

Classify novelty level.
```

```text
STEP 20

Generate dimension-level explanations.
```

```text
STEP 21

Persist immutable Novelty Assessment.
```

---

# 100. Novelty Reason Codes

Stable reason codes include:

```text
NOV_REFERENCE_UNESTABLISHED

NOV_LOW_LOCAL_DENSITY

NOV_NO_RELEVANT_NEIGHBORS

NOV_HIGH_NEIGHBOR_DISTANCE

NOV_OUTSIDE_OBSERVED_RANGE

NOV_EXTREME_RANGE_EXCEEDANCE

NOV_UNSEEN_CATEGORY

NOV_RARE_CATEGORY

NOV_UNSEEN_FEATURE_COMBINATION

NOV_RARE_FEATURE_COMBINATION

NOV_NEAR_COMPETENCE_FRONTIER

NOV_CROSSED_COMPETENCE_FRONTIER

NOV_FAR_BEYOND_FRONTIER

NOV_UNSEEN_ACTION_TYPE

NOV_UNSEEN_TOOL

NOV_UNSEEN_TARGET_CLASS

NOV_UNSEEN_SEQUENCE_TRANSITION

NOV_UNKNOWN_CRITICAL_FEATURE

NOV_ACTIVE_DISTRIBUTION_SHIFT

NOV_REFERENCE_POISONING_SUSPECTED

NOV_RAPID_FRONTIER_EXPANSION
```

---

# 101. V1 Refund Novelty Feature Space

Primary dimensions:

```text
case_type

amount_minor

amount_band

payment_environment

evidence_completeness

evidence_conflict

prior_refund_attempts

provider
```

Structural dimensions:

```text
action_type

tool_name

tool_version

target_type
```

Sequence dimensions:

```text
previous_action_type

objective_step_number
```

---

# 102. V1 Reference Distribution

Primary:

```text
Current agent version
+
compatible lineage
```

Secondary:

```text
All refund agents
```

The assessment should expose both:

```text
Agent-relative novelty

Population-relative novelty
```

---

# 103. V1 Distance Metrics

Reuse SPEC-003 mixed-type distance.

Initial weights:

```text
case_type:
0.20

amount:
0.20

payment_environment:
0.15

evidence_completeness:
0.10

evidence_conflict:
0.15

provider:
0.10

prior_refund_attempts:
0.05

case_age:
0.05
```

These are benchmark starting points.

---

# 104. V1 Composition Tracking

Required pairs:

```text
case_type
×
payment_environment

case_type
×
amount_band

case_type
×
evidence_conflict

payment_environment
×
provider
```

Required triple:

```text
case_type
×
payment_environment
×
amount_band
```

---

# 105. Example 1 — Familiar Action

Current:

```text
₹18,400

Domestic

Duplicate charge

Complete evidence
```

History:

```text
Hundreds of nearby cases
```

Output:

```text
Novelty:
FAMILIAR

Local density:
HIGH

Range novelty:
LOW

Composition novelty:
LOW

Frontier:
INSIDE_ESTABLISHED_REGION
```

---

# 106. Example 2 — Near Frontier

Established experience:

```text
Up to ₹25,000
```

Current:

```text
₹28,000
```

Output:

```text
Novelty:
MODERATE

Range novelty:
MODERATE

Frontier:
CROSSING_FRONTIER
```

This is different from extreme novelty.

---

# 107. Example 3 — Extreme Amount

Historical maximum:

```text
₹40,000
```

Current:

```text
₹8,00,000
```

Output:

```text
Novelty:
EXTREME

Flag:
NOV_EXTREME_RANGE_EXCEEDANCE

Frontier:
FAR_OUTSIDE_FRONTIER
```

---

# 108. Example 4 — Familiar Values, Novel Combination

History contains:

```text
International cases

Fraud disputes

High-value refunds
```

But never together.

Current:

```text
International

Fraud dispute

₹2,00,000
```

Output:

```text
Category novelty:
LOW

Range novelty:
LOW or MODERATE

Compositional novelty:
HIGH
```

This demonstrates why feature-level anomaly detection is insufficient.

---

# 109. Example 5 — One Close Neighbor

Current action has:

```text
Nearest-neighbor distance:
LOW
```

But:

```text
Only one nearby observation

Next neighbors:
very distant
```

Output:

```text
Distance novelty:
LOW

Density novelty:
HIGH

Overall novelty:
MODERATE or HIGH
```

The system does not confuse one close example with established familiarity.

---

# 110. Example 6 — New Provider

Action semantics:

```text
Normal refund
```

Tool:

```text
New payment provider
```

Output:

```text
Structural novelty:
HIGH

Flag:
NOV_UNSEEN_TOOL
```

Competence may still be high for refund reasoning.

Execution novelty remains real.

---

# 111. Example 7 — New Agent

History:

```text
None
```

Output:

```text
Reference quality:
INSUFFICIENT

Novelty state:
UNESTABLISHED_REFERENCE
```

Not:

```text
FAMILIAR
```

and not mathematically:

```text
PROVEN OOD
```

---

# 112. Example 8 — Environment Shift

Historical:

```text
International cases:
2%
```

Recent:

```text
International cases:
38%
```

Output:

```text
Distribution shift:
HIGH

Shift type:
CATEGORY_FREQUENCY
```

Current international action may be individually less unusual than before.

But the environment itself is changing.

---

# 113. Example 9 — Missingness Shift

Historical:

```text
Unknown payment environment:
1%
```

Recent:

```text
Unknown:
47%
```

Output:

```text
Shift:
CRITICAL

Type:
MISSINGNESS

Possible cause:
Upstream data degradation
```

The engine reports the shift.

It does not guess the cause as fact.

---

# 114. Example 10 — Novel Sequence

Known action:

```text
ISSUE_REFUND
```

Known action:

```text
DELETE_CASE
```

But historical transition:

```text
ISSUE_REFUND
→
DELETE_CASE
```

has never occurred.

Output:

```text
Sequence novelty:
HIGH
```

---

# 115. Example 11 — Global Familiarity, Agent Novelty

System history:

```text
10,000 international fraud cases
```

Agent history:

```text
0
```

Output:

```text
Population novelty:
LOW

Agent novelty:
HIGH
```

This becomes valuable for routing.

---

# 116. Example 12 — Familiarity Without Competence

Agent has handled:

```text
500 fraud disputes
```

Success:

```text
42%
```

Current fraud dispute:

```text
Novelty:
LOW

Competence:
LOW
```

The agent knows the territory.

It is simply bad at it.

---

# 117. Example 13 — Novelty Without Low Competence

Agent has strong general performance.

Current action is slightly beyond established frontier.

Output:

```text
Competence:
HIGH

Novelty:
MODERATE
```

The action may become a candidate for supervised frontier expansion.

SPEC-008 will decide the autonomy implications.

---

# 118. Database Ownership

The Novelty Intelligence System owns conceptually:

```text
novelty_feature_schemas

novelty_feature_definitions

novelty_feature_vectors

reference_distributions

reference_distribution_members

novelty_distance_profiles

novelty_density_profiles

composition_profiles

composition_support_stats

feature_range_stats

feature_category_stats

sequence_transition_stats

distribution_shift_signals

novelty_assessments

novelty_assessment_dimensions
```

Exact relational design belongs to SPEC-011.

---

# 119. Event Model

The system emits:

```text
NOVELTY_FEATURE_VECTOR_CREATED

REFERENCE_DISTRIBUTION_CREATED

REFERENCE_DISTRIBUTION_UPDATED

NOVELTY_ASSESSMENT_STARTED

NOVELTY_ASSESSED

EXTREME_NOVELTY_DETECTED

COMPETENCE_FRONTIER_CROSSED

UNSEEN_CATEGORY_DETECTED

UNSEEN_COMBINATION_DETECTED

DISTRIBUTION_SHIFT_DETECTED

DISTRIBUTION_SHIFT_ESCALATED

DISTRIBUTION_SHIFT_RESOLVED

REFERENCE_POISONING_SUSPECTED

RAPID_FRONTIER_EXPANSION_DETECTED
```

---

# 120. Performance Requirements

Initial target:

```text
Feature extraction:
< 20 ms

Reference resolution:
< 20 ms

Neighbor retrieval:
< 100 ms

Range/category lookup:
< 30 ms

Composition lookup:
< 30 ms

Novelty aggregation:
< 20 ms

Total action novelty assessment:
< 250 ms
```

Distribution shift analysis may run asynchronously.

The critical path must not require an LLM.

---

# 121. Storage Architecture

V1 uses:

```text
PostgreSQL
```

for:

```text
Structured feature history

Reference membership

Range statistics

Category frequencies

Composition support

Sequence transitions

Shift signals
```

Optional:

```text
pgvector
```

for semantic novelty.

A separate anomaly-detection service is not required.

---

# 122. Precomputation

Safe precomputed data:

```text
Feature ranges

Quantiles

Category counts

Composition counts

Sequence transition counts

Stable reference snapshots
```

Dynamic per-action calculations:

```text
Neighbor distances

Local density

Frontier relationship

Current novelty aggregation
```

---

# 123. Distribution Shift Execution Model

Shift detection should run:

```text
Asynchronously
```

on configurable schedules.

Example:

```text
Every 15 minutes

Hourly

Daily
```

depending on workload volume.

The latest active shift signals become inputs to runtime Novelty Assessments.

---

# 124. Testing Strategy

Required tests:

```text
Feature extraction tests

Distance tests

Density tests

Range novelty tests

Category novelty tests

Composition novelty tests

Boundary tests

Sequence novelty tests

Reference quality tests

Shift detection tests

Reference poisoning tests

Replay tests
```

---

# 125. Mathematical Unit Tests

Examples:

```text
Identical feature vectors
→ distance 0
```

```text
No historical neighbors
→ maximum density novelty
```

```text
Value inside robust range
→ no range violation
```

```text
Previously unseen category
→ category novelty flag
```

```text
Seen individual values
but unseen pair
→ compositional novelty
```

```text
Same historical snapshot
→ same novelty assessment
```

---

# 126. Property-Based Tests

Required properties:

```text
Increasing distance
must not decrease distance novelty.

Increasing local support
must not increase density novelty.

Moving farther beyond a range
must not reduce range novelty.

Adding identical duplicate observations
must not create unlimited familiarity.

Future observations
must not affect historical assessments.

Changing the stable baseline
must create a new reference version.
```

---

# 127. Adversarial Tests

The benchmark must include:

```text
Reference poisoning

Duplicate novelty flooding

Gradual frontier expansion

Boundary gaming

Agent identity switching

Feature omission

Unknown-value laundering

Schema downgrade

Timestamp manipulation

Population-reference laundering

Novel sequence construction

Rare-combination attacks
```

---

# 128. Benchmark Ground Truth

Synthetic agents should operate over known distributions.

Example:

```text
Training distribution:

Domestic:
90%

International:
10%

Amount:
₹500–₹25,000

Fraud disputes:
5%
```

Inject:

```text
Extreme amount cases

New categories

New combinations

Gradual shift

Abrupt shift

Missingness shift

Sequence anomalies
```

Then measure detection quality.

---

# 129. Core Benchmark Metrics

Required metrics:

```text
OOD detection AUROC

OOD detection AUPRC

False novelty rate

Extreme novelty recall

Unseen combination recall

Local density calibration

Frontier crossing detection accuracy

Shift detection delay

False shift alert rate

Reference poisoning resistance

Assessment latency
```

---

# 130. Research Question 1

Does decomposed novelty outperform one anomaly score?

Compare:

```text
Single global anomaly score
```

against:

```text
Distance

Density

Range

Category

Composition

Boundary
```

Hypothesis:

```text
Decomposition improves explainability
and autonomy calibration.
```

---

# 131. Research Question 2

Does compositional novelty detect failures missed by feature-level OOD detection?

This is one of the strongest potential research contributions.

---

# 132. Research Question 3

Can competence-frontier distance support safe autonomy expansion?

Compare:

```text
Random exploration
```

against:

```text
Frontier-aware supervised exploration
```

Measure:

```text
Failure rate

Competence growth

Human review burden
```

---

# 133. Research Question 4

How should stable reference distributions adapt without becoming poisonable?

Compare:

```text
Immediate adaptation

Rolling windows

Quarantined admission

Multi-timescale baselines
```

---

# 134. Research Question 5

Can agent-relative novelty improve routing?

Compare:

```text
Current agent continues
```

against:

```text
Route to agent with lower novelty
and stronger competence
```

This may later become a separate orchestration contribution.

---

# 135. Research Question 6

Does local distribution shift predict competence degradation before failure rates rise?

This is especially valuable.

Input distributions may move before outcomes visibly worsen.

AEGIS may detect:

```text
The world changed
```

before:

```text
The agent started failing.
```

---

# 136. Dashboard Representation

The dashboard should eventually show:

```text
Current novelty level

Top novel dimensions

Nearest known experience

Local evidence density

Competence frontier relationship

Active distribution shifts

Reference quality
```

Potential visualization:

```text
Known territory

Frontier

Current action

Historical density
```

The UI is outside this specification.

The data requirements are not.

---

# 137. Privacy Requirements

Novelty history should store only necessary features.

Do not duplicate:

```text
Full customer documents

Sensitive evidence payloads

Raw communications
```

unless required elsewhere.

Use:

```text
Structured features

Hashes

References

Derived statistics
```

where possible.

---

# 138. Security Requirements

The system must protect:

```text
Reference snapshots

Historical feature vectors

Shift statistics

Composition counts

Frontier state

Novelty assessments
```

against unauthorized mutation.

A manipulated reference distribution could make dangerous actions appear familiar.

---

# 139. Rejected Alternative — One Anomaly Score

Rejected because it cannot explain:

```text
What is novel?

How is it novel?

Is it sparse?

Out of range?

A new category?

A new combination?

A changing environment?
```

---

# 140. Rejected Alternative — Nearest Neighbor Only

Rejected because:

```text
One nearby point does not establish familiarity.
```

---

# 141. Rejected Alternative — Global Population OOD

Rejected because:

```text
System familiarity
does not imply
agent familiarity.
```

---

# 142. Rejected Alternative — Competence Uncertainty as Novelty

Rejected because:

```text
Low competence certainty
```

may result from:

```text
Few outcomes
```

while:

```text
Novelty
```

concerns distance from experience.

Related.

Not identical.

---

# 143. Rejected Alternative — LLM Novelty Judgment

Rejected as the core mechanism:

```text
"Does this action seem unusual?"
```

Reasons:

```text
Non-reproducible

Prompt-injectable

Poor numerical calibration

Weak historical grounding
```

AI may assist semantic novelty.

It may not replace deterministic novelty measurement.

---

# 144. Rejected Alternative — Immediate Baseline Adaptation

Rejected because repeated anomalies could rapidly become normal.

---

# 145. Rejected Alternative — Static Baseline Forever

Rejected because legitimate environments change.

AEGIS requires controlled adaptation.

---

# 146. Rejected Alternative — Every Combination Tracking

Rejected because of combinatorial explosion.

V1 tracks selected high-value pairs and triples.

---

# 147. V1 Implementation Boundary

The first production-grade implementation must include:

```text
Versioned novelty feature schema

Agent-relative reference distributions

Population-relative secondary reference

Mixed-type distance

K-neighbor retrieval

Maximum distance threshold

Local density calculation

Continuous range novelty

Categorical novelty

Selected pairwise compositional novelty

Selected triple novelty

Competence-frontier relationship

Basic sequence-transition novelty

Structural tool novelty

Reference quality classification

Overall novelty aggregation

Critical novelty flags

Asynchronous distribution shift detection

Immutable Novelty Assessment
```

V1 should not require:

```text
Deep autoencoders

Isolation forests as the primary model

Neural density estimation

Normalizing flows

Graph neural networks

Autonomous feature discovery

Separate vector infrastructure
```

The architecture remains extensible.

---

# 148. Decisions Locked by SPEC-004

The following are now architectural commitments:

```text
1. Novelty and competence are separate dimensions.

2. Novelty is primarily agent-relative.

3. Population-relative novelty is a secondary diagnostic.

4. AEGIS will not use one opaque anomaly score as the complete novelty model.

5. Novelty is decomposed into distance, density, range, category, composition, boundary, sequence, and structural components.

6. One close historical observation does not establish familiarity.

7. Local evidence density is a first-class signal.

8. Continuous out-of-range values are explicitly detected.

9. Unseen categorical values are explicitly detected.

10. Familiar individual values may still form a novel combination.

11. V1 tracks selected feature pairs and triples.

12. Competence frontiers from SPEC-003 become inputs to boundary novelty.

13. Near-frontier actions are distinguished from extreme extrapolation.

14. Sequence novelty is part of agent action assessment.

15. Tool and schema changes may create structural novelty.

16. Unknown values do not count as familiar values.

17. Cold start is classified as unestablished reference, not proven OOD.

18. Unsupported and novel are separate states.

19. Every novelty assessment exposes reference quality.

20. Individual novelty and distribution shift are separate.

21. Distribution shift uses stable baseline and recent windows.

22. Shift detection is feature-type-specific.

23. Distribution shift analysis runs asynchronously.

24. Stable references do not adapt immediately to every observation.

25. Highly novel observations may enter quarantine before stable reference admission.

26. Reference poisoning is an explicit threat model.

27. Duplicate flooding must not create unlimited familiarity.

28. Environment novelty and agent novelty may differ.

29. Cross-agent familiarity does not erase agent-specific novelty.

30. Every assessment must identify the dimensions causing novelty.

31. Future data leakage is prohibited.

32. The critical runtime path must not require an LLM.

33. PostgreSQL remains sufficient for V1.

34. The flagship benchmark remains customer refund operations.
```

---

# 149. Final Novelty Mental Model

The old system asks:

```text
Has the agent done refunds before?
```

AEGIS asks:

```text
Has THIS agent version seen THIS kind of refund?

How close are the nearest historical cases?

How many relevant cases exist nearby?

Is this amount inside the historical range?

Has this category ever appeared?

Have these familiar values ever appeared together?

Is the action crossing a competence frontier?

Is the tool familiar?

Is the action sequence familiar?

Is this one strange case?

Or is the entire workload changing?

Is the reference distribution itself strong enough
for us to make that claim?
```

The result is not:

```text
Anomaly score:
0.82
```

The result is:

```text
NOVELTY:
HIGH

WHY:

Amount:
18× above robust historical range

Combination:
INTERNATIONAL × FRAUD_DISPUTE unseen

Provider:
never encountered

Local density:
near zero

Frontier:
far beyond established competence region

Environment shift:
none detected

Reference quality:
strong
```

That is an actionable novelty claim.

---

# 150. Final Definition

The AEGIS Novelty and Distribution Shift Engine is:

> A versioned, agent-relative, explainable system for determining how unfamiliar a proposed action is relative to demonstrated historical experience, by measuring local distance, evidence density, numerical range violations, unseen categorical values, novel feature combinations, competence-frontier crossings, sequence anomalies, structural changes, and broader shifts in the operating environment.

Its central relationship is:

\[
\boxed{
Novelty
\neq
Low\ Competence
}
\]

and:

\[
\boxed{
Familiarity
\neq
Safety
}
\]

SPEC-003 maps:

```text
Where has the agent demonstrated ability?
```

SPEC-004 maps:

```text
How far is the current action from that known territory?
```

Together:

```text
COMPETENCE TOPOLOGY
+
NOVELTY DETECTION
```

give AEGIS a dynamic map of:

```text
Known territory

Weak territory

Sparse territory

Frontiers

Unknown territory

Changing territory
```

That map becomes the basis for uncertainty-aware adaptive autonomy.