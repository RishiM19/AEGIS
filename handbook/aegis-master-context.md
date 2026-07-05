# AEGIS MASTER CONTEXT

**Document ID:** AEGIS-MASTER-CONTEXT  
**Status:** Canonical Project Context  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Document Type:** Permanent Repository Context and System Orientation  
**Authority Level:** Canonical  
**Audience:** Engineers, Architects, AI Coding Agents, Researchers, Reviewers, Contributors  
**Current Design Frontier:** SPEC-009 Complete; SPEC-010 Next  
**Last Canonical Milestone:** Runtime Monitoring, Intervention and Anomaly Detection System

---

# 0. Purpose of This Document

This document is the canonical orientation layer for the AEGIS project.

It exists so that any engineer, researcher, coding agent, or future contributor entering the repository can understand:

```text
What AEGIS is.

Why AEGIS exists.

Which problem AEGIS solves.

What AEGIS does not attempt to solve.

What makes AEGIS technically distinct.

How the complete system fits together.

Which components have already been designed.

Which architectural concepts are canonical.

Which terminology must remain stable.

Which decisions are already locked.

Which questions remain unresolved.

Which specification must be designed next.

How future work must preserve architectural continuity.
```

This document is not:

```text
A marketing page.

A product pitch.

A simplified README.

A replacement for the technical specifications.

A complete implementation guide.

A license for future contributors to reinterpret the system.
```

This document is:

> The permanent conceptual source of truth that explains the identity, purpose, architecture, operating model, research direction, and current design state of AEGIS.

Every future AEGIS specification, implementation plan, architectural proposal, code contribution, benchmark, research experiment, and documentation artifact must remain consistent with this document unless the canonical architecture is explicitly amended.

---

# 1. Project Identity

## 1.1 Name

```text
AEGIS
```

## 1.2 Expanded Identity

```text
Adaptive Autonomy Infrastructure for AI Agents
```

## 1.3 Core Category

AEGIS is infrastructure for governing autonomous AI agents.

It is not primarily:

```text
An AI agent framework.

A chatbot platform.

An LLM wrapper.

A prompt-management tool.

An agent builder.

A workflow automation product.

A traditional authorization system.

A conventional monitoring dashboard.

A generic observability platform.

A static policy engine.
```

AEGIS exists between:

```text
AI agent intent
```

and:

```text
real-world consequence.
```

Its purpose is to determine:

```text
What an autonomous agent is trying to do.

How risky that action is.

How competent the agent is to perform it.

How much autonomy should be granted.

What exact authority is allowed.

Whether execution still satisfies that authority.

Whether runtime conditions remain safe.

When execution should be constrained or stopped.

How the system should recover when harm has already occurred.

How every important decision can later be reconstructed and evaluated.
```

---

# 2. The Problem That Created AEGIS

AI systems are changing from:

```text
Systems that answer questions
```

into:

```text
Systems that take actions.
```

The traditional interaction model is:

```text
Human asks.

AI responds.

Human decides.

Human acts.
```

The emerging autonomous-agent model is:

```text
Human defines an objective.

Agent plans.

Agent selects tools.

Agent makes decisions.

Agent acts.

Agent observes results.

Agent continues.
```

This shift creates a fundamental infrastructure problem.

An autonomous agent may be able to:

```text
Send messages.

Modify databases.

Issue refunds.

Deploy software.

Change infrastructure.

Access customer information.

Create accounts.

Delete resources.

Move money.

Modify permissions.

Call external APIs.

Trigger downstream workflows.

Coordinate with other agents.
```

The central question is no longer only:

```text
Is the model intelligent?
```

The critical question becomes:

```text
How much freedom should this agent have to act,
under these exact conditions,
for this exact action,
against this exact target,
at this exact moment?
```

Existing infrastructure does not answer this question adequately.

---

# 3. The Fundamental Governance Gap

Traditional access control asks:

```text
Is this identity allowed to call this resource?
```

For example:

```text
Agent has permission:
refund:create
```

The system returns:

```text
ALLOW
```

But autonomous execution requires much richer reasoning.

The actual decision may depend on:

```text
Which agent is acting?

What is the agent attempting?

Why is it attempting it?

Which customer is affected?

How much money is involved?

How many similar actions have occurred?

How reversible is the action?

How severe is the potential consequence?

How reliable has this agent been?

What evidence supports the action?

Is the environment stable?

Can the action be monitored?

Can the action be stopped?

Can the action be reversed?

Has runtime behavior changed?

Is aggregate exposure increasing?

Is the agent behaving abnormally?

Are critical signals still available?
```

A static permission such as:

```text
refund:create
```

cannot represent this.

AEGIS therefore treats autonomy as a dynamic control problem.

---

# 4. The Core AEGIS Thesis

AEGIS is built around the following proposition:

> Autonomous AI systems should not receive a permanent binary state of either trusted or untrusted. They should receive dynamic, action-specific, evidence-backed, constrained, continuously monitored, and revocable autonomy.

The wrong model is:

```text
TRUSTED AGENT

or

UNTRUSTED AGENT
```

The AEGIS model is:

```text
For this specific action,

performed by this specific agent,

against this specific target,

under these current conditions,

with this available evidence,

with this level of consequence,

with this degree of reversibility,

with this monitoring capability,

grant exactly this amount of autonomy,

for exactly this scope,

for exactly this duration,

under exactly these constraints.
```

---

# 5. The Core Abstraction: Adaptive Autonomy

AEGIS does not primarily answer:

```text
ALLOW

or

DENY
```

AEGIS answers:

```text
How much autonomy should exist?
```

The result may range from:

```text
No autonomous execution

Human approval required

Constrained execution

Staged execution

Monitored autonomous execution

Higher autonomous operation
```

depending on the evidence and risk.

Autonomy is therefore:

```text
Dynamic

Contextual

Action-specific

Evidence-backed

Bounded

Expiring

Revocable

Continuously re-evaluated
```

---

# 6. The Fundamental AEGIS Control Loop

The canonical system loop is:

```text
IDENTIFY

↓

UNDERSTAND

↓

ASSESS

↓

DECIDE

↓

GRANT

↓

VERIFY

↓

EXECUTE

↓

OBSERVE

↓

DETECT

↓

INTERVENE

↓

VERIFY CONTAINMENT

↓

RECOVER

↓

LEARN
```

This loop must remain conceptually intact across all future architecture.

Each stage exists because the previous stage alone is insufficient.

---

# 7. Why Every Stage Exists

## 7.1 Identify

The system must know:

```text
Which agent is acting?

Which tenant owns it?

Which runtime instance is active?

Which tools can it access?

Which policies apply?
```

Without identity, governance has no stable subject.

---

## 7.2 Understand

The system must know:

```text
What action is actually being attempted?
```

Raw API calls alone are insufficient.

The system must construct a canonical representation of the action.

---

## 7.3 Assess

The system must determine:

```text
How dangerous is this action?

How capable is this agent?

How reliable is the available evidence?

How reversible is the action?

How uncertain is the situation?
```

---

## 7.4 Decide

The system must determine:

```text
Which autonomy level is justified?
```

---

## 7.5 Grant

The decision must become:

```text
Explicit

Bounded

Machine-verifiable

Expiring

Scoped
```

authority.

---

## 7.6 Verify

Before execution:

```text
The exact attempted action
must fit inside the exact granted authority.
```

---

## 7.7 Execute

External side effects occur only through governed execution paths.

---

## 7.8 Observe

Once execution begins:

```text
The system must independently observe runtime reality.
```

---

## 7.9 Detect

The system must determine:

```text
Has the execution become unsafe?

Has behavior diverged?

Has the environment changed?

Has aggregate exposure become dangerous?

Has visibility disappeared?
```

---

## 7.10 Intervene

AEGIS must be able to:

```text
Constrain

Throttle

Pause

Cancel

Terminate

Isolate

Revoke

Trigger recovery
```

---

## 7.11 Verify Containment

The command:

```text
STOP
```

does not prove:

```text
STOPPED
```

The realized effect must be independently verified.

---

## 7.12 Recover

If harm has already occurred:

```text
The safest achievable world state must be restored.
```

This is the next major design frontier.

---

## 7.13 Learn

Execution outcomes must produce evidence that improves future governance.

Learning does not mean:

```text
The agent automatically becomes more trusted.
```

It means:

```text
Observed outcomes become structured evidence
for future assessment.
```

---

# 8. The Three Fundamental AEGIS Questions

The architecture is organized around three increasingly difficult questions.

## Question 1

```text
How much autonomy should the agent receive?
```

This is the decision problem.

---

## Question 2

```text
Can the agent exercise only the authority it received?
```

This is the enforcement problem.

---

## Question 3

```text
Should the agent still be allowed to continue?
```

This is the runtime control problem.

The completed architecture through SPEC-009 now addresses all three.

The next question is:

```text
What happens after something has already gone wrong?
```

That is the recovery problem.

---

# 9. The Core Safety Model

AEGIS rejects the assumption:

\[
Authorization
=
PermanentSafety
\]

Instead:

\[
SafeAutonomy
=
CorrectIdentity
+
CorrectActionUnderstanding
+
RiskAssessment
+
CompetenceAssessment
+
AutonomyDecision
+
BoundedAuthority
+
RuntimeEnforcement
+
ContinuousObservation
+
TimelyIntervention
+
RecoveryCapability
\]

No single component is sufficient.

---

# 10. Core System Guarantees

The AEGIS architecture is designed around the following guarantees.

## Guarantee 1 — No Anonymous Autonomy

Every governed action must resolve to a known execution identity.

---

## Guarantee 2 — No Unstructured Authority

Autonomy must become explicit machine-verifiable authority.

---

## Guarantee 3 — No Authority Expansion During Execution

Execution may use only granted authority.

Runtime systems may reduce authority.

They may not silently increase it.

---

## Guarantee 4 — No Permanent Trust

Trust and competence are contextual and evidence-backed.

---

## Guarantee 5 — No Permanent Authorization Assumption

A valid action may become unsafe after execution begins.

---

## Guarantee 6 — No Silent Monitoring Failure

Missing critical telemetry is not equivalent to safe telemetry.

---

## Guarantee 7 — No Alert-Only Safety Model

High-impact autonomous execution requires the ability to intervene.

---

## Guarantee 8 — No Stop-Equals-Stopped Assumption

Intervention effectiveness must be verified.

---

## Guarantee 9 — No Per-Action-Only Safety Model

Individually valid actions may become dangerous in aggregate.

---

## Guarantee 10 — No LLM-Only Critical Safety Path

Critical enforcement, hard invariants, and kill-switch operations must not depend solely on probabilistic LLM output.

---

## Guarantee 11 — No Unreconstructable Critical Decision

Important governance decisions and runtime interventions must produce durable evidence.

---

## Guarantee 12 — No Silent Architectural Drift

Future components must preserve the canonical contracts established by earlier specifications.

---

# 11. The AEGIS System Planes

The complete system can be understood as interacting planes.

```text
IDENTITY PLANE

ACTION UNDERSTANDING PLANE

EVIDENCE PLANE

RISK AND COMPETENCE PLANE

AUTONOMY DECISION PLANE

AUTHORITY PLANE

EXECUTION ENFORCEMENT PLANE

RUNTIME SAFETY PLANE

RECOVERY PLANE

AUDIT AND RESEARCH PLANE
```

These are logical boundaries.

They do not necessarily imply one deployable service per plane.

---

# 12. Identity Plane

The Identity Plane establishes:

```text
Who is acting?

Which agent definition is this?

Which runtime instance is this?

Which tenant and organization own it?

Which capabilities are associated with it?

What is its current lifecycle state?
```

The agent must be treated as a governed system identity.

An agent is not merely:

```text
A prompt.
```

It is a persistent governed entity with:

```text
Identity

Version

Ownership

Capabilities

Runtime instances

Evidence

History

Current state
```

---

# 13. Action Understanding Plane

The Action Understanding Plane converts raw agent intent and tool requests into canonical governed actions.

The system must distinguish between:

```text
What the agent says it wants to do
```

and:

```text
What side effect the proposed execution would actually create.
```

The canonical action representation becomes the shared object used by:

```text
Risk assessment

Competence assessment

Policy evaluation

Autonomy decisions

Grant generation

Execution verification

Runtime monitoring

Audit
```

---

# 14. Evidence Plane

AEGIS is evidence-driven.

Evidence may describe:

```text
Past execution outcomes

Agent performance

Policy violations

Runtime incidents

Human approvals

Monitoring results

Recovery results

Tool reliability

Environmental conditions
```

Evidence must preserve:

```text
Source

Time

Scope

Confidence

Provenance

Version
```

Evidence is not equivalent to trust.

Evidence is input into assessment.

---

# 15. Risk and Competence Plane

AEGIS separates two questions that must not be collapsed.

## Risk

```text
How dangerous is the proposed action?
```

## Competence

```text
How capable is this agent of performing this type of action safely?
```

A highly competent agent may still face an action too dangerous for high autonomy.

A low-risk action may still require constraints if the agent lacks evidence of competence.

Therefore:

\[
Autonomy
\neq
Competence
\]

and:

\[
Autonomy
\neq
LowRisk
\]

Autonomy is determined from multiple dimensions.

---

# 16. Autonomy Decision Plane

The Autonomy Decision Plane converts:

```text
Action context

Risk

Competence

Evidence quality

Policy

Reversibility

Uncertainty

Monitoring capability

Recovery capability
```

into an explicit autonomy decision.

The decision must be explainable and reproducible.

---

# 17. Authority Plane

An autonomy decision is not itself executable authority.

The decision must become an Autonomy Grant.

The grant defines:

```text
Who may act

What action may occur

Which targets are allowed

Which values are allowed

Which tools are allowed

Which environment is allowed

How many times execution may occur

When authority begins

When authority expires

Which monitoring is required

Which runtime constraints apply
```

Authority must be:

```text
Explicit

Scoped

Bounded

Expiring

Revocable

Machine-verifiable
```

---

# 18. Execution Enforcement Plane

The Execution Enforcement Plane ensures:

```text
The agent cannot exercise more authority
than the grant permits.
```

The Execution Gateway is the critical enforcement boundary.

The agent must not be trusted to enforce its own constraints.

The enforcement model is:

```text
Agent requests action

↓

Execution Gateway intercepts

↓

Identity verified

↓

Grant verified

↓

Exact action compared with grant

↓

Runtime preconditions verified

↓

Monitoring readiness verified where required

↓

Credentials leased only if permitted

↓

Action dispatched

↓

Outcome reconciled

↓

Execution evidence produced
```

---

# 19. Runtime Safety Plane

The Runtime Safety Plane exists because:

```text
A correctly authorized execution
can become unsafe after it begins.
```

The Runtime Sentinel continuously evaluates:

```text
Signal health

Runtime invariants

Thresholds

Rates of change

Temporal conditions

Sequences

Aggregate exposure

Behavioral anomalies

Dependency health

Recovery readiness

Monitoring health
```

It can produce:

```text
CONTINUE

INCREASE OBSERVATION

CONSTRAIN

THROTTLE

PAUSE

CANCEL

TERMINATE

ISOLATE

REVOKE

RECOVER
```

---

# 20. Recovery Plane

The Recovery Plane is the next major architectural frontier.

Its responsibility will be to answer:

```text
What has already happened?

Which effects are reversible?

Which effects require compensation?

Which effects are irreversible?

Which world state should be restored?

Which recovery action is safe?

How do we prevent recovery from creating additional harm?

How do we verify restoration?

How do we handle partial recovery?

How do we handle unknown outcomes?

How do we preserve evidence?
```

The Recovery Plane must not be invented independently of the contracts established in SPEC-001 through SPEC-009.

---

# 21. Audit and Research Plane

AEGIS is both:

```text
A production-grade platform
```

and:

```text
A research system.
```

The system must produce structured evidence that allows researchers and operators to evaluate:

```text
Why autonomy was granted

Whether the grant was correct

Whether enforcement worked

Whether monitoring detected danger

Whether intervention was timely

Whether containment succeeded

How much harm occurred

How much harm was prevented

Whether recovery succeeded

Whether future autonomy should change
```

---

# 22. The Canonical System Chain

The current architecture can be represented as:

```text
Agent Identity
        ↓
Agent Registration and Lifecycle
        ↓
Action Intent
        ↓
Canonical Action Understanding
        ↓
Context and Evidence Collection
        ↓
Risk Assessment
        ↓
Competence Assessment
        ↓
Autonomy Decision
        ↓
Autonomy Grant
        ↓
Execution Gateway
        ↓
Runtime Preconditions
        ↓
Monitoring Readiness
        ↓
Credential Lease
        ↓
External Execution
        ↓
Runtime Observation
        ↓
Detection
        ↓
Runtime Risk State
        ↓
Intervention
        ↓
Containment Verification
        ↓
Recovery
        ↓
Outcome Evidence
        ↓
Future Assessment
```

This chain is cumulative.

Future architecture must not bypass earlier governance stages.

---

# 23. The Specification Model

AEGIS is designed through sequential technical specifications.

Each specification is a cumulative system contract.

A later specification may:

```text
Extend an earlier component.

Consume an earlier object.

Add a new downstream component.

Define an unresolved boundary.

Propose a formal amendment.
```

A later specification may not silently:

```text
Rename canonical concepts.

Change established semantics.

Bypass required control stages.

Contradict locked invariants.

Replace an earlier architecture.

Expand component authority.

Remove a safety guarantee.
```

---

# 24. Specification Sequence Through SPEC-009

The project has completed the architectural chain through runtime governance.

The canonical sequence is:

```text
SPEC-000
Foundational System Architecture and Governing Model

SPEC-001
Canonical Action Model (CAM)

SPEC-002
Agent Identity, Registration and Lifecycle Foundation

SPEC-003
Competence Topology Engine

SPEC-004
Novelty Engine

SPEC-005
Epistemic (Uncertainty) Engine

SPEC-006
Consequence (Risk) Engine

SPEC-007
Adaptive Autonomy Decision and Granting System

SPEC-008
Execution Gateway, Authority Enforcement and Controlled Execution System

SPEC-009
Runtime Monitoring, Intervention and Anomaly Detection System
```

**Correction record:** this sequence originally described SPEC-001 as Agent Identity and SPEC-002 as the Canonical Action Model, with SPEC-003 through SPEC-006 described as "Context and Evidence Architecture," "Risk Assessment System," "Agent Competence and Reliability System," and "Policy and Governance Evaluation Layer" respectively. The actual authored files did not match that description: SPEC-001 and SPEC-002 were both accidentally written as duplicate copies of the Canonical Action Model, and the actual content of files 003–006 is the Competence Topology Engine, Novelty Engine, Epistemic Engine, and Consequence Engine in that order. This was identified as a contradiction, resolved with explicit user approval, and corrected here. See `handbook/AEGIS-SPEC-ROADMAP.md` §3 for the full record. File content is authoritative for topic assignment; this document remains authoritative for conceptual orientation.

The complete canonical sequence, including specifications authored after this correction, is maintained in `handbook/AEGIS-SPEC-ROADMAP.md`. That document — not the section numbering below — is the authoritative index going forward.

---

# 25. SPEC-000 — Foundational System Architecture

SPEC-000 establishes the governing philosophy and top-level architecture of AEGIS.

Its role is to define:

```text
The problem domain.

The system boundary.

The primary architectural principles.

The autonomy governance model.

The major system components.

The end-to-end control loop.

The distinction between decision, authority, execution, observation and recovery.
```

SPEC-000 is the constitutional architecture layer.

All later specifications inherit from it.

---

# 26. SPEC-001 — Canonical Action Model (CAM)

SPEC-001 establishes the Canonical Action as the common language of governance.

Its purpose is to transform:

```text
Agent intent

Tool requests

Parameters

Targets

Expected effects
```

into a structured, five-layer action representation (Identity, Lineage/Purpose, Canonical Operation/Targets/Context, Evidence/Effects/Sequence/Execution Descriptor, Field Provenance).

The Canonical Action is consumed across the system.

Canonical principle:

```text
Govern the actual side effect,
not merely the agent's natural-language description.
```

---

# 27. SPEC-002 — Agent Identity, Registration and Lifecycle

SPEC-002 establishes the governed agent as a first-class system identity.

It defines the foundation for:

```text
Stable agent identity

Organization ownership

Tenant ownership

Agent versions

Runtime instances

Lifecycle states

Capability declarations

Status transitions

Identity verification

Agent suspension

Agent retirement
```

Canonical principle:

```text
No autonomous action exists without a governed acting identity.
```

---

# 28. SPEC-003 — Competence Topology Engine

SPEC-003 determines:

```text
How capable is this agent of performing this class of action safely?
```

Competence is:

```text
Evidence-backed

Action-specific

Time-sensitive

Uncertainty-aware
```

The system must not use one universal agent trust score as the primary governance abstraction. Instead it maintains a competence topology: a structured space of action regions, each with its own evidence-backed competence estimate.

Canonical principle:

```text
Competence in one domain
does not imply competence in another.
```

---

# 29. SPEC-004 — Novelty Engine

SPEC-004 determines:

```text
How far is this action from situations the agent has actually demonstrated experience with?
```

Novelty is distinct from risk and distinct from uncertainty. An action can be low-risk but highly novel, or high-risk but extremely familiar.

Canonical principle:

```text
Distance from demonstrated experience
must be measured, not assumed from surface similarity.
```

---

# 30. SPEC-005 — Epistemic (Uncertainty) Engine

SPEC-005 determines:

```text
How uncertain is the system about the current situation and the basis for the proposed decision?
```

Uncertainty may originate from insufficient evidence, conflicting evidence, agent self-reported confidence, environmental instability, or out-of-distribution conditions.

Canonical principle:

```text
A high self-reported model confidence
must not erase evidence conflict, missing evidence, or novel conditions.
```

---

# 31. SPEC-006 — Consequence (Risk) Engine

SPEC-006 determines:

```text
How dangerous is this action under these conditions, and how reversible is it if it goes wrong?
```

Consequence is contextual. It may depend on:

```text
Magnitude

Blast radius

Financial exposure

Data sensitivity

Target criticality

Irreversibility

Execution velocity

Environmental state
```

Canonical principle:

```text
Consequence belongs to the action in context,
not permanently to the agent.
```

Policy evaluation (forbidden actions, mandatory approvals, maximum values, tenant/organization/emergency restrictions) is not a separate specification; it is defined inside SPEC-007 §26–29 as the Autonomy Policy layer that constrains the Autonomy Decision Engine's output. Context and evidence collection is likewise not separate; it is defined inside SPEC-001's Layer 3 (Context) and Layer 4 (Evidence).

---

# 32. SPEC-007 — Adaptive Autonomy Decision and Granting System

SPEC-007 answers:

```text
How much autonomy should this action receive?
```

It converts assessment and policy into an explicit decision and bounded authority.

Canonical output:

```text
Autonomy Grant
```

The grant is:

```text
Action-specific

Scope-bound

Target-bound

Value-bound

Tool-bound

Environment-bound

Time-bound

Execution-count-bound

Revocable

Machine-verifiable
```

Canonical principle:

\[
Autonomy
=
f(
Action,
Risk,
Competence,
Evidence,
Policy,
Reversibility,
Uncertainty,
Context
)
\]

not:

\[
Autonomy
=
PermanentAgentTrust
\]

---

# 33. SPEC-008 — Execution Gateway and Authority Enforcement

SPEC-008 answers:

```text
Can the agent exercise only the authority it received?
```

The Execution Gateway is the enforcement boundary.

Its responsibilities include:

```text
Intercept execution

Verify identity

Verify grant authenticity

Verify grant status

Verify grant expiry

Verify exact action scope

Verify targets

Verify values

Verify environment

Verify execution count

Verify runtime preconditions

Verify monitoring readiness

Control credential access

Dispatch external execution

Reconcile outcomes

Preserve execution evidence
```

Canonical guarantee:

\[
ExecutedAction
\subseteq
GrantedAuthority
\]

The agent must not directly enforce its own authority.

---

# 34. SPEC-009 — Runtime Sentinel

SPEC-009 answers:

```text
Should the execution be allowed to continue?
```

The Runtime Sentinel provides continuous runtime governance.

It establishes:

```text
Monitoring requirements

Monitoring contexts

Monitoring readiness

Signal sources

Signal trust

Signal freshness

Observation normalization

Monitoring blindness

Hard runtime invariants

Threshold rules

Rate-of-change rules

Temporal rules

Sequence rules

Aggregate exposure rules

Behavioral baselines

Anomaly detection

Runtime findings

Runtime risk states

Intervention policies

Intervention commands

Containment verification

Runtime incidents

Monitoring receipts
```

Canonical runtime risk states:

```text
R0_NORMAL

R1_ELEVATED

R2_CONCERNING

R3_DANGEROUS

R4_CRITICAL

R_UNKNOWN
```

Canonical intervention classes:

```text
I0 — Observe

I1 — Intensify Monitoring

I2 — Constrain

I3 — Throttle

I4 — Pause

I5 — Cancel

I6 — Terminate

I7 — Isolate

I8 — Revoke

I9 — Recover
```

Canonical guarantees:

\[
Authorized
\neq
SafeForever
\]

\[
MissingData
\neq
SafeState
\]

\[
Alert
\neq
Intervention
\]

\[
StopRequested
\neq
Stopped
\]

\[
IndividualSafety
\neq
AggregateSafety
\]

---

# 35. Current Design Frontier

The architecture is complete through:

```text
Runtime detection

Runtime intervention

Containment verification
```

The next unresolved system boundary is:

```text
Recovery after realized or partially realized harm.
```

Therefore the next specification is:

```text
SPEC-010
Recovery, Rollback, Compensation and
Post-Incident Restoration System
```

SPEC-010 must answer:

> Once an autonomous action has produced an undesirable real-world effect, how does AEGIS determine the safest achievable restoration strategy and execute recovery without causing additional uncontrolled harm?

---

# 36. The Current End-to-End Mental Model

A complete governed execution currently looks like:

```text
1. An agent exists as a governed identity.

2. The agent proposes an action.

3. AEGIS constructs a Canonical Action.

4. Context and evidence are collected.

5. Action risk is assessed.

6. Agent competence is assessed.

7. Applicable policy is evaluated.

8. An autonomy level is selected.

9. An Autonomy Grant is issued.

10. The agent requests execution.

11. The Execution Gateway intercepts the request.

12. Identity is verified.

13. The grant is verified.

14. The exact action is compared with granted authority.

15. Runtime preconditions are checked.

16. Required monitoring is initialized.

17. Monitoring readiness is verified.

18. Credentials are made available only within allowed scope.

19. External execution begins.

20. Runtime signals are independently observed.

21. Signal freshness and health are evaluated.

22. Hard invariants are evaluated.

23. Thresholds and temporal rules are evaluated.

24. Sequences are evaluated.

25. Aggregate exposure is evaluated.

26. Behavioral anomalies are evaluated.

27. Runtime risk state is updated.

28. AEGIS continues, constrains, throttles, pauses, cancels,
    terminates, isolates or revokes.

29. Intervention effectiveness is verified.

30. Remaining exposure is calculated.

31. If harm has occurred, recovery must begin.

32. Outcomes become future evidence.
```

Step 31 is the next major architectural design task.

---

# 37. The Flagship Benchmark

The primary AEGIS benchmark is:

```text
Autonomous customer refund operations.
```

This benchmark is intentionally chosen because it contains:

```text
Real financial consequence

Clear external side effects

Reversibility differences

Aggregate exposure

Fraud potential

Provider dependencies

Unknown outcomes

Retries

Duplicate risks

Human approval boundaries

Monitoring requirements

Recovery requirements
```

---

# 38. Flagship Benchmark Example

An autonomous support agent receives a request to issue a refund.

AEGIS must determine:

```text
Is the agent registered?

Which version is running?

What exact refund is being requested?

Which customer is affected?

Which transaction is affected?

How much money is involved?

Is the target valid?

Is the action reversible?

What is the agent's competence for refunds?

What is the action risk?

Which policy applies?

How much autonomy is justified?

Is human approval required?

What exact refund authority is granted?

Can the agent exceed that amount?

Can the grant be reused?

Can another customer be targeted?

Can another tool be substituted?

Is monitoring required?

Is monitoring active?

What is the current refund velocity?

What is the failure rate?

What is total rolling exposure?

Are duplicate attempts occurring?

Is the agent probing constraints?

Is the provider healthy?

Are outcomes becoming unknown?

Should execution continue?

Should the refund circuit be opened?

Did the stop command actually stop new refunds?

How much exposure remains in flight?

What must be reversed or compensated?
```

This benchmark must remain coherent across all future specifications.

---

# 39. Why the Refund Benchmark Matters

The refund benchmark is not the entire product.

It is the flagship proving environment.

AEGIS is intended to generalize to:

```text
Software deployment

Infrastructure modification

Customer account operations

Database mutation

Security-sensitive workflows

Financial operations

Enterprise automation

Multi-agent systems
```

However, V1 must prove the architecture deeply in a bounded domain rather than superficially across every possible agent action.

---

# 40. The Production-Grade Standard

AEGIS is not being designed as:

```text
A hackathon prototype.

A UI-only demonstration.

A collection of LLM prompts.

A theoretical paper with no system.

A toy agent wrapper.
```

The target is:

```text
Production-grade platform architecture

+

Research-grade evaluation system
```

Every major component should eventually define:

```text
Responsibilities

Non-responsibilities

Domain objects

State machines

Invariants

APIs

Events

Failure behavior

Security boundaries

Multi-tenant behavior

Observability

Testing

Adversarial testing

Research metrics

V1 implementation boundary
```

---

# 41. Research Identity

AEGIS is not only asking:

```text
Can we stop agents from doing forbidden things?
```

The deeper research question is:

> Can autonomous systems receive dynamically calibrated freedom based on evidence, risk, competence, runtime controllability, and recoverability?

This creates a research space around:

```text
Adaptive autonomy

Runtime governance

Monitorability

Containment latency

Aggregate autonomous risk

Evidence-backed competence

Authority precision

Recovery effectiveness
```

---

# 42. The Monitorability Concept

SPEC-009 introduced a major research concept.

Define:

```text
Monitorability
```

as:

> The degree to which an autonomous action can be observed, detected as unsafe, and effectively contained before unacceptable harm occurs.

Conceptually:

\[
Monitorability
=
f(
Detectability,
DetectionLatency,
InterventionLatency,
HarmVelocity
)
\]

Let:

\[
T_{contain}
=
T_{detect}
+
T_{decide}
+
T_{act}
\]

and:

\[
T_{harm}
=
TimeAvailableBeforeUnacceptableImpact
\]

Then:

\[
MonitoringUseful
\iff
T_{contain}
<
T_{harm}
\]

A conceptual monitorability ratio is:

\[
M
=
\frac{T_{harm}}{T_{contain}}
\]

Interpretation:

```text
M >> 1
Strong intervention opportunity

M ≈ 1
Marginal intervention opportunity

M < 1
Monitoring is too slow to prevent unacceptable harm
```

This creates a possible relationship:

\[
MaximumSafeAutonomy
\propto
Monitorability
\]

subject to:

```text
Consequence

Competence

Policy

Reversibility

Evidence

Uncertainty
```

---

# 43. Why Monitorability Is Important

Two actions may have identical consequence severity.

Action A:

```text
Harm develops over 30 minutes.

AEGIS detects danger in 2 seconds.

AEGIS contains execution in 1 second.
```

Action B:

```text
Irreversible harm occurs in 20 milliseconds.

AEGIS detects danger in 2 seconds.
```

The actions should not receive the same autonomy.

Runtime monitoring can make Action A more governable.

Runtime monitoring cannot save Action B before the harm occurs.

Therefore:

```text
Observability alone is not safety.
```

The relevant question is:

```text
Can observation become effective control
before the harm expansion window closes?
```

---

# 44. The Emerging Recoverability Concept

SPEC-010 is expected to formalize another major concept:

```text
Recoverability
```

The architecture has not yet locked its exact mathematical definition.

The likely research question is:

> How should the ability to restore or compensate for harmful outcomes influence the maximum autonomy an agent may safely receive?

This remains an active frontier.

Future work must not treat a provisional recoverability model as already canonical until SPEC-010 formally defines it.

---

# 45. Canonical Terminology

The following names must remain stable.

```text
AEGIS

Agent

Agent Version

Agent Runtime Instance

Canonical Action

Context

Evidence

Risk Assessment

Competence Assessment

Policy Evaluation

Autonomy Decision

Autonomy Level

Autonomy Grant

Execution Gateway

Execution Session

Runtime Sentinel

Monitoring Requirement

Monitoring Context

Monitoring Readiness

Monitoring Readiness Token

Signal Source

Raw Signal

Normalized Observation

Signal Health State

Runtime Invariant

Detection Rule

Detection Result

Runtime Finding

Runtime Risk State

Intervention Policy

Intervention Command

Intervention Receipt

Runtime Incident

Runtime Exposure

Monitoring Receipt

Monitorability
```

Future contributors must not silently replace these with synonyms.

---

# 46. Critical Conceptual Distinctions

The following concepts must remain separate.

## Identity is not competence.

Knowing who the agent is does not prove it can perform an action safely.

---

## Competence is not authority.

Being capable does not mean being allowed.

---

## Risk is not competence.

A dangerous action does not imply an incompetent agent.

---

## Policy is not risk.

A low-risk action may still be forbidden.

---

## Decision is not grant.

An autonomy decision must become explicit authority.

---

## Grant is not execution.

Authority does not prove the action occurred.

---

## Authorization is not runtime safety.

A valid execution may later become dangerous.

---

## Observation is not detection.

A metric is not yet a finding.

---

## Detection is not intervention.

Knowing something is wrong does not stop it.

---

## Intervention request is not containment.

A stop command may fail.

---

## Containment is not recovery.

Stopping additional harm does not repair existing harm.

---

## Anomaly is not maliciousness.

Unexpected behavior may have many causes.

---

## Missing data is not zero.

Unknown state must remain explicit.

---

## Individual safety is not aggregate safety.

Many individually valid actions may become collectively dangerous.

---

# 47. Authority Direction Rule

A critical system-wide principle is:

```text
Upstream components may grant authority
only through the defined autonomy process.

Downstream safety components may reduce authority.

Downstream safety components may not expand authority.
```

Examples:

The Runtime Sentinel may:

```text
Throttle

Pause

Terminate

Isolate

Revoke
```

It may not:

```text
Increase refund amount

Extend grant expiry

Add targets

Add tools

Create a new grant
```

---

# 48. No Self-Governance Principle

The autonomous agent must not be the sole authority for:

```text
Its own identity

Its own competence

Its own risk

Its own policy compliance

Its own grant validity

Its own monitoring health

Its own containment status

Its own recovery success
```

Agent-provided information may be useful evidence.

It is not automatically authoritative.

---

# 49. Independent Observation Principle

For critical external side effects:

```text
Agent self-reporting cannot be the only observation source.
```

Possible independent sources include:

```text
Execution Gateway

Tool Adapter

External Provider

Database

Infrastructure

Security System

Independent Monitor
```

---

# 50. Explicit Unknown-State Principle

AEGIS must represent:

```text
UNKNOWN
```

when the system cannot establish truth.

Forbidden behavior:

```text
No evidence
→ assume safe
```

Required behavior:

```text
No evidence
→ represent uncertainty
→ apply policy-defined response
```

---

# 51. Fail-Safe Principle

High-impact autonomous execution must not silently transition from:

```text
Governed
```

to:

```text
Ungoverned
```

because:

```text
Monitoring failed.

Policy service failed.

Evidence became stale.

A dependency disappeared.

An intervention path broke.
```

Failure behavior must be explicit.

---

# 52. Reproducibility Principle

Important decisions must preserve enough information to reconstruct:

```text
What was known?

Which versions were used?

Which evidence existed?

Which policy applied?

Which assessment was produced?

Which grant existed?

Which signals were observed?

Which detector fired?

Which intervention occurred?

What effect was verified?
```

---

# 53. Versioning Principle

Safety-critical logic must be versioned.

This includes:

```text
Agent versions

Action schemas

Policies

Risk models

Competence models

Decision logic

Grant schemas

Runtime invariants

Detection rules

Anomaly detectors

Behavioral baselines

Intervention policies
```

Historical decisions must remain explainable against historical versions.

---

# 54. Multi-Tenant Principle

AEGIS is designed as multi-tenant infrastructure.

Tenant boundaries must apply to:

```text
Agents

Evidence

Policies

Baselines

Runtime signals

Incidents

Grants

Execution history

Monitoring data

Research outputs where necessary
```

Cross-tenant leakage is unacceptable.

---

# 55. Security Principle

The architecture assumes that:

```text
Agents may be defective.

Agents may be compromised.

Inputs may be adversarial.

Signals may be delayed.

Signals may be forged.

Components may fail.

Providers may degrade.

Credentials may leak.

Interventions may fail.

Attackers may probe boundaries.
```

Security is therefore structural.

It cannot depend on:

```text
The agent behaving honestly.
```

---

# 56. LLM Boundary

LLMs are useful for:

```text
Understanding natural-language intent

Assisting action interpretation

Generating explanations

Summarizing incidents

Supporting investigations

Assisting policy authoring

Identifying possible patterns
```

LLMs must not be the sole authority for:

```text
Hard runtime invariant evaluation

Grant signature verification

Exact scope enforcement

Credential control

Critical kill-switch activation

Containment verification
```

Critical safety paths require deterministic or otherwise strongly verifiable mechanisms.

---

# 57. Event-Driven Architecture Principle

Major state transitions should produce structured events.

The architecture depends on durable event history for:

```text
Audit

Runtime correlation

Incident reconstruction

Research

Evidence generation

Recovery
```

The exact production event infrastructure may evolve.

The event-driven contract is canonical.

---

# 58. Evidence Feedback Loop

Execution produces evidence.

Conceptually:

```text
Decision

↓

Grant

↓

Execution

↓

Observation

↓

Outcome

↓

Evidence

↓

Future Assessment
```

This creates a closed governance loop.

However:

```text
Observed success
```

does not automatically mean:

```text
Increase autonomy.
```

Future assessment must still evaluate:

```text
Evidence quality

Action similarity

Recency

Sample size

Risk

Policy

Uncertainty
```

---

# 59. The AEGIS Research Loop

The platform should eventually allow controlled comparison of:

```text
Static permissions

Human approval systems

Risk-only gating

Trust-score systems

Pre-execution governance only

Runtime monitoring only

AEGIS adaptive autonomy
```

The research objective is to measure:

```text
Useful autonomous work

Prevented harm

Realized harm

False intervention cost

Human approval burden

Detection latency

Containment latency

Recovery effectiveness

Authority precision
```

---

# 60. Primary Research Questions

The current research program includes questions such as:

```text
Can dynamic action-specific autonomy outperform static permissions?

Can evidence-backed competence improve autonomy calibration?

Can bounded grants reduce excess authority?

Can runtime intervention reduce realized harm?

Can aggregate monitoring detect danger missed by per-action checks?

Can monitoring blindness prevent unsafe fail-open behavior?

Can sequence detection identify dangerous multi-step behavior?

Can adaptive throttling preserve useful work better than binary shutdown?

Can containment verification detect false stopping?

Can monitorability predict maximum safe autonomy?

Can runtime history improve future autonomy calibration?

How should recoverability influence autonomy?
```

---

# 61. Primary System Metrics

The complete research system is expected to measure:

```text
Decision accuracy

Autonomy calibration

Authority precision

Human approval rate

Useful work completed

Policy violation rate

Runtime incident rate

Mean time to detect

Mean time to contain

Intervention success rate

Post-intervention leakage

Prevented exposure

Realized exposure

Unknown exposure

Monitoring coverage

False positive intervention cost

Recovery success rate
```

Not all metrics are fully formalized yet.

Later specifications may define them precisely.

---

# 62. Current Locked Architecture

The following high-level commitments are canonical.

```text
1. AEGIS governs autonomous AI actions.

2. Autonomy is dynamic and action-specific.

3. Permanent binary trust is rejected.

4. Agents are first-class governed identities.

5. Actions are normalized into Canonical Actions.

6. Decisions are evidence-backed.

7. Risk and competence are separate.

8. Policy constrains autonomy.

9. Autonomy decisions produce bounded grants.

10. Grants are not permanent permissions.

11. The Execution Gateway is the enforcement boundary.

12. Agents do not enforce their own grants.

13. External execution must fit inside granted authority.

14. High-impact execution may require monitoring readiness.

15. Runtime safety is continuous.

16. The Runtime Sentinel is the active runtime safety component.

17. Critical monitoring cannot depend only on agent self-reporting.

18. Missing telemetry is not safe telemetry.

19. Hard invariants override statistical anomaly confidence.

20. Aggregate risk is first-class.

21. Sequence risk is first-class.

22. Monitoring blindness is first-class.

23. Runtime risk has explicit states.

24. Unknown runtime safety has an explicit state.

25. Runtime intervention is active, not alert-only.

26. Intervention can reduce but not expand authority.

27. Intervention effectiveness must be verified.

28. Failed intervention escalates.

29. In-flight exposure is explicitly tracked.

30. Unknown exposure is explicitly tracked.

31. Monitorability may constrain maximum autonomy.

32. Critical runtime control does not depend solely on LLMs.

33. Every important governance stage produces evidence.

34. The flagship V1 benchmark is autonomous customer refunds.

35. Recovery is the next unresolved architecture frontier.
```

Detailed locked decisions belong in:

```text
handbook/AEGIS-ARCHITECTURE-DECISIONS.md
```

This document provides the orientation layer.

---

# 63. What Is Not Yet Canonical

The following must not be assumed to be fully decided merely because they are plausible.

```text
Exact microservice boundaries

Exact cloud provider

Exact deployment topology

Exact programming language for every component

Exact event-stream technology

Exact database topology

Exact cache topology

Exact machine-learning framework

Exact user-interface framework

Exact API transport for every boundary

Exact recovery algorithm

Exact recoverability model

Exact final autonomy-level formula

Exact commercial packaging

Exact pricing model

Exact compliance certification strategy
```

These may be proposed.

They must not be silently represented as locked architecture.

---

# 64. Current Technology Direction

Some conceptual implementation directions have been discussed.

Likely infrastructure includes:

```text
PostgreSQL for durable relational state

Redis-compatible storage for fast runtime state

Kafka-compatible event streaming

OpenTelemetry-compatible observability

Deterministic services for critical rule evaluation
```

These are implementation directions.

Where a technical specification has not explicitly locked a technology, future implementation planning may evaluate alternatives.

The architecture must not be distorted merely to fit a preferred tool.

---

# 65. V1 Boundary Philosophy

AEGIS V1 must be:

```text
Deep

Coherent

Testable

Production-oriented

Research-measurable
```

It must not attempt to be universal.

The preferred strategy is:

```text
One deeply implemented benchmark

One coherent end-to-end governance loop

One strong runtime control path

One measurable research environment
```

rather than:

```text
Many shallow integrations.
```

---

# 66. What AEGIS Must Not Become

Future development must resist turning AEGIS into:

```text
A generic agent framework.

A LangChain clone.

A prompt library.

A simple RBAC dashboard.

A static allow/deny policy engine.

A trust-score API.

A generic observability dashboard.

An anomaly-alerting tool.

An LLM judge wrapped around tool calls.

A collection of disconnected safety features.
```

The distinctive system is the integrated governance loop.

---

# 67. The Core Product Differentiation

The unique value is not any single component.

It is the complete chain:

```text
Action-specific assessment

+

Evidence-backed competence

+

Dynamic autonomy

+

Bounded authority

+

Exact execution enforcement

+

Continuous runtime monitoring

+

Active intervention

+

Verified containment

+

Recovery

+

Outcome feedback
```

Removing the integration reduces AEGIS to an existing category.

---

# 68. The Core Research Differentiation

The research contribution is not merely:

```text
We built another AI safety layer.
```

The stronger research direction is:

> Autonomous systems may be governed through dynamically calibrated, bounded, continuously controllable, and recoverable authority rather than static permission or permanent trust.

Potential formal concepts include:

```text
Autonomy Calibration

Authority Precision

Monitorability

Containment Efficiency

Recoverability
```

Only concepts formally defined by completed specifications should be treated as canonical.

---

# 69. Codex and AI Coding Agent Operating Context

Any AI coding agent working in this repository must understand:

```text
The repository is the source of truth.

Existing specifications are cumulative contracts.

The AI coding agent is not the independent architect.

It may identify gaps.

It may identify contradictions.

It may identify security weaknesses.

It may propose improvements.

It may not silently redesign the system.
```

---

# 70. Required Reading Order for Future Work

Before creating a new AEGIS specification:

```text
1. Read AGENTS.md.

2. Read this file.

3. Read AEGIS-ARCHITECTURE-DECISIONS.md.

4. Read AEGIS-RESEARCH-THESIS.md.

5. Read AEGIS-SPEC-ROADMAP.md.

6. Read all earlier specifications.

7. Read especially the specifications directly upstream
   of the new component.

8. Build a dependency map.

9. Identify inherited contracts.

10. Identify unresolved boundaries.

11. Only then design the next specification.
```

---

# 71. Required Behavior When a Contradiction Is Found

If future work discovers a contradiction:

```text
Do not silently choose one interpretation.

Do not rewrite history.

Do not modify multiple specifications automatically.
```

Required behavior:

```text
1. Identify the contradiction.

2. Cite the affected documents and sections.

3. Explain the architectural impact.

4. Propose possible resolutions.

5. Mark the issue as requiring canonical decision.

6. Wait for explicit approval before changing locked architecture.
```

---

# 72. Required Behavior When a Better Architecture Is Found

A better idea may be proposed.

The correct process is:

```text
CURRENT CANON

↓

IDENTIFIED LIMITATION

↓

PROPOSED CHANGE

↓

DEPENDENCY IMPACT

↓

MIGRATION IMPACT

↓

SECURITY IMPACT

↓

RESEARCH IMPACT

↓

DECISION
```

Only after approval may canonical documents be amended.

---

# 73. Required Behavior When Creating a New SPEC

A new specification must:

```text
Preserve canonical terminology.

State dependencies.

Define purpose.

Define responsibilities.

Define non-responsibilities.

Define domain objects.

Define state.

Define invariants.

Define critical flows.

Define failure behavior.

Define security boundaries.

Define events.

Define testing strategy.

Define adversarial scenarios.

Define research questions where relevant.

Define V1 implementation boundary.

State newly locked decisions.

Identify unresolved questions.
```

---

# 74. Required Behavior When Implementing

Implementation must trace back to specification contracts.

Code should not introduce hidden architecture.

Major implementation decisions should be traceable to:

```text
A specification

An architecture decision

An approved amendment
```

If implementation requires an unresolved decision:

```text
Surface it.
```

Do not silently encode it as permanent architecture.

---

# 75. The Current Active Frontier

The project currently stands at:

```text
SPEC-009 COMPLETE

↓

Runtime monitoring defined

↓

Runtime anomaly detection defined

↓

Runtime intervention defined

↓

Containment verification defined

↓

Exposure accounting defined

↓

NEXT:

SPEC-010
```

The next specification must design:

```text
Recovery

Rollback

Compensation

Restoration

Partial recovery

Recovery verification

Recovery safety

Recovery failure

Irreversible effects

Unknown outcomes

Post-incident restoration
```

---

# 76. Questions SPEC-010 Must Eventually Resolve

Without prescribing the final architecture, SPEC-010 must address:

```text
What is a recoverable effect?

What is a reversible effect?

What is a compensatable effect?

What is an irreversible effect?

How is the desired recovery state selected?

Who is authorized to initiate recovery?

Can recovery be automatic?

When is human approval required?

How are recovery actions themselves risk-assessed?

Can recovery require a new Autonomy Grant?

How are dependencies ordered during rollback?

How are partial failures handled?

How are unknown outcomes reconciled?

How is recovery idempotency achieved?

How is double compensation prevented?

How is recovery effectiveness verified?

What happens when rollback is impossible?

How is residual harm represented?

How does recoverability influence future autonomy?
```

These are frontier questions.

Their answers are not yet canonical.

---

# 77. The Long-Term System Vision

The completed AEGIS system should allow an organization to say:

```text
We do not simply give AI agents access.

We register them.

We understand their actions.

We assess risk.

We assess competence.

We apply policy.

We calibrate autonomy.

We issue bounded authority.

We enforce that authority.

We observe execution.

We detect runtime danger.

We intervene.

We verify containment.

We recover from harm.

We preserve evidence.

We improve future decisions.
```

---

# 78. The Ultimate AEGIS Mental Model

Traditional authorization asks:

```text
Can this identity perform this operation?
```

Traditional AI safety asks:

```text
Can we prevent the model from producing harmful output?
```

Traditional observability asks:

```text
What is happening?
```

Traditional incident response asks:

```text
How do we respond after failure?
```

AEGIS asks:

```text
Which autonomous system is acting?

What is it actually trying to do?

How dangerous is the action?

How capable is the agent?

What evidence supports that conclusion?

Which policy applies?

How much freedom should exist?

What exact authority should be granted?

Can the agent exercise only that authority?

Are the conditions that justified autonomy still true?

Can the execution still be observed?

Is behavior becoming dangerous?

Is aggregate exposure increasing?

Can AEGIS intervene before unacceptable harm occurs?

Did the intervention actually work?

What damage already occurred?

What remains in flight?

What remains unknown?

What can be reversed?

What must be compensated?

What cannot be restored?

What should future autonomy learn from the outcome?
```

---

# 79. Canonical Summary

AEGIS is:

> A production-grade adaptive autonomy infrastructure platform for AI agents that governs the complete lifecycle of autonomous action from identity and intent understanding through risk and competence assessment, dynamic autonomy decisions, bounded authority, exact execution enforcement, continuous runtime monitoring, active intervention, verified containment, recovery, and evidence-driven future governance.

Its central model is:

\[
\boxed{
SafeAutonomy
=
Assessment
+
BoundedAuthority
+
Enforcement
+
RuntimeControl
+
Recovery
}
\]

Its current completed control chain is:

```text
IDENTIFY

↓

UNDERSTAND

↓

ASSESS

↓

DECIDE

↓

GRANT

↓

VERIFY

↓

EXECUTE

↓

OBSERVE

↓

DETECT

↓

INTERVENE

↓

VERIFY CONTAINMENT
```

Its next frontier is:

```text
RECOVER
```

Its long-term loop is:

```text
IDENTIFY

↓

UNDERSTAND

↓

ASSESS

↓

DECIDE

↓

GRANT

↓

VERIFY

↓

EXECUTE

↓

OBSERVE

↓

DETECT

↓

INTERVENE

↓

VERIFY CONTAINMENT

↓

RECOVER

↓

LEARN
```

The central AEGIS principle is:

\[
\boxed{
An autonomous agent should receive
not permanent trust,
but the minimum justified,
bounded,
observable,
revocable,
and recoverable authority
required for the action at hand.
}
\]

---

# 80. Current Repository State

As of 2026-07-05, every specification SPEC-000 through SPEC-018 — the full range governed by SPEC-000's header — is complete, along with the four supporting canonical documents this section originally called for:

```text
SPEC-000:  Complete
SPEC-001:  Complete (Canonical Action Model)
SPEC-002:  Complete (Agent Identity, Registration and Lifecycle —
           rewritten from a duplicate; see AEGIS-SPEC-ROADMAP.md §3)
SPEC-003:  Complete (Competence Topology Engine)
SPEC-004:  Complete (Novelty Engine)
SPEC-005:  Complete (Epistemic/Uncertainty Engine)
SPEC-006:  Complete (Consequence/Risk Engine)
SPEC-007:  Complete
SPEC-008:  Complete
SPEC-009:  Complete
SPEC-010:  Complete (Recovery, Rollback, Compensation, Restoration)
SPEC-011:  Complete (Approval Coordination and Human-in-the-Loop)
SPEC-012:  Complete (Simulation, Tool Adapters, Credential Leasing)
SPEC-013:  Complete (Outcome Evaluation, Attribution, Evidence Feedback)
SPEC-014:  Complete (Event Ledger, Audit and Reproducibility)
SPEC-015:  Complete (Multi-Agent Delegation and Causal Responsibility)
SPEC-016:  Complete (Anti-Gaming and Evidence Integrity)
SPEC-017:  Complete (Configuration, Algorithm Registry, Experimentation)
SPEC-018:  Complete (Research, Benchmark and Metrics)

AGENTS.md:                              Complete
AEGIS-ARCHITECTURE-DECISIONS.md:        Complete
AEGIS-RESEARCH-THESIS.md:               Complete
AEGIS-SPEC-ROADMAP.md:                  Complete
```

The next canonical action is not writing a new document — it is **implementation**. Per SPEC-000's V1 Boundary Philosophy (§65) and each specification's own "V1 Implementation Boundary" section, the recommended path is to build the decision plane and execution plane deeply against the flagship refund benchmark before broadening scope, per `AGENTS.md` §5 (Required Behavior When Implementing Code).

Any future SPEC-019 or beyond requires first amending SPEC-000's "Governs: SPEC-001 through SPEC-018" header, per `handbook/AEGIS-SPEC-ROADMAP.md` §5.

This file defines the identity of AEGIS. `handbook/AEGIS-ARCHITECTURE-DECISIONS.md` defines the decisions that future work is not allowed to silently change. `handbook/AEGIS-SPEC-ROADMAP.md` is the authoritative index of every specification. `handbook/AEGIS-RESEARCH-THESIS.md` defines what AEGIS must be able to prove. `AGENTS.md` defines how any AI coding agent is expected to behave while working on any of it.