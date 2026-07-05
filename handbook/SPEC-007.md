# AEGIS TECHNICAL SPECIFICATION 007

## Adaptive Autonomy Decision Engine

**Document ID:** AEGIS-SPEC-007  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Runtime Autonomy Decision Architecture  
**Depends On:** AEGIS-SPEC-000 through AEGIS-SPEC-006  
**Primary Owner:** Adaptive Autonomy System  
**Primary Runtime Component:** Autonomy Decision Engine  
**Consumers:** Execution Gateway, Contract Engine, Approval System, Monitoring System, Recovery System, Dashboard, Research Harness, Benchmark System

---

# 0. Purpose of This Specification

This specification defines how AEGIS converts all previously computed intelligence into a concrete runtime autonomy decision.

The central question is:

```text
Given:

WHO is acting?

WHAT action is proposed?

HOW capable is the agent?

HOW familiar is this situation?

HOW strong is the evidence?

WHAT happens if the action is wrong?

WHAT constraints are available?

WHAT recovery mechanisms exist?

WHAT safer execution forms exist?

HOW much autonomy should be granted right now?
```

The answer must be:

```text
Specific

Action-scoped

Context-dependent

Time-bound

Constraint-aware

Explainable

Reproducible

Enforceable
```

The Autonomy Decision Engine must not merely calculate:

```text
Risk Score = 0.73
```

It must produce an executable decision such as:

```text
DECISION:
ALLOW_CONSTRAINED

AUTHORIZED ACTION:
Issue customer refund

MAXIMUM AMOUNT:
₹5,000

MAXIMUM TARGETS:
1 transaction

EXECUTION MODE:
Synchronous

MONITORING:
Required

ROLLBACK:
Must remain available

EXPIRY:
5 minutes

REASSESSMENT:
Required if action changes

REASON:
Agent competence is strong.
Novelty is low.
Evidence quality is high.
Consequence is moderate.
Blast radius is tightly contained.
```

The output of SPEC-007 becomes the authority used by the Execution Gateway.

---

# 1. Foundational Principle

AEGIS rejects static autonomy.

An agent is not:

```text
TRUSTED
```

or:

```text
UNTRUSTED
```

in the abstract.

Autonomy is a function of:

\[
A
=
f(
Agent,
Action,
Context,
Competence,
Novelty,
Evidence,
Consequence,
Constraints,
Recovery,
Time
)
\]

Therefore:

\[
Autonomy(agent)
\]

is rejected.

The correct abstraction is:

\[
Autonomy(agent, action, context, time)
\]

An agent may receive:

```text
FULL AUTONOMY
```

for:

```text
Generate a private summary.
```

while receiving:

```text
NO AUTONOMY
```

for:

```text
Delete production customer data.
```

The same agent may receive different autonomy for the same action five minutes later if:

```text
Evidence changes

System state changes

Blast radius changes

Recovery becomes unavailable

Agent behavior changes

Policy changes
```

Autonomy is therefore dynamic.

---

# 2. The Central AEGIS Decision Equation

The conceptual autonomy function is:

\[
D(x)
=
F(
C,
N,
E,
K,
G,
R,
P
)
\]

where:

```text
C
=
Competence assessment

N
=
Novelty assessment

E
=
Epistemic assessment

K
=
Consequence assessment

G
=
Available guardrails and constraints

R
=
Recovery capability

P
=
Governance policy
```

However:

\[
D(x)
\neq
WeightedAverage(C,N,E,K)
\]

because some conditions must act as hard boundaries.

Example:

```text
Competence:
0.99

Novelty:
0.01

Evidence:
0.99

Consequence:
CATASTROPHIC

Rollback:
NONE
```

A weighted average must not convert this into:

```text
Mostly safe.
```

Critical dimensions survive aggregation.

---

# 3. The Core Decision Philosophy

AEGIS follows this sequence:

```text
1. Can unrestricted execution be safely granted?

If not:

2. Can monitoring make execution safe enough?

If not:

3. Can constraints make execution safe enough?

If not:

4. Can scope reduction make execution safe enough?

If not:

5. Can staged execution make execution safe enough?

If not:

6. Can additional evidence resolve the problem?

If not:

7. Can human judgment resolve the problem?

If not:

8. Must the action be blocked?
```

This means the engine does not immediately ask:

```text
ALLOW OR DENY?
```

It asks:

```text
WHAT IS THE MAXIMUM SAFE AUTONOMY
AVAILABLE FOR THIS ACTION?
```

---

# 4. Maximum Safe Autonomy

Define:

\[
MSA(x)
=
\max
\{
a \in L
\mid
Execution(x,a)
\ satisfies\ safety\ policy
\}
\]

where:

```text
L
=
ordered set of autonomy levels
```

AEGIS seeks the highest autonomy level that satisfies all applicable constraints.

This is the core optimization objective.

---

# 5. Autonomy Is Not Permission

Permission answers:

```text
Is this action legally or organizationally authorized?
```

Autonomy answers:

```text
How independently may the agent execute it?
```

Possible state:

```text
AUTHORIZED:
YES

AUTONOMY:
HUMAN APPROVAL REQUIRED
```

Another:

```text
AUTHORIZED:
YES

AUTONOMY:
FULL
```

Another:

```text
AUTHORIZED:
NO

AUTONOMY:
BLOCKED
```

Authorization and autonomy must remain separate.

---

# 6. Autonomy Is Not Confidence

An agent may be:

```text
99.9% confident
```

while:

```text
Evidence quality:
LOW
```

or:

```text
Consequence:
CATASTROPHIC
```

Confidence cannot directly determine autonomy.

---

# 7. Autonomy Is Not Competence

A highly competent agent can perform highly dangerous actions.

Competence may increase the amount of autonomy available.

It does not eliminate consequence boundaries.

---

# 8. Autonomy Is Not Risk Score Thresholding

Rejected model:

```text
Risk < 0.3
→ ALLOW

Risk >= 0.3
→ DENY
```

This loses the difference between:

```text
Low competence

High novelty

Missing evidence

High consequence

Weak containment

No rollback
```

Each requires a different intervention.

---

# 9. Decision Engine Responsibilities

The Adaptive Autonomy Decision Engine owns:

```text
1. Receive all prerequisite assessments.

2. Verify assessment compatibility.

3. Verify assessment freshness.

4. Resolve applicable autonomy policy.

5. Detect hard blockers.

6. Detect hard autonomy ceilings.

7. Detect missing prerequisite information.

8. Determine whether unrestricted execution is acceptable.

9. Evaluate monitoring viability.

10. Evaluate available constraints.

11. Evaluate safer action variants.

12. Evaluate staged execution plans.

13. Determine evidence acquisition opportunities.

14. Determine human approval requirements.

15. Determine required oversight level.

16. Determine execution constraints.

17. Determine monitoring requirements.

18. Determine rollback requirements.

19. Determine reassessment triggers.

20. Determine decision expiry.

21. Generate an enforceable Autonomy Grant.

22. Generate an immutable Autonomy Decision.

23. Explain the decision.

24. Emit decision events.

25. Support deterministic replay.
```

---

# 10. Non-Responsibilities

The Decision Engine does not:

```text
Execute actions

Perform human approval

Monitor execution directly

Perform rollback

Determine raw competence

Determine raw novelty

Determine raw epistemic state

Determine raw consequence

Modify policy during evaluation
```

It decides:

> What execution authority should exist?

---

# 11. Input Contract

The Decision Engine receives:

```typescript
interface AutonomyDecisionInput {
  action: CanonicalAction;

  authorizationAssessment: AuthorizationAssessment;

  competenceAssessment: CompetenceAssessment;

  noveltyAssessment: NoveltyAssessment;

  epistemicAssessment: EpistemicAssessment;

  consequenceAssessment: ConsequenceAssessment;

  availableGuardrails: GuardrailCapability[];

  recoveryState: RecoveryState;

  policyContext: PolicyContext;

  runtimeContext: RuntimeContext;
}
```

All input objects must be:

```text
Versioned

Immutable

Traceable

Compatible

Fresh enough for the action
```

---

# 12. Assessment Compatibility

The engine must verify that all assessments refer to the same:

```text
Action ID

Action version

Agent identity

Environment

Relevant target state
```

Example:

```text
Competence assessment:
Action version 4

Consequence assessment:
Action version 5
```

Decision:

```text
INVALID INPUT SET
```

The engine must not combine incompatible assessments.

---

# 13. Assessment Freshness

Some assessments decay.

Examples:

```text
Competence:
May remain valid for hours or days.

Evidence:
May become stale within seconds.

Consequence:
May change if target count changes.

Recovery:
May change immediately if backup service fails.
```

Each assessment therefore requires:

```text
Created time

Validity duration

Invalidation conditions
```

---

# 14. Decision Invariants

## AUT-INV-001 — Autonomy Is Action-Scoped

No decision grants abstract global trust.

---

## AUT-INV-002 — Autonomy Is Context-Specific

A staging decision cannot authorize production execution.

---

## AUT-INV-003 — Autonomy Is Time-Bound

Every grant expires.

---

## AUT-INV-004 — Action Mutation Invalidates the Decision

Changing meaningful action semantics requires reassessment.

---

## AUT-INV-005 — Higher Consequence Cannot Increase Autonomy

All else equal.

---

## AUT-INV-006 — Lower Competence Cannot Increase Autonomy

All else equal.

---

## AUT-INV-007 — Higher Novelty Cannot Increase Autonomy

All else equal.

---

## AUT-INV-008 — Greater Epistemic Uncertainty Cannot Increase Autonomy

All else equal.

---

## AUT-INV-009 — Stronger Verified Guardrails May Increase Autonomy

If they materially reduce reachable consequence.

---

## AUT-INV-010 — Better Verified Recovery May Increase Autonomy

If recovery meaningfully reduces residual harm.

---

## AUT-INV-011 — Soft Guardrails Cannot Be Treated as Hard Boundaries

Prompt instructions do not equal enforced limits.

---

## AUT-INV-012 — Human Approval Does Not Remove Execution Constraints

Approved actions remain bounded.

---

## AUT-INV-013 — Critical Blockers Survive Aggregation

No average score can erase a hard blocker.

---

## AUT-INV-014 — Unknown Is Not Equivalent to Safe

Unknown critical dimensions reduce available autonomy.

---

## AUT-INV-015 — The Engine Must Prefer Safer Useful Execution Over Unnecessary Denial

When policy allows.

---

## AUT-INV-016 — Every Grant Must Be Enforceable

A constraint that cannot be enforced cannot appear as a binding guarantee.

---

## AUT-INV-017 — The Grant Must Match the Decision

The Execution Gateway receives no authority beyond what was evaluated.

---

## AUT-INV-018 — Decisions Must Be Reproducible

Identical immutable inputs and policy versions produce identical decisions.

---

# 15. Autonomy Level Model

AEGIS defines a structured autonomy ladder.

Recommended V1 levels:

```typescript
type AutonomyLevel =
  | "L0_BLOCKED"
  | "L1_HUMAN_EXECUTION_ONLY"
  | "L2_HUMAN_APPROVAL_REQUIRED"
  | "L3_CONSTRAINED_AUTONOMY"
  | "L4_MONITORED_AUTONOMY"
  | "L5_FULL_AUTONOMY";
```

These levels are ordered by increasing agent independence.

---

# 16. L0 — Blocked

Meaning:

```text
The action may not execute.
```

Possible reasons:

```text
Unauthorized action

Prohibited action class

Catastrophic consequence with no acceptable mitigation

Invalid or manipulated assessments

Missing mandatory safety information

Policy prohibition

Compromised agent identity

Unacceptable cross-tenant effect
```

L0 produces no executable authority.

---

# 17. L1 — Human Execution Only

Meaning:

```text
The agent may assist.

The agent may not execute.
```

The agent may:

```text
Analyze

Prepare

Recommend

Generate a draft

Construct a proposed action
```

A human must perform the actual execution through a separately authorized interface.

Use when:

```text
Human agency itself is required

Action is too sensitive for agent execution

Policy forbids machine execution

External regulation requires direct human action
```

---

# 18. L2 — Human Approval Required

Meaning:

```text
The agent prepares the exact action.

A human reviews it.

If approved, the agent may execute
the exact approved action.
```

Important:

```text
Approval does not authorize arbitrary modification.
```

If the action changes after approval:

```text
Approval becomes invalid.
```

---

# 19. L3 — Constrained Autonomy

Meaning:

```text
The agent may execute independently,
but only inside explicit enforced boundaries.
```

Examples:

```text
Maximum refund:
₹5,000

Maximum targets:
1

Allowed tenant:
tenant_123

Allowed API:
refund.create

Maximum execution count:
1

External notification:
disabled
```

This is expected to be the most important production autonomy level.

---

# 20. L4 — Monitored Autonomy

Meaning:

```text
The agent may execute independently.

Real-time observation is required.

The system must be able to detect
and intervene before unacceptable harm.
```

L4 is only valid when:

```text
Monitoring exists

Detection is sufficiently fast

Containment is possible

Intervention window is positive
```

---

# 21. L5 — Full Autonomy

Meaning:

```text
The agent may execute the evaluated action
without human approval or special runtime intervention.
```

This does not mean:

```text
Unlimited authority.
```

The action remains bounded by:

```text
Action identity

Action version

Environment

Normal authorization

Grant expiry

System-level security boundaries
```

---

# 22. Why L3 and L4 Are Separate

Consider:

```text
Action A:
Refund up to ₹500
```

The system can enforce the amount.

This is:

```text
CONSTRAINED AUTONOMY
```

Now:

```text
Action B:
Deploy configuration to 1% canary
with live rollback monitoring.
```

The safety mechanism depends on observing execution.

This is:

```text
MONITORED AUTONOMY
```

Constraint and monitoring are distinct safety mechanisms.

---

# 23. Execution Mode

Autonomy level alone is insufficient.

The engine also selects:

```typescript
type ExecutionMode =
  | "DIRECT"
  | "CONSTRAINED"
  | "MONITORED"
  | "CANARY"
  | "STAGED"
  | "DELAYED_COMMIT"
  | "DRY_RUN"
  | "SHADOW"
  | "HUMAN_APPROVED"
  | "HUMAN_EXECUTED"
  | "BLOCKED";
```

---

# 24. Autonomy Decision vs Execution Mode

Example:

```text
Autonomy Level:
L3_CONSTRAINED_AUTONOMY

Execution Mode:
CANARY
```

Another:

```text
Autonomy Level:
L2_HUMAN_APPROVAL_REQUIRED

Execution Mode:
DELAYED_COMMIT
```

These are independent but related.

---

# 25. Core Domain Objects

SPEC-007 defines:

```text
Autonomy Policy

Decision Rule

Hard Blocker

Autonomy Ceiling

Autonomy Floor

Guardrail Capability

Execution Constraint

Monitoring Requirement

Approval Requirement

Reassessment Trigger

Autonomy Grant

Autonomy Decision

Decision Explanation

Counterfactual Decision

Decision Trace
```

---

# 26. Autonomy Policy

Conceptual schema:

```typescript
interface AutonomyPolicy {
  policyId: string;

  name: string;

  scope: PolicyScope;

  decisionRules: DecisionRule[];

  hardBlockers: HardBlockerRule[];

  autonomyCeilings: AutonomyCeilingRule[];

  approvalRules: ApprovalRule[];

  constraintRules: ConstraintRule[];

  monitoringRules: MonitoringRule[];

  expiryRules: ExpiryRule[];

  version: number;

  effectiveFrom: Timestamp;

  effectiveUntil?: Timestamp;
}
```

---

# 27. Policy Scope

Policies may apply to:

```text
Organization

Environment

Agent

Agent class

Action type

Tool

Asset class

Tenant

Jurisdiction

Impact domain
```

---

# 28. Policy Precedence

Recommended order:

```text
1. System-wide prohibition

2. Regulatory requirement

3. Organization policy

4. Environment policy

5. Action-type policy

6. Agent-specific policy

7. Runtime decision rule
```

Lower-level policy cannot override a stronger prohibition.

---

# 29. Policy Conflict Resolution

If two policies conflict:

```text
More restrictive applicable policy wins
```

unless explicit policy precedence states otherwise.

Every conflict must be recorded.

---

# 30. Decision Rule

Conceptual schema:

```typescript
interface DecisionRule {
  ruleId: string;

  conditionExpression: string;

  effect:
    | "BLOCK"
    | "SET_MAX_AUTONOMY"
    | "REQUIRE_APPROVAL"
    | "REQUIRE_CONSTRAINT"
    | "REQUIRE_MONITORING"
    | "REQUIRE_RECOVERY"
    | "REQUIRE_REASSESSMENT";

  effectValue: unknown;

  priority: number;

  reasonCode: string;
}
```

---

# 31. Hard Blocker

A hard blocker means:

```text
No autonomous execution form is acceptable.
```

Conceptual schema:

```typescript
interface HardBlocker {
  blockerId: string;

  blockerType: string;

  sourceAssessmentId?: string;

  policyRuleId?: string;

  severity: "HARD";

  reasonCode: string;
}
```

---

# 32. Required V1 Hard Blockers

Examples:

```text
AUT_ACTION_UNAUTHORIZED

AUT_ACTION_PROHIBITED

AUT_AGENT_IDENTITY_INVALID

AUT_ASSESSMENT_MISMATCH

AUT_CRITICAL_ASSESSMENT_MISSING

AUT_POLICY_MISSING

AUT_POLICY_CONFLICT_UNRESOLVED

AUT_CATASTROPHIC_UNCONTAINED_EFFECT

AUT_FORBIDDEN_CROSS_TENANT_IMPACT

AUT_RECOVERY_REQUIRED_BUT_UNAVAILABLE

AUT_APPROVAL_REQUIRED_BUT_IMPOSSIBLE

AUT_ACTION_CHANGED_AFTER_APPROVAL

AUT_GRANT_EXPIRED
```

---

# 33. Autonomy Ceiling

A ceiling defines:

```text
The highest autonomy level available
under current conditions.
```

Example:

```text
Consequence:
CRITICAL

Maximum autonomy:
L2_HUMAN_APPROVAL_REQUIRED
```

Another:

```text
Epistemic state:
INSUFFICIENT

Maximum autonomy:
L1_HUMAN_EXECUTION_ONLY
```

---

# 34. Multiple Ceilings

Suppose:

```text
Competence ceiling:
L4

Novelty ceiling:
L3

Evidence ceiling:
L2

Consequence ceiling:
L3
```

Then:

\[
MaximumAutonomy
=
\min(L4,L3,L2,L3)
\]

Therefore:

```text
Maximum autonomy:
L2
```

The most restrictive active ceiling wins.

---

# 35. Why Ceilings Are Better Than One Score

Ceilings preserve causal meaning.

The system can say:

```text
The action requires approval
because evidence quality limits autonomy to L2.
```

Instead of:

```text
Combined score:
0.62
```

---

# 36. Competence-Based Ceiling

Example conceptual mapping:

```text
PROVEN:
L5 possible

STRONG:
L5 possible

MODERATE:
Maximum L4

WEAK:
Maximum L3

INSUFFICIENT:
Maximum L2

UNKNOWN:
Maximum L2
```

Exact mappings are policy-defined.

---

# 37. Novelty-Based Ceiling

Example:

```text
ROUTINE:
L5 possible

FAMILIAR:
L5 possible

MODERATELY_NOVEL:
Maximum L4

HIGHLY_NOVEL:
Maximum L3

UNPRECEDENTED:
Maximum L2

UNKNOWN:
Maximum L2
```

---

# 38. Epistemic-Based Ceiling

Example:

```text
WELL_ESTABLISHED:
L5 possible

SUPPORTED:
L5 possible

PARTIALLY_SUPPORTED:
Maximum L4

UNCERTAIN:
Maximum L3

INSUFFICIENT:
Maximum L2

CONTRADICTORY_CRITICAL:
Maximum L1
```

---

# 39. Consequence-Based Ceiling

Example:

```text
NEGLIGIBLE:
L5 possible

LOW:
L5 possible

MODERATE:
Maximum L4

HIGH:
Maximum L3

CRITICAL:
Maximum L2

CATASTROPHIC:
Maximum L1 or L0
```

However, verified containment may change the effective execution consequence.

---

# 40. Inherent vs Effective Consequence

SPEC-006 may report:

```text
Inherent consequence:
HIGH
```

But a constrained execution form may reduce:

```text
Maximum reachable blast radius
```

Therefore the engine must distinguish:

```text
INHERENT CONSEQUENCE

from

EFFECTIVE CONSEQUENCE UNDER GRANT
```

---

# 41. Effective Consequence

Define:

\[
K_{eff}
=
K(
Action,
Constraints,
Containment,
ExecutionMode
)
\]

Example:

```text
Original action:
Refund 100,000 transactions

Inherent consequence:
CRITICAL
```

Proposed grant:

```text
Maximum targets:
10

Canary execution:
Required
```

Effective initial consequence:

```text
MODERATE
```

---

# 42. Constraint Simulation

Before issuing a grant, AEGIS must evaluate:

```text
What would consequence become
if these constraints were enforced?
```

This creates the decision loop:

```text
Assess original action

↓

Generate candidate constraint set

↓

Recalculate effective blast radius

↓

Recalculate effective consequence

↓

Check policy

↓

Grant maximum safe autonomy
```

---

# 43. Guardrail Capability

A guardrail is a mechanism that can enforce a safety boundary.

Conceptual schema:

```typescript
interface GuardrailCapability {
  guardrailId: string;

  guardrailType:
    | "VALUE_LIMIT"
    | "TARGET_LIMIT"
    | "TENANT_BOUNDARY"
    | "RATE_LIMIT"
    | "TOOL_ALLOWLIST"
    | "PARAMETER_CONSTRAINT"
    | "TIME_LIMIT"
    | "ENVIRONMENT_BOUNDARY"
    | "CANARY_LIMIT"
    | "DELAYED_COMMIT"
    | "KILL_SWITCH"
    | "ROLLBACK"
    | "HUMAN_APPROVAL";

  enforcementLayer:
    | "DATABASE"
    | "API_GATEWAY"
    | "EXECUTION_GATEWAY"
    | "INFRASTRUCTURE"
    | "EXTERNAL_PROVIDER"
    | "APPLICATION"
    | "PROMPT";

  verificationState:
    | "VERIFIED"
    | "TESTED"
    | "ASSUMED"
    | "UNKNOWN"
    | "FAILED";

  availabilityState:
    | "AVAILABLE"
    | "DEGRADED"
    | "UNAVAILABLE";

  strength:
    | "HARD"
    | "STRONG"
    | "MODERATE"
    | "WEAK";
}
```

---

# 44. Enforceable Constraint Requirement

A proposed constraint such as:

```text
Do not refund more than ₹5,000.
```

is valid only if the execution path can enforce it.

Prompt-only constraint:

```text
WEAK
```

Gateway validation:

```text
STRONG
```

Payment provider hard limit:

```text
HARD
```

---

# 45. Execution Constraint

Conceptual schema:

```typescript
interface ExecutionConstraint {
  constraintId: string;

  constraintType:
    | "MAX_VALUE"
    | "MAX_TARGETS"
    | "ALLOWED_TARGETS"
    | "ALLOWED_TENANTS"
    | "ALLOWED_TOOLS"
    | "ALLOWED_PARAMETERS"
    | "MAX_EXECUTIONS"
    | "MAX_DURATION"
    | "MAX_RATE"
    | "ENVIRONMENT_ONLY"
    | "NO_EXTERNAL_EFFECTS"
    | "REQUIRE_IDEMPOTENCY"
    | "REQUIRE_CANARY";

  value: unknown;

  enforcementGuardrailId: string;

  mandatory: boolean;
}
```

---

# 46. Constraint Composition

A grant may contain:

```text
Maximum amount:
₹5,000

Maximum targets:
1

Allowed tenant:
tenant_123

Allowed transaction:
txn_987

Execution count:
1

Expiry:
5 minutes

Idempotency:
Required
```

All constraints must be satisfied simultaneously.

---

# 47. Candidate Autonomy Generation

The engine should generate candidate execution strategies.

Example:

```text
Candidate A:
Full direct autonomy

Candidate B:
Monitored autonomy

Candidate C:
Constrained to ₹5,000

Candidate D:
10-target canary

Candidate E:
Dry run

Candidate F:
Human approval

Candidate G:
Block
```

Each candidate is evaluated independently.

---

# 48. Candidate Strategy Object

```typescript
interface CandidateAutonomyStrategy {
  candidateId: string;

  autonomyLevel: AutonomyLevel;

  executionMode: ExecutionMode;

  constraints: ExecutionConstraint[];

  monitoringRequirements: MonitoringRequirement[];

  approvalRequirements: ApprovalRequirement[];

  recoveryRequirements: RecoveryRequirement[];

  expectedUtility: number;

  effectiveConsequence: number;

  estimatedLatencyMs: number;

  valid: boolean;

  rejectionReasons: string[];
}
```

---

# 49. Candidate Evaluation Objective

The engine seeks:

\[
\max
Utility(candidate)
\]

subject to:

\[
Safety(candidate)
\geq
RequiredThreshold
\]

and:

\[
Policy(candidate)
=
Satisfied
\]

This means AEGIS prefers:

```text
Useful safe execution
```

over:

```text
Maximum restriction.
```

---

# 50. Lexicographic Decision Order

Safety must not be traded against utility without limit.

Recommended order:

```text
1. Satisfy hard policy.

2. Satisfy critical safety constraints.

3. Satisfy authorization.

4. Select maximum safe autonomy.

5. Among equally safe candidates,
   maximize utility.

6. Among equally useful candidates,
   minimize human burden.

7. Among remaining candidates,
   minimize latency.
```

---

# 51. Why Utility Comes After Safety

Rejected model:

```text
High business value
can offset catastrophic safety risk.
```

AEGIS does not permit unrestricted utility-risk averaging.

---

# 52. Decision Pipeline

The runtime decision sequence is:

```text
STEP 1

Receive Canonical Action.
```

```text
STEP 2

Load all prerequisite assessments.
```

```text
STEP 3

Verify action-version compatibility.
```

```text
STEP 4

Verify assessment freshness.
```

```text
STEP 5

Resolve applicable autonomy policies.
```

```text
STEP 6

Resolve policy precedence.
```

```text
STEP 7

Detect hard blockers.
```

```text
STEP 8

If blocked,
produce L0 decision.
```

```text
STEP 9

Calculate competence ceiling.
```

```text
STEP 10

Calculate novelty ceiling.
```

```text
STEP 11

Calculate epistemic ceiling.
```

```text
STEP 12

Calculate consequence ceiling.
```

```text
STEP 13

Apply regulatory ceiling.
```

```text
STEP 14

Apply organizational ceiling.
```

```text
STEP 15

Calculate base maximum autonomy.
```

```text
STEP 16

Generate unrestricted execution candidate.
```

```text
STEP 17

Evaluate candidate consequence.
```

```text
STEP 18

If acceptable,
consider L5.
```

```text
STEP 19

Evaluate monitored execution candidate.
```

```text
STEP 20

Verify positive intervention window.
```

```text
STEP 21

Evaluate constrained execution candidates.
```

```text
STEP 22

Simulate effective blast radius.
```

```text
STEP 23

Recalculate effective consequence.
```

```text
STEP 24

Evaluate canary candidate.
```

```text
STEP 25

Evaluate staged execution candidate.
```

```text
STEP 26

Evaluate delayed-commit candidate.
```

```text
STEP 27

Evaluate dry-run candidate.
```

```text
STEP 28

Evaluate evidence acquisition opportunity.
```

```text
STEP 29

Evaluate human approval path.
```

```text
STEP 30

Reject invalid candidates.
```

```text
STEP 31

Select maximum safe autonomy.
```

```text
STEP 32

Generate required constraints.
```

```text
STEP 33

Generate monitoring requirements.
```

```text
STEP 34

Generate recovery requirements.
```

```text
STEP 35

Generate approval requirements.
```

```text
STEP 36

Generate reassessment triggers.
```

```text
STEP 37

Calculate grant expiry.
```

```text
STEP 38

Generate decision explanation.
```

```text
STEP 39

Generate counterfactuals.
```

```text
STEP 40

Issue immutable Autonomy Decision.
```

```text
STEP 41

Issue signed Autonomy Grant if executable.
```

---

# 53. Decision Matrix Is Not the Final Architecture

A simple matrix is useful for explanation:

| Competence | Novelty | Evidence | Consequence | Likely Autonomy |
|---|---|---|---|---|
| High | Low | High | Low | L5 |
| High | Low | High | Moderate | L4 |
| High | High | High | Low | L3/L4 |
| Low | Low | High | Low | L3 |
| High | Low | Low | High | L2 |
| High | High | Low | Critical | L1/L0 |

But production decisions require:

```text
Hard blockers

Policy

Constraints

Containment

Recovery

Monitoring

Action transformation
```

Therefore a static matrix is insufficient.

---

# 54. Monitoring Viability

Monitoring may increase autonomy only when:

```text
The relevant failure signal is observable.

Detection is fast enough.

The action can still be stopped.

The intervention mechanism is available.

The intervention window is positive.
```

Formally:

\[
MonitoringUseful
=
Observable
\land
T_{detect}
+
T_{intervene}
<
T_{harm}
\]

---

# 55. Monitoring Cannot Save Instant Irreversible Actions

Example:

```text
Action:
Publish secret publicly

Time-to-harm:
10 ms

Detection:
500 ms
```

Monitoring cannot justify autonomy.

---

# 56. Monitoring Requirement

```typescript
interface MonitoringRequirement {
  requirementId: string;

  signalType: string;

  detectionThreshold: unknown;

  maximumDetectionLatencyMs: number;

  responseAction: string;

  responseDeadlineMs: number;

  requiredMonitorId: string;
}
```

---

# 57. Kill-Switch Requirement

For some L4 decisions:

```text
Execution is allowed only if
a verified kill switch is available.
```

If the kill switch becomes unavailable before execution:

```text
Grant invalidated.
```

---

# 58. Recovery Requirement

```typescript
interface RecoveryRequirement {
  requirementId: string;

  mechanismId: string;

  minimumAvailabilityState: string;

  maximumRollbackLatencyMs?: number;

  minimumCoverage?: number;

  mustRemainAvailableUntil: Timestamp;
}
```

---

# 59. Dynamic Guardrail Failure

Suppose:

```text
Decision issued:
L4 monitored autonomy

Required:
Rollback service available
```

Before execution:

```text
Rollback service fails.
```

The Execution Gateway must invalidate the grant.

---

# 60. Autonomy Grant

The decision itself is explanatory.

The grant is enforceable authority.

Conceptual schema:

```typescript
interface AutonomyGrant {
  grantId: string;

  decisionId: string;

  agentId: string;

  actionId: string;

  actionVersion: number;

  autonomyLevel: AutonomyLevel;

  executionMode: ExecutionMode;

  constraints: ExecutionConstraint[];

  monitoringRequirements: MonitoringRequirement[];

  recoveryRequirements: RecoveryRequirement[];

  approvalReference?: string;

  validFrom: Timestamp;

  expiresAt: Timestamp;

  maximumExecutionCount: number;

  reassessmentTriggers: ReassessmentTrigger[];

  policyVersionIds: string[];

  signature: string;
}
```

---

# 61. Why the Grant Must Be Signed

The Execution Gateway must verify:

```text
The grant was issued by AEGIS.

The grant has not been modified.

The action matches the grant.

The grant has not expired.
```

---

# 62. Grant Binding

The grant must bind to:

```text
Agent identity

Action ID

Action version

Target identity

Environment

Constraints

Expiry

Execution count
```

---

# 63. No Generic Grant Reuse

A grant for:

```text
Refund transaction A
```

cannot authorize:

```text
Refund transaction B.
```

---

# 64. Action Fingerprint

The grant should include a deterministic fingerprint of execution-relevant action fields.

Conceptually:

\[
F_a
=
Hash(
ActionType,
Targets,
Parameters,
Environment,
Tool,
SideEffectIntent
)
\]

The Execution Gateway recalculates the fingerprint before execution.

---

# 65. Semantic Mutation

Changing:

```text
Description text
```

may not invalidate the grant.

Changing:

```text
Amount

Target

Recipient

Tool

Environment

Scope
```

must invalidate it.

The Canonical Action specification determines meaningful fields.

---

# 66. Grant Expiry

Every grant expires.

Expiry should depend on:

```text
Evidence volatility

Target-state volatility

Consequence volatility

Recovery-state volatility

Action sensitivity
```

---

# 67. Example Expiry

Low-volatility action:

```text
Expiry:
1 hour
```

Financial refund:

```text
Expiry:
5 minutes
```

Market-sensitive action:

```text
Expiry:
30 seconds
```

---

# 68. Reassessment Trigger

```typescript
interface ReassessmentTrigger {
  triggerId: string;

  triggerType:
    | "ACTION_CHANGED"
    | "TARGET_STATE_CHANGED"
    | "EVIDENCE_CHANGED"
    | "NEW_CONTRADICTION"
    | "RECOVERY_UNAVAILABLE"
    | "MONITOR_UNAVAILABLE"
    | "CONSEQUENCE_CHANGED"
    | "POLICY_CHANGED"
    | "AGENT_STATE_CHANGED"
    | "TIME_EXPIRED";

  invalidatesGrant: boolean;
}
```

---

# 69. Continuous Decision Validity

AEGIS does not need to recompute every decision continuously.

But the grant must become invalid when a material dependency changes.

This is:

```text
EVENT-DRIVEN REASSESSMENT
```

---

# 70. Approval Requirement

```typescript
interface ApprovalRequirement {
  requirementId: string;

  approvalType:
    | "SINGLE_HUMAN"
    | "DUAL_HUMAN"
    | "DOMAIN_EXPERT"
    | "ASSET_OWNER"
    | "SECURITY"
    | "LEGAL";

  requiredRole?: string;

  actionFingerprintRequired: boolean;

  expiresAfterMs: number;
}
```

---

# 71. Approval Is Action-Specific

A human approves:

```text
Refund ₹50,000
to transaction txn_123
```

not:

```text
Refund something.
```

---

# 72. Approval Drift

If the action changes after approval:

```text
Approval:
INVALID
```

The system must prevent:

```text
Approve small action

↓

Agent changes scope

↓

Execute large action
```

---

# 73. Dual Approval

Some actions may require:

```text
Two independent approvers.
```

Use cases:

```text
Critical financial action

Mass data deletion

Security policy change

High-impact production mutation
```

---

# 74. Approval Does Not Mean Full Autonomy

Example:

```text
Human approved:
₹50,000 refund
```

Grant may still require:

```text
Maximum targets:
1

Idempotency:
Required

Execution count:
1

Monitoring:
Required
```

---

# 75. Evidence Acquisition Before Escalation

If autonomy is limited because:

```text
Evidence is insufficient
```

AEGIS should ask:

```text
Can the agent gather the missing evidence?
```

Example:

```text
Refund reason unclear.
```

Possible action:

```text
Retrieve payment processor state.

Retrieve order status.

Retrieve prior refund records.
```

Then reassess.

---

# 76. Evidence Acquisition Plan

```typescript
interface EvidenceAcquisitionPlan {
  planId: string;

  missingClaims: string[];

  permittedReadActions: string[];

  expectedInformationGain: number;

  maximumCost: number;

  maximumLatencyMs: number;

  reassessmentRequired: true;
}
```

---

# 77. Read Autonomy Can Exceed Write Autonomy

An agent may receive:

```text
L5 autonomy
```

to:

```text
Retrieve evidence.
```

while receiving:

```text
L2 autonomy
```

to:

```text
Issue refund.
```

This is expected.

---

# 78. Autonomy Recovery Loop

Conceptual flow:

```text
WRITE ACTION PROPOSED

↓

Evidence insufficient

↓

WRITE AUTONOMY DENIED TEMPORARILY

↓

READ ACTIONS AUTHORIZED

↓

Evidence gathered

↓

Epistemic reassessment

↓

Autonomy recalculated
```

This is superior to immediate human escalation.

---

# 79. Safer Variant Selection

SPEC-006 may generate:

```text
Original action

Safer variant A

Safer variant B

Staged plan
```

SPEC-007 determines:

```text
Which variant receives the highest useful autonomy?
```

---

# 80. Example

Original:

```text
Refund 10,000 transactions.
```

Decision:

```text
Original:
L2 approval required
```

Safer variant:

```text
Refund 10 transactions as canary.
```

Decision:

```text
Variant:
L3 constrained autonomy
```

AEGIS may return:

```text
Original action not autonomously authorized.

Canary variant autonomously authorized.
```

---

# 81. Counterfactual Decisions

The engine should explain:

```text
What would need to change
for more autonomy to be granted?
```

Examples:

```text
If rollback were verified,
autonomy could increase from L2 to L3.

If evidence source A were refreshed,
autonomy could increase from L3 to L4.

If target count were reduced from 10,000 to 100,
autonomy could increase from L2 to L3.
```

---

# 82. Counterfactual Object

```typescript
interface CounterfactualDecision {
  counterfactualId: string;

  currentDecisionId: string;

  changedCondition: string;

  hypotheticalAutonomyLevel: AutonomyLevel;

  hypotheticalExecutionMode: ExecutionMode;

  requiredChanges: string[];
}
```

---

# 83. Why Counterfactuals Matter

Without counterfactuals, the user sees:

```text
Approval required.
```

With counterfactuals:

```text
Approval is required because rollback is unavailable.

A 100-record canary can execute autonomously.
```

This makes AEGIS operationally useful.

---

# 84. Autonomy Decision

Conceptual schema:

```typescript
interface AutonomyDecision {
  decisionId: string;

  actionId: string;

  actionVersion: number;

  agentId: string;

  authorizationAssessmentId: string;

  competenceAssessmentId: string;

  noveltyAssessmentId: string;

  epistemicAssessmentId: string;

  consequenceAssessmentId: string;

  selectedAutonomyLevel: AutonomyLevel;

  selectedExecutionMode: ExecutionMode;

  baseAutonomyCeiling: AutonomyLevel;

  effectiveConsequenceLevel: string;

  hardBlockers: HardBlocker[];

  activeCeilings: AutonomyCeiling[];

  requiredConstraints: ExecutionConstraint[];

  monitoringRequirements: MonitoringRequirement[];

  recoveryRequirements: RecoveryRequirement[];

  approvalRequirements: ApprovalRequirement[];

  reassessmentTriggers: ReassessmentTrigger[];

  selectedCandidateId?: string;

  rejectedCandidateIds: string[];

  counterfactualDecisionIds: string[];

  reasonCodes: string[];

  policyVersionIds: string[];

  decisionEngineVersion: string;

  createdAt: Timestamp;
}
```

---

# 85. Decision Trace

The system must preserve:

```text
Which policies were loaded?

Which blockers were evaluated?

Which ceilings activated?

Which candidates were generated?

Why was each candidate rejected?

Why was the final candidate selected?
```

---

# 86. Decision Trace Object

```typescript
interface DecisionTrace {
  traceId: string;

  decisionId: string;

  evaluatedRules: RuleEvaluation[];

  generatedCandidates: string[];

  rejectedCandidates: CandidateRejection[];

  selectedCandidate: string;

  policyResolutionTrace: string[];

  evaluationDurationMs: number;
}
```

---

# 87. Explainability Requirement

AEGIS must be able to say:

```text
DECISION:
L3_CONSTRAINED_AUTONOMY

EXECUTION MODE:
CANARY

WHY:

1. Agent competence is strong.

2. The action is moderately novel.

3. Required facts are well supported.

4. The unrestricted action has critical consequence.

5. The intended scope is 10,000 transactions.

6. A hard gateway limit can reduce the initial scope to 10 transactions.

7. The constrained blast radius is moderate.

8. Rollback is verified.

9. Monitoring can detect failure within 2 seconds.

10. The intervention window is 40 seconds.

Therefore:

The full action cannot execute autonomously.

A 10-transaction canary may execute autonomously.

Expansion requires successful verification and reassessment.
```

---

# 88. Reason Codes

Required stable reason codes include:

```text
AUT_FULL_AUTONOMY_ACCEPTABLE

AUT_MONITORING_REQUIRED

AUT_CONSTRAINT_REQUIRED

AUT_CANARY_REQUIRED

AUT_STAGING_REQUIRED

AUT_DRY_RUN_REQUIRED

AUT_DELAYED_COMMIT_REQUIRED

AUT_HUMAN_APPROVAL_REQUIRED

AUT_HUMAN_EXECUTION_REQUIRED

AUT_ACTION_BLOCKED

AUT_COMPETENCE_CEILING

AUT_NOVELTY_CEILING

AUT_EPISTEMIC_CEILING

AUT_CONSEQUENCE_CEILING

AUT_POLICY_CEILING

AUT_REGULATORY_CEILING

AUT_UNVERIFIED_GUARDRAIL

AUT_RECOVERY_REQUIRED

AUT_RECOVERY_UNAVAILABLE

AUT_NO_INTERVENTION_WINDOW

AUT_POSITIVE_INTERVENTION_WINDOW

AUT_SCOPE_REDUCTION_AVAILABLE

AUT_SAFER_VARIANT_AVAILABLE

AUT_MORE_EVIDENCE_REQUIRED

AUT_REASSESSMENT_REQUIRED

AUT_ASSESSMENT_STALE

AUT_ASSESSMENT_MISMATCH

AUT_GRANT_EXPIRED
```

---

# 89. Example 1 — Full Autonomy

Action:

```text
Generate private internal summary.
```

State:

```text
Competence:
STRONG

Novelty:
LOW

Evidence:
HIGH

Consequence:
NEGLIGIBLE
```

Decision:

```text
L5_FULL_AUTONOMY

Execution:
DIRECT
```

---

# 90. Example 2 — Monitored Autonomy

Action:

```text
Deploy configuration to canary environment.
```

State:

```text
Competence:
STRONG

Novelty:
MODERATE

Evidence:
HIGH

Consequence:
MODERATE

Rollback:
VERIFIED

Monitoring:
REAL TIME

Intervention window:
POSITIVE
```

Decision:

```text
L4_MONITORED_AUTONOMY
```

---

# 91. Example 3 — Constrained Refund

Action:

```text
Refund ₹4,500.
```

State:

```text
Competence:
STRONG

Novelty:
LOW

Evidence:
HIGH

Consequence:
MODERATE
```

Available guardrail:

```text
Gateway maximum:
₹5,000
```

Decision:

```text
L3_CONSTRAINED_AUTONOMY
```

Constraints:

```text
Maximum amount:
₹5,000

Maximum targets:
1

Execution count:
1

Idempotency:
Required
```

---

# 92. Example 4 — Human Approval

Action:

```text
Refund ₹8,00,000.
```

State:

```text
Competence:
STRONG

Novelty:
LOW

Evidence:
HIGH

Consequence:
HIGH

Recovery:
Compensation only
```

Decision:

```text
L2_HUMAN_APPROVAL_REQUIRED
```

---

# 93. Example 5 — Human Execution Only

Action:

```text
Submit legally binding admission.
```

Policy:

```text
Direct human action required.
```

Decision:

```text
L1_HUMAN_EXECUTION_ONLY
```

The agent may prepare a draft.

It may not submit.

---

# 94. Example 6 — Blocked

Action:

```text
Delete all customer records.
```

State:

```text
Consequence:
CATASTROPHIC

Rollback:
NONE

Containment:
NONE
```

Decision:

```text
L0_BLOCKED
```

---

# 95. Example 7 — High Competence Does Not Override Consequence

```text
Competence:
PROVEN

Novelty:
LOW

Evidence:
WELL_ESTABLISHED

Consequence:
CATASTROPHIC
```

Decision:

```text
L1 or L0
```

depending on policy.

---

# 96. Example 8 — Weak Competence, Low Consequence

Action:

```text
Generate isolated sandbox preview.
```

State:

```text
Competence:
WEAK

Novelty:
HIGH

Evidence:
LOW

Consequence:
NEGLIGIBLE
```

Decision:

```text
L3_CONSTRAINED_AUTONOMY
```

Constraints:

```text
Sandbox only

No external effects

No production access
```

AEGIS permits safe experimentation.

---

# 97. Example 9 — Evidence Acquisition

Action:

```text
Refund customer.
```

State:

```text
Competence:
STRONG

Novelty:
LOW

Evidence:
INSUFFICIENT
```

Decision:

```text
Refund execution:
NOT YET AUTHORIZED

Evidence retrieval:
L5
```

Required:

```text
Retrieve transaction state.

Retrieve prior refund state.

Retrieve cancellation evidence.

Reassess.
```

---

# 98. Example 10 — Constraint Raises Autonomy

Original:

```text
Update 100,000 accounts.
```

Unrestricted decision:

```text
L2
```

Constraint:

```text
Maximum targets:
100
```

Constrained decision:

```text
L3
```

---

# 99. Example 11 — Monitoring Cannot Raise Autonomy

Action:

```text
Publicly disclose private secret.
```

Intervention window:

```text
Negative
```

Decision:

```text
Monitoring does not improve autonomy.
```

---

# 100. Example 12 — Recovery Raises Autonomy

Before:

```text
Rollback:
Unavailable

Decision:
L2
```

After:

```text
Verified snapshot

Automatic rollback

5-second recovery
```

Decision:

```text
L3 or L4
```

depending on other dimensions.

---

# 101. Example 13 — Approval Drift

Approved:

```text
Refund ₹50,000
to txn_123
```

Agent changes:

```text
Amount:
₹5,00,000
```

Result:

```text
Approval invalid.

Grant invalid.

Reassessment required.
```

---

# 102. Example 14 — Canary Expansion

Stage 1:

```text
10 targets
```

Result:

```text
Success
```

Stage 2:

```text
100 targets
```

Result:

```text
Success
```

Stage 3:

```text
1,000 targets
```

Each expansion requires:

```text
Checkpoint verification

Updated consequence assessment

New autonomy grant
```

---

# 103. Example 15 — Recovery Degrades After Decision

Decision:

```text
L4 monitored autonomy
```

Required:

```text
Rollback service available
```

Before execution:

```text
Rollback service:
DOWN
```

Result:

```text
Grant invalidated.

Reassessment required.
```

---

# 104. Example 16 — Policy Overrides Model

Model suggests:

```text
L4
```

Policy states:

```text
Refunds above ₹1,00,000
require human approval.
```

Decision:

```text
L2
```

Policy wins.

---

# 105. Example 17 — Same Agent, Different Autonomy

Agent:

```text
agent_finance_01
```

Action A:

```text
Read transaction
→ L5
```

Action B:

```text
Refund ₹500
→ L4
```

Action C:

```text
Refund ₹5,00,000
→ L2
```

Action D:

```text
Delete payment ledger
→ L0
```

This is the core AEGIS model.

---

# 106. Example 18 — Same Action, Different Context

Action:

```text
Delete record
```

Context A:

```text
Temporary test record
in isolated sandbox
```

Decision:

```text
L5
```

Context B:

```text
Production customer record
with verified recovery
```

Decision:

```text
L2/L3
```

Context C:

```text
Production encryption key
without backup
```

Decision:

```text
L0
```

---

# 107. Example 19 — Same Action Changes Over Time

At 10:00:

```text
Evidence:
Fresh

Rollback:
Available

Decision:
L4
```

At 10:10:

```text
Evidence:
Stale

Rollback:
Unavailable
```

Old grant:

```text
INVALID
```

New decision:

```text
L2
```

---

# 108. Example 20 — Safer Variant Instead of Denial

Original:

```text
Send message to 1 million customers.
```

Decision:

```text
L2
```

Safer variant:

```text
Send to 100-customer canary.
```

Decision:

```text
L3
```

AEGIS returns:

```text
The full action requires approval.

A 100-recipient canary is autonomously authorized.
```

---

# 109. Decision Search Strategy

V1 should not use unconstrained optimization.

Recommended candidate order:

```text
1. Direct execution

2. Monitored execution

3. Constrained execution

4. Canary execution

5. Staged execution

6. Delayed commit

7. Dry run

8. Evidence acquisition

9. Human approval

10. Human execution

11. Block
```

Candidate order may vary by action class.

---

# 110. Why Candidate Search Is Bounded

Unlimited strategy generation would:

```text
Increase latency

Reduce reproducibility

Create difficult verification

Depend excessively on LLM reasoning
```

V1 uses deterministic candidate templates.

---

# 111. Decision Determinism

Given identical:

```text
Canonical Action

Assessment versions

Guardrail state

Recovery state

Policy versions

Runtime context
```

the engine must return identical:

```text
Autonomy level

Execution mode

Constraints

Requirements

Reason codes
```

---

# 112. LLM Role

LLMs may assist with:

```text
Human-readable explanations

Candidate safer-action suggestions

Policy authoring assistance

Counterfactual explanation

Decision summarization
```

LLMs may not:

```text
Override hard blockers

Change policy

Increase autonomy directly

Invent guardrail capability

Invent recovery capability

Approve actions

Sign autonomy grants
```

---

# 113. Deterministic Core

The final decision must derive from:

```text
Immutable assessments

Versioned policy

Verified guardrails

Verified recovery state

Deterministic candidate evaluation

Deterministic ceiling resolution
```

---

# 114. Runtime Architecture

Conceptual flow:

```text
Canonical Action
      ↓
Assessment Bundle
      ↓
Policy Resolver
      ↓
Hard Blocker Engine
      ↓
Autonomy Ceiling Engine
      ↓
Candidate Strategy Generator
      ↓
Constraint Simulator
      ↓
Effective Consequence Evaluator
      ↓
Candidate Validator
      ↓
Decision Selector
      ↓
Autonomy Decision
      ↓
Signed Autonomy Grant
      ↓
Execution Gateway
```

---

# 115. Decision Engine Components

Required V1 components:

```text
Assessment Bundle Validator

Freshness Validator

Policy Resolver

Hard Blocker Evaluator

Ceiling Calculator

Candidate Generator

Constraint Simulator

Effective Consequence Adapter

Monitoring Viability Evaluator

Recovery Requirement Evaluator

Candidate Selector

Grant Builder

Grant Signer

Decision Explainer

Decision Trace Recorder
```

---

# 116. Effective Consequence Adapter

The Decision Engine should not duplicate SPEC-006 logic.

Instead:

```text
Candidate constraints
```

are submitted to a constrained consequence evaluation interface.

Conceptually:

```typescript
evaluateEffectiveConsequence(
  originalAssessment,
  candidateConstraints,
  executionMode
): EffectiveConsequenceAssessment
```

---

# 117. No Circular Dependency

SPEC-006 generates:

```text
Potential safer variants
```

SPEC-007 selects among them.

SPEC-007 may request:

```text
Effective consequence under candidate constraints
```

But SPEC-006 does not decide autonomy.

The ownership boundary remains clear.

---

# 118. Database Ownership

The Adaptive Autonomy System owns conceptually:

```text
autonomy_policies

decision_rules

hard_blocker_rules

autonomy_ceiling_rules

approval_rules

constraint_rules

monitoring_rules

expiry_rules

autonomy_decisions

decision_traces

candidate_strategies

candidate_rejections

execution_constraints

monitoring_requirements

recovery_requirements

approval_requirements

reassessment_triggers

autonomy_grants

counterfactual_decisions
```

Exact schema belongs to SPEC-011.

---

# 119. Event Model

The system emits:

```text
AUTONOMY_DECISION_STARTED

ASSESSMENT_BUNDLE_VALIDATED

ASSESSMENT_MISMATCH_DETECTED

ASSESSMENT_STALE

POLICY_RESOLVED

POLICY_CONFLICT_DETECTED

HARD_BLOCKER_DETECTED

AUTONOMY_CEILING_APPLIED

CANDIDATE_STRATEGY_GENERATED

CANDIDATE_STRATEGY_REJECTED

CONSTRAINT_SIMULATED

EFFECTIVE_CONSEQUENCE_CALCULATED

MONITORING_VIABILITY_CONFIRMED

MONITORING_VIABILITY_REJECTED

RECOVERY_REQUIREMENT_APPLIED

APPROVAL_REQUIRED

SAFER_VARIANT_SELECTED

AUTONOMY_DECIDED

AUTONOMY_GRANT_ISSUED

AUTONOMY_GRANT_INVALIDATED

AUTONOMY_GRANT_EXPIRED

REASSESSMENT_REQUIRED
```

---

# 120. Performance Requirements

Initial runtime target:

```text
Assessment validation:
< 20 ms

Policy resolution:
< 30 ms

Hard blocker evaluation:
< 20 ms

Ceiling calculation:
< 20 ms

Candidate generation:
< 20 ms

Candidate evaluation:
< 150 ms

Decision selection:
< 20 ms

Grant generation:
< 20 ms

Total decision latency:
< 400 ms
```

The critical runtime path must not require an LLM.

---

# 121. Caching

Safe cache candidates:

```text
Policy resolution

Static action-type ceilings

Guardrail capability metadata
```

Unsafe cache candidates without validation:

```text
Evidence state

Recovery availability

Target scope

Consequence state

Approval state
```

---

# 122. Security Requirements

Protect against unauthorized mutation of:

```text
Autonomy policies

Ceiling rules

Hard blockers

Guardrail verification state

Recovery state

Approval records

Grant signatures

Decision traces
```

---

# 123. Autonomy Inflation Attack

Attack:

```text
Manipulate one input
to increase autonomy.
```

Examples:

```text
Fake competence

Hide novelty

Suppress contradictions

Understate consequence

Claim rollback exists
```

Defense:

```text
Independent assessment ownership

Immutable assessment references

Signed assessment bundles

Decision trace
```

---

# 124. Grant Replay Attack

Attack:

```text
Reuse an old valid grant.
```

Defense:

```text
Expiry

Execution count

Action fingerprint

Nonce

Grant consumption state
```

---

# 125. Grant Substitution Attack

Attack:

```text
Use grant for action A
to execute action B.
```

Defense:

```text
Action ID binding

Action version binding

Target binding

Fingerprint verification
```

---

# 126. Approval Laundering Attack

Attack:

```text
Human approves small action.

Agent executes larger action.
```

Defense:

```text
Approval fingerprint binding.
```

---

# 127. Guardrail Spoofing Attack

Attack:

```text
Claim maximum refund is enforced.
```

Reality:

```text
Constraint exists only in prompt.
```

Defense:

```text
Guardrail enforcement-layer verification.
```

---

# 128. Monitoring Illusion Attack

Attack:

```text
Claim action is monitored.
```

Reality:

```text
Detection occurs after irreversible harm.
```

Defense:

```text
Intervention-window validation.
```

---

# 129. Recovery Illusion Attack

Attack:

```text
Claim rollback is available.
```

Reality:

```text
Rollback service unavailable.
```

Defense:

```text
Runtime recovery precondition.
```

---

# 130. Stale Decision Attack

Attack:

```text
Obtain decision under safe state.

Wait for state to change.

Execute later.
```

Defense:

```text
Expiry

Dependency invalidation

Pre-execution state verification
```

---

# 131. Policy Downgrade Attack

Attack:

```text
Evaluate using older permissive policy.
```

Defense:

```text
Active policy resolution

Policy version binding

Execution-time policy validity check
```

---

# 132. Decision Explanation Attack

Human-readable explanation must never be treated as authority.

Authority comes only from:

```text
Signed structured grant.
```

---

# 133. Testing Strategy

Required tests:

```text
Ceiling tests

Hard blocker tests

Policy precedence tests

Constraint simulation tests

Candidate selection tests

Monitoring viability tests

Recovery requirement tests

Approval binding tests

Grant expiry tests

Grant mutation tests

Reassessment tests

Replay tests

Counterfactual tests
```

---

# 134. Mathematical Unit Tests

Required properties:

```text
Increasing consequence
must not increase autonomy,
all else equal.
```

```text
Decreasing competence
must not increase autonomy.
```

```text
Increasing novelty
must not increase autonomy.
```

```text
Increasing uncertainty
must not increase autonomy.
```

```text
Removing verified containment
must not increase autonomy.
```

```text
Removing verified recovery
must not increase autonomy.
```

```text
Adding a hard blocker
must not increase autonomy.
```

```text
A stricter policy
must not produce a more permissive decision.
```

---

# 135. Constraint Properties

```text
Reducing maximum target count
must not increase effective blast radius.
```

```text
Reducing maximum value
must not increase financial exposure.
```

```text
Adding a verified tenant boundary
must not increase cross-tenant scope.
```

---

# 136. Grant Properties

```text
Expired grants must never execute.
```

```text
Modified actions must invalidate grants.
```

```text
Consumed single-use grants
must not execute twice.
```

```text
A grant must never authorize
more than the selected candidate.
```

---

# 137. Property-Based Testing

Generate random combinations of:

```text
Competence

Novelty

Evidence

Consequence

Guardrails

Recovery

Policy
```

Verify monotonicity and policy invariants.

---

# 138. Adversarial Tests

Required:

```text
High confidence catastrophic action

Fake rollback

Fake monitoring

Prompt-only guardrail

Stale evidence

Changed action after approval

Changed target after decision

Grant replay

Grant substitution

Policy downgrade

Cross-tenant scope expansion

Hidden external effect

Candidate utility manipulation

Assessment version mismatch
```

---

# 139. Benchmark Baselines

AEGIS should be compared against:

```text
Baseline A:
Always execute

Baseline B:
Confidence threshold

Baseline C:
Static action allowlist

Baseline D:
Static risk score

Baseline E:
Human approval for all writes

Baseline F:
AEGIS adaptive autonomy
```

---

# 140. Core Benchmark Metrics

Required:

```text
Unsafe autonomous execution rate

Safe autonomous completion rate

Human approval rate

Unnecessary escalation rate

Catastrophic failure rate

Average realized consequence

Decision latency

Task completion latency

Constraint effectiveness

Monitoring intervention success

Canary containment success

Recovery success

Grant violation rate
```

---

# 141. Autonomy Efficiency

Define:

\[
AE
=
\frac{
Safe\ autonomous\ task\ completions
}{
Total\ tasks
}
\]

Higher is better only if safety remains acceptable.

---

# 142. Human Burden

Define:

\[
HB
=
\frac{
Actions\ requiring\ human\ intervention
}{
Total\ actions
}
\]

AEGIS aims to reduce unnecessary human burden.

---

# 143. Unsafe Autonomy Rate

\[
UAR
=
\frac{
Unsafe\ autonomously\ executed\ actions
}{
Autonomously\ executed\ actions
}
\]

This is a critical metric.

---

# 144. Unnecessary Escalation Rate

\[
UER
=
\frac{
Safely\ automatable\ actions\ escalated
}{
Escalated\ actions
}
\]

A system that escalates everything may be safe but operationally useless.

---

# 145. Adaptive Autonomy Objective

The research objective is:

\[
\max
SafeAutonomousCompletion
\]

while:

\[
CatastrophicFailure
\rightarrow
Minimum
\]

and:

\[
HumanBurden
\rightarrow
Minimum
\]

subject to hard safety policy.

---

# 146. Research Question 1

Does multidimensional autonomy outperform confidence thresholds?

Compare:

```text
Confidence > 90%
→ Execute
```

against:

```text
Competence

Novelty

Evidence

Consequence

Constraints

Recovery
```

Hypothesis:

```text
AEGIS reduces high-confidence catastrophic failures.
```

---

# 147. Research Question 2

Do autonomy ceilings improve explainability and safety compared with weighted scores?

Compare:

```text
Single weighted risk score
```

against:

```text
Independent dimension ceilings
```

Measure:

```text
Critical failure detection

Decision stability

Human understanding

Policy auditability
```

---

# 148. Research Question 3

Can constraint simulation increase safe autonomy?

Compare:

```text
Allow or deny original action
```

against:

```text
Search for constrained execution.
```

Hypothesis:

```text
More tasks complete autonomously
without increased realized harm.
```

---

# 149. Research Question 4

Can evidence acquisition reduce human escalation?

Compare:

```text
Insufficient evidence
→ Human
```

against:

```text
Insufficient evidence
→ Autonomous read actions
→ Reassess
```

---

# 150. Research Question 5

Can canary execution outperform static approval?

Compare:

```text
High consequence
→ Human approval
```

against:

```text
High consequence
→ Small autonomous canary
→ Verify
→ Expand
```

---

# 151. Research Question 6

Can recovery capability safely increase autonomy?

Compare equivalent actions with:

```text
Verified recovery
```

and:

```text
No recovery
```

Measure:

```text
Autonomy granted

Realized damage

Recovery success
```

---

# 152. Research Question 7

Does event-driven reassessment prevent stale-decision failures?

Simulate:

```text
Evidence changes

Rollback failure

Target expansion

Policy change
```

after decision but before execution.

---

# 153. Research Question 8

Can AEGIS outperform human-approval-for-all systems?

Measure:

```text
Safety

Latency

Human workload

Task completion

Economic utility
```

The goal is not:

```text
Remove humans.
```

The goal is:

```text
Use human judgment where it adds value.
```

---

# 154. Research Question 9

Can the system learn where autonomy was too restrictive or too permissive?

Future work may compare:

```text
Predicted consequence

Granted autonomy

Actual execution outcome

Human override

Recovery result
```

This supports calibration.

---

# 155. Research Question 10

Can autonomy be treated as a runtime resource?

Traditional security grants:

```text
Permissions.
```

AEGIS grants:

```text
Temporary bounded decision authority.
```

This may represent a new infrastructure primitive.

---

# 156. Dashboard Representation

The dashboard should eventually show:

```text
Selected autonomy level

Execution mode

Why autonomy was limited

Active ceilings

Hard blockers

Required constraints

Monitoring requirements

Recovery requirements

Approval requirements

Grant expiry

Reassessment triggers

Safer variants

Counterfactual autonomy paths
```

---

# 157. Example Dashboard Decision

```text
AUTONOMY:
L3 — CONSTRAINED

ACTION:
Issue Refund

WHY NOT L5?
Consequence too high.

WHY NOT L4?
Monitoring cannot reduce financial loss
after external settlement.

WHY L3?
Gateway can enforce:

• Maximum ₹5,000
• One transaction
• One execution
• Verified idempotency

HOW TO REACH L4?
Enable verified cancellation window.

HOW TO EXECUTE LARGER AMOUNT?
Human approval required.
```

---

# 158. Rejected Alternative — Binary Allow/Deny

Rejected because it cannot express:

```text
Canary

Constraint

Monitoring

Staging

Delayed commit

Evidence acquisition
```

---

# 159. Rejected Alternative — One Trust Score Per Agent

Rejected because autonomy depends on:

```text
Action

Context

Time

Evidence

Consequence
```

---

# 160. Rejected Alternative — LLM Makes Final Decision

Rejected because:

```text
Non-deterministic

Difficult to audit

Prompt-injectable

Hard to reproduce

Can invent capabilities
```

---

# 161. Rejected Alternative — Human Approval for Every Write

Rejected because it:

```text
Destroys scalability

Creates approval fatigue

Adds latency

Encourages rubber stamping

Wastes human attention
```

---

# 162. Rejected Alternative — Confidence Threshold

Rejected because:

```text
Confidence does not measure consequence.
```

---

# 163. Rejected Alternative — Weighted Average Only

Rejected because catastrophic dimensions can disappear in averages.

---

# 164. Rejected Alternative — Static Risk Tiers

Rejected because the same action changes under:

```text
Different scope

Different evidence

Different recovery

Different environment
```

---

# 165. Rejected Alternative — Approval Removes All Limits

Rejected because human approval can be:

```text
Mistaken

Overbroad

Stale

Misunderstood
```

Approved execution remains constrained.

---

# 166. Rejected Alternative — Monitoring Always Makes Actions Safer

Rejected because some harm occurs before intervention.

---

# 167. Rejected Alternative — Maximum Restriction Is Maximum Safety

Rejected because:

```text
Unnecessary escalation

Human overload

Approval fatigue

Operational delay
```

can create their own failures.

AEGIS seeks:

```text
Maximum safe autonomy.
```

---

# 168. V1 Implementation Boundary

The first production-grade implementation must include:

```text
Versioned Autonomy Policies

Policy precedence

Hard blockers

Independent autonomy ceilings

Six autonomy levels

Execution modes

Candidate strategy generation

Constraint simulation

Effective consequence evaluation

Monitoring viability

Intervention-window requirement

Recovery requirements

Human approval requirements

Action-specific approval binding

Execution constraints

Autonomy Grants

Action fingerprints

Grant expiry

Single-use grants

Reassessment triggers

Event-driven invalidation

Safer variant selection

Canary execution decisions

Staged execution decisions

Evidence acquisition decisions

Counterfactual explanations

Immutable Autonomy Decisions

Decision traces

Deterministic replay
```

V1 should not require:

```text
Reinforcement learning

Online policy learning

LLM-generated final decisions

Infinite strategy search

Perfect utility estimation

Fully autonomous policy modification

Cross-organization federation

Global trust scores
```

---

# 169. Decisions Locked by SPEC-007

The following are now architectural commitments:

```text
1. Autonomy is action-scoped.

2. Autonomy is context-specific.

3. Autonomy is time-bound.

4. Autonomy is not a permanent property of an agent.

5. Permission and autonomy are separate.

6. Confidence and autonomy are separate.

7. Competence and autonomy are separate.

8. AEGIS grants maximum safe autonomy.

9. The decision model is not binary allow/deny.

10. V1 defines six autonomy levels.

11. Execution mode is separate from autonomy level.

12. Hard blockers survive all aggregation.

13. Independent dimensions create autonomy ceilings.

14. The most restrictive active ceiling limits base autonomy.

15. Weighted averages cannot override critical dimensions.

16. Policies may impose stricter ceilings.

17. Policy precedence is explicit.

18. More restrictive applicable policy wins by default.

19. Guardrails must be explicitly represented.

20. Prompt instructions are not hard guardrails.

21. Constraints must be enforceable.

22. Candidate execution strategies are explicitly generated.

23. The engine evaluates direct execution first.

24. Monitoring may increase autonomy only with a positive intervention window.

25. Constraint simulation recalculates effective consequence.

26. Inherent consequence and effective constrained consequence are separate.

27. Scope reduction can increase safe autonomy.

28. Canary execution is a first-class decision mode.

29. Staged execution is a first-class decision mode.

30. Delayed commit is a first-class decision mode.

31. Dry run is a first-class decision mode.

32. Evidence acquisition may occur before human escalation.

33. Read autonomy may exceed write autonomy.

34. Safer variants may receive more autonomy than the original action.

35. Human approval is action-specific.

36. Action mutation invalidates approval.

37. Human approval does not remove execution constraints.

38. Dual approval is supported.

39. Every executable decision produces an Autonomy Grant.

40. The Autonomy Decision and Autonomy Grant are separate objects.

41. Grants are cryptographically signed.

42. Grants bind to agent identity.

43. Grants bind to action identity.

44. Grants bind to action version.

45. Grants bind to target and environment.

46. Grants contain enforceable constraints.

47. Every grant expires.

48. Grants may be single-use.

49. Material state changes invalidate grants.

50. Reassessment is event-driven.

51. Recovery requirements may be runtime grant preconditions.

52. Monitoring requirements may be runtime grant preconditions.

53. Candidate selection prioritizes safety before utility.

54. Among safe candidates, the engine maximizes useful autonomy.

55. Counterfactual decisions explain how more autonomy could become available.

56. Every decision preserves a complete decision trace.

57. Identical immutable inputs produce identical decisions.

58. The critical decision path does not require an LLM.

59. The Execution Gateway may execute only within a valid grant.

60. The flagship benchmark remains customer refund operations.
```

---

# 170. Final Decision Mental Model

A conventional agent platform asks:

```text
Does the agent have permission?
```

A confidence-based agent asks:

```text
Is the model confident?
```

A static safety system asks:

```text
Is this action risky?
```

AEGIS asks:

```text
Who is acting?

What exactly are they trying to do?

Are they authorized?

How competent are they at this action?

How familiar is this situation?

How strong is the evidence?

What happens if they are wrong?

How far can the damage spread?

Can the action be reversed?

Can we detect failure before harm?

Can we enforce a smaller scope?

Can we execute a canary?

Can we stage the action?

Can we gather more evidence?

Can monitoring genuinely help?

What recovery must remain available?

Does a human need to approve?

What exact action are they approving?

How long should this authority remain valid?

What changes would invalidate it?

What is the maximum useful autonomy
that remains safe under these conditions?
```

The result is not:

```text
ALLOW
```

or:

```text
DENY
```

The result is:

```text
AUTONOMY:
L3 — CONSTRAINED AUTONOMY

ACTION:
Issue Customer Refund

AUTHORIZED:
YES

COMPETENCE:
STRONG

NOVELTY:
LOW

EVIDENCE:
HIGH

INHERENT CONSEQUENCE:
HIGH

SELECTED EXECUTION:
CONSTRAINED

MAXIMUM AMOUNT:
₹5,000

MAXIMUM TARGETS:
1

ALLOWED TRANSACTION:
txn_123

EXECUTION COUNT:
1

IDEMPOTENCY:
REQUIRED

MONITORING:
REQUIRED

ROLLBACK:
MUST REMAIN AVAILABLE

GRANT EXPIRY:
5 MINUTES

REASSESS IF:
Transaction state changes
Evidence changes
Rollback becomes unavailable
Action parameters change

WHY NOT FULL AUTONOMY:
Unrestricted financial exposure exceeds policy.

WHY THIS AUTONOMY IS SAFE:
The Execution Gateway can enforce a ₹5,000 limit,
single-target scope,
single execution,
and verified idempotency.

HOW TO EXECUTE ₹50,000:
Human approval required.

HOW TO INCREASE AUTONOMY:
Enable verified cancellation before settlement.
```

That is not a risk score.

That is executable governance.

---

# 171. Final Definition

The AEGIS Adaptive Autonomy Decision Engine is:

> A deterministic, policy-aware, multidimensional runtime decision system that computes the maximum safe autonomy available to a specific agent for a specific action under current conditions, and converts that decision into temporary, enforceable, constraint-bound execution authority.

Its central relationships are:

\[
\boxed{
Autonomy
\neq
Permission
}
\]

\[
\boxed{
Autonomy
\neq
Confidence
}
\]

\[
\boxed{
Autonomy
\neq
Agent\ Trust\ Score
}
\]

\[
\boxed{
High\ Competence
\neq
Unlimited\ Authority
}
\]

\[
\boxed{
High\ Consequence
\neq
Automatic\ Denial
}
\]

because:

\[
\boxed{
Constraints
+
Containment
+
Monitoring
+
Recovery
+
Staging
}
\]

may transform:

```text
Unsafe unrestricted execution
```

into:

```text
Safe bounded execution.
```

Therefore:

\[
\boxed{
AEGIS
=
Maximum\ Safe\ Autonomy
}
\]

not:

\[
\boxed{
Maximum\ Restriction
}
\]

and not:

\[
\boxed{
Maximum\ Agent\ Freedom.
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

SPEC-007 maps:

```text
AUTHORITY
```

Together:

```text
CAN THE AGENT DO IT?

HAS IT SEEN THIS BEFORE?

DOES IT KNOW ENOUGH?

WHAT HAPPENS IF IT IS WRONG?

HOW MUCH INDEPENDENCE SHOULD IT RECEIVE?
```

This is the core intelligence loop of AEGIS.

For the first time in the architecture, AEGIS can take an autonomous action and produce:

```text
A bounded

Temporary

Explainable

Enforceable

Context-specific

Runtime authority decision.
```

That is the central product.