# AEGIS TECHNICAL SPECIFICATION 000

## System Architecture and Engineering Constitution

**Document ID:** AEGIS-SPEC-000  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Foundational Architecture  
**Depends On:** None  
**Governs:** SPEC-001 through SPEC-018

---

# 0. Purpose of This Specification

This document defines the architectural constitution of AEGIS.

It answers the questions that must be settled before individual components are designed:

- What exactly is AEGIS?
- What problem is it responsible for solving?
- What is outside its responsibility?
- Where does it sit between an AI agent and the real world?
- What information must enter the system?
- What decisions may be probabilistic?
- What decisions must be deterministic?
- Which components are allowed to use an LLM?
- Which components must never delegate final authority to an LLM?
- What system invariants can never be violated?
- How does an action travel through the platform?
- Which component owns which data?
- How does the system fail safely?
- How does AEGIS remain reproducible and auditable?
- How will the architecture support future research without destabilizing the production runtime?

This specification is authoritative.

Any future implementation decision that conflicts with this specification must be explicitly documented as an Architecture Decision Record.

---

# 1. System Definition

AEGIS is an execution-control infrastructure layer for autonomous AI agents.

An AI agent proposes actions.

AEGIS determines the maximum degree of independence under which each proposed action may proceed.

AEGIS does not primarily answer:

> Is this agent allowed to use this tool?

AEGIS answers:

> Given the authority delegated to this agent, its demonstrated competence for this kind of action, the novelty and uncertainty of the current situation, and the consequences of failure, how independently may this action proceed right now?

The core system function is:

\[
\mathcal{D}(a,x,o,c,h,s)
\rightarrow
(L,\Gamma)
\]

Where:

\[
a = \text{agent identity and version}
\]

\[
x = \text{proposed canonical action}
\]

\[
o = \text{originating objective and delegated authority}
\]

\[
c = \text{current execution context}
\]

\[
h = \text{historical evidence}
\]

\[
s = \text{current system state}
\]

The output is:

\[
L = \text{maximum permitted autonomy level}
\]

and:

\[
\Gamma = \text{Adaptive Autonomy Contract}
\]

The Adaptive Autonomy Contract is the immutable decision artifact explaining the conditions under which the action may or may not proceed.

---

# 2. The Core Problem

Current AI-agent systems generally rely on one or more of the following mechanisms:

```text
Static permissions

Role-based access control

Tool allowlists

Human approval gates

Hard-coded monetary limits

LLM-based safety judgments

Prompt-based instructions

Global trust scores

Post-execution observability
```

These mechanisms solve important problems, but they do not answer the central question of autonomous operation.

Consider two agents.

```text
Agent A

10,000 relevant historical actions
99.1% demonstrated success
Low uncertainty
Highly familiar task
Reversible action
Small blast radius
```

```text
Agent B

12 relevant historical actions
66.7% demonstrated success
High uncertainty
Novel task
Partially irreversible action
Large blast radius
```

Both agents may possess the same formal permission:

```text
refund_customer
```

A traditional authorization system may allow both.

AEGIS must not treat them equally.

AEGIS therefore introduces a distinction between:

```text
AUTHORITY

What the agent is legitimately permitted to attempt.
```

and:

```text
AUTONOMY

How independently the agent may perform the permitted action.
```

This distinction is foundational.

Authority is delegated.

Autonomy is dynamically determined.

Competence can influence autonomy.

Competence can never create authority.

---

# 3. The AEGIS Control Principle

Every governed real-world action follows this principle:

```text
NO SIGNIFICANT ACTION MAY REACH AN EXTERNAL EFFECTOR
WITHOUT FIRST RECEIVING AN AEGIS EXECUTION DECISION.
```

The required path is:

```text
AGENT
  │
  │ proposes action
  ▼
AEGIS INTERCEPTION BOUNDARY
  │
  ▼
ACTION NORMALIZATION
  │
  ▼
AUTHORITY VALIDATION
  │
  ▼
CONTEXTUAL ASSESSMENT
  │
  ▼
AUTONOMY DECISION
  │
  ▼
ADAPTIVE AUTONOMY CONTRACT
  │
  ▼
ENFORCEMENT
  │
  ▼
EXTERNAL EFFECTOR
  │
  ▼
OUTCOME OBSERVATION
  │
  ▼
ATTRIBUTION
  │
  ▼
LEARNING
```

The external effector may be:

```text
An API

A database

An email system

A payment system

A CRM

A file system

An MCP tool

Another AI agent

A production infrastructure service

A human workflow
```

AEGIS is not useful if an agent can bypass it and directly access governed effectors.

Therefore the production architecture must enforce mediation structurally, not merely by prompting the agent to behave correctly.

---

# 4. What AEGIS Is

AEGIS is simultaneously five things.

## 4.1 An Interception Layer

It captures proposed actions before real-world execution.

## 4.2 A Contextual Competence System

It estimates what an agent has demonstrated that it can do reliably.

## 4.3 An Adaptive Autonomy Decision System

It decides the appropriate execution mode for the current action.

## 4.4 An Enforcement Runtime

It ensures that the action cannot proceed beyond the granted autonomy level.

## 4.5 A Learning System

It observes outcomes and updates future estimates of contextual competence.

These responsibilities form one closed control loop:

```text
PROPOSE
   ↓
ASSESS
   ↓
DECIDE
   ↓
CONTRACT
   ↓
ENFORCE
   ↓
OBSERVE
   ↓
ATTRIBUTE
   ↓
LEARN
   ↓
PROPOSE AGAIN
```

---

# 5. What AEGIS Is Not

The project must resist uncontrolled scope expansion.

AEGIS is not:

```text
An AI-agent framework

A replacement for LangGraph

A replacement for an LLM provider

A generic workflow engine

A general-purpose authorization platform

A prompt management platform

A model evaluation dashboard

A generic observability platform

A full enterprise identity provider

A replacement for OAuth

A replacement for RBAC

A general-purpose SIEM

A generic fraud detection system

A universal compliance platform

An AI model training platform
```

AEGIS may integrate with these systems.

It must not attempt to replace them.

Its unique responsibility is:

> Dynamic control of agent autonomy at action-execution time.

---

# 6. The Fundamental Separation of Concerns

The architecture must preserve six different concepts.

They must never be collapsed into one generic “risk score.”

## 6.1 Authority

Question:

> Is this agent legitimately allowed to attempt this action?

Authority is based on:

```text
Delegation

Scope

Intent

Constraints

Hard policy
```

Output:

```text
AUTHORIZED

or

NOT AUTHORIZED
```

Authority is a hard boundary.

---

## 6.2 Competence

Question:

> How successfully has this specific agent demonstrated performance on actions similar to this one?

Competence is contextual.

The same agent may have:

```text
0.98 competence

for:

Small domestic duplicate-charge refunds
```

and:

```text
0.31 competence

for:

Large international fraud disputes
```

There is no universal agent trust score.

---

## 6.3 Novelty

Question:

> How far is this action from situations represented in the agent's demonstrated experience?

An action may be low-risk but highly novel.

An action may also be high-risk but extremely familiar.

Novelty and consequence are different variables.

---

## 6.4 Uncertainty

Question:

> How uncertain is the system about the current situation and the basis for the proposed decision?

Uncertainty may originate from:

```text
Insufficient evidence

Conflicting evidence

Agent uncertainty

Environmental instability

Missing data

Out-of-distribution conditions
```

Novelty and uncertainty are related but must remain distinct.

---

## 6.5 Consequence

Question:

> If this action is wrong, what can happen?

Consequence includes:

```text
Magnitude

Blast radius

External visibility

Data sensitivity

Financial impact

Operational impact

Recovery difficulty
```

---

## 6.6 Reversibility

Question:

> If the action is wrong, how completely and how quickly can its effects be undone?

An action can be:

```text
Fully reversible

Operationally reversible

Compensatable

Partially reversible

Practically irreversible

Fundamentally irreversible
```

Reversibility must never be treated as a simple Boolean.

---

# 7. System Invariants

The following rules are non-negotiable.

## INV-001 — No Competence-Created Authority

High competence cannot grant authority.

Formally:

\[
Authority(x)=0
\Rightarrow
AutonomyLevel(x)=L0
\]

No other engine may override this result.

---

## INV-002 — No Ungoverned Significant Execution

A governed action may not reach an external effector without an AEGIS decision.

---

## INV-003 — Same Decision State, Same Decision

Given identical:

```text
Canonical action

Authority state

Historical evidence snapshot

Configuration version

Model versions

System state
```

the deterministic decision core must produce the same result.

---

## INV-004 — LLMs Cannot Grant Final Autonomy

An LLM may:

```text
Extract context

Classify semantic intent

Summarize evidence

Identify possible consequences

Generate explanations
```

An LLM may not independently issue the final autonomy level.

The final decision must pass through deterministic policy and decision logic.

---

## INV-005 — Every Decision Must Be Explainable

AEGIS must preserve enough evidence to answer:

```text
What did the agent want to do?

Why did it want to do it?

Who authorized the objective?

Which delegation matched?

What competence evidence was used?

What historical actions influenced the estimate?

How novel was the action?

What uncertainty existed?

What consequences were predicted?

What autonomy state existed?

Which rule or threshold produced the final decision?

Which versions of algorithms and configuration were active?
```

---

## INV-006 — Every Significant Decision Must Be Versioned

Every contract must identify:

```text
Canonical Action Model version

Authority Engine version

Competence Engine version

Novelty Engine version

Uncertainty Engine version

Consequence Engine version

Autonomy Algorithm version

Configuration version
```

Without this, historical decisions cannot be reproduced.

---

## INV-007 — Learning Cannot Rewrite History

New outcomes may change future competence estimates.

They may not alter the original decision record.

Historical contracts are immutable.

---

## INV-008 — Outcome Does Not Equal Agent Quality

A successful final outcome does not automatically mean the agent made a good decision.

A failed final outcome does not automatically mean the agent made a bad decision.

Outcome attribution must separate:

```text
Agent decision quality

Tool execution quality

Environmental failure

Human intervention

Downstream system failure

Final task outcome
```

---

## INV-009 — Uncertainty Cannot Be Hidden by Confidence

A high self-reported model confidence must not erase:

```text
Evidence conflict

Missing evidence

Novel conditions

Environmental anomalies
```

---

## INV-010 — Safe Degradation

If a required assessment component fails, the system must reduce autonomy.

It must never increase autonomy because information is missing.

Conceptually:

```text
Missing competence estimate
→ degrade

Unavailable consequence service
→ degrade

Unknown tool metadata
→ degrade

Expired delegation state
→ deny or degrade

Corrupt historical evidence
→ degrade
```

The exact degradation matrix will be specified later.

---

## INV-011 — Evaluation and Production Must Be Separable

Experimental algorithms may run in shadow mode.

They may generate alternative decisions.

They may not influence production execution until explicitly promoted.

---

## INV-012 — Autonomy Is Contextual

AEGIS must never expose a single universal number called:

```text
agent_trust_score
```

Any summary shown in the UI must be derived from contextual competence regions and clearly identified as an aggregate.

---

# 8. The Core Domain Objects

AEGIS will revolve around a small number of authoritative objects.

## 8.1 Principal

The entity from which authority originates.

Examples:

```text
User

Organization

System administrator

Authorized service
```

---

## 8.2 Agent

A versioned autonomous actor.

Identity must include more than a display name.

```text
agent_id

agent_version

model configuration

tool configuration

system prompt version

runtime configuration
```

Changing an agent's model or critical instructions may change its competence profile.

Therefore:

```text
RefundAgent v3
```

and:

```text
RefundAgent v4
```

must not automatically be treated as identical performers.

The exact competence-transfer rules will be designed later.

---

## 8.3 Intent

The high-level reason for a task.

Example:

```text
Resolve legitimate duplicate-payment complaints.
```

---

## 8.4 Objective

A concrete task derived from an intent.

Example:

```text
Resolve complaint CASE-829.
```

---

## 8.5 Delegation

The authority granted from one actor to another.

Example:

```text
Principal:
Operations Manager

Delegate:
RefundAgent-v4

Permitted capability:
refund_customer

Constraint:
amount <= ₹25,000

Context:
duplicate-payment cases

Validity:
2026-07-01 to 2026-12-31
```

---

## 8.6 Proposed Action

The raw request made by an agent.

Example:

```text
refund_customer(
    customer_id = "cust_829",
    amount = 18400
)
```

---

## 8.7 Canonical Action

The normalized AEGIS representation of the proposed action.

This becomes the common input to all assessment engines.

---

## 8.8 Assessment

A versioned analytical result produced by one engine.

Examples:

```text
Authority Assessment

Competence Assessment

Novelty Assessment

Uncertainty Assessment

Consequence Assessment
```

---

## 8.9 Autonomy State

The current state affecting how independently the agent may operate.

This may include:

```text
Available autonomy budget

Reserved autonomy budget

Temporary restrictions

Active degradation state

Recent failure pressure

Current operational mode
```

---

## 8.10 Adaptive Autonomy Contract

The immutable decision artifact that binds:

```text
Action

Authority

Assessments

Autonomy state

Decision

Conditions

Execution mode
```

---

## 8.11 Execution Attempt

The actual attempt to enforce the contract.

One contract may eventually have multiple execution attempts under controlled retry rules.

---

## 8.12 Observation

A fact recorded about execution or downstream effects.

---

## 8.13 Outcome

The evaluated result of an action.

---

## 8.14 Attribution

The determination of which factors deserve credit or blame for the outcome.

---

## 8.15 Competence Evidence

The historical evidence created after attribution and used in future competence estimation.

---

# 9. The End-to-End Decision Pipeline

The complete synchronous decision path is:

```text
1. RECEIVE PROPOSED ACTION

2. AUTHENTICATE AGENT

3. RESOLVE OBJECTIVE

4. VALIDATE REQUEST STRUCTURE

5. NORMALIZE ACTION

6. VERIFY DELEGATED AUTHORITY

7. FREEZE DECISION SNAPSHOT

8. RETRIEVE RELEVANT COMPETENCE EVIDENCE

9. ESTIMATE CONTEXTUAL COMPETENCE

10. ESTIMATE NOVELTY

11. ESTIMATE UNCERTAINTY

12. ESTIMATE CONSEQUENCES

13. LOAD CURRENT AUTONOMY STATE

14. COMPUTE ACTION AUTONOMY REQUIREMENT

15. COMPUTE MAXIMUM PERMITTED AUTONOMY

16. SELECT EXECUTION LEVEL

17. CREATE ADAPTIVE AUTONOMY CONTRACT

18. COMMIT CONTRACT

19. ENFORCE CONTRACT

20. OBSERVE EXECUTION

21. EVALUATE OUTCOME

22. ATTRIBUTE RESULT

23. CREATE COMPETENCE EVIDENCE

24. UPDATE FUTURE AUTONOMY STATE
```

Steps 1 through 18 form the decision plane.

Steps 19 and 20 form the execution plane.

Steps 21 through 24 form the learning plane.

This separation is architectural.

---

# 10. The Three Planes of AEGIS

## 10.1 Decision Plane

Responsible for answering:

> Under what autonomy conditions may this action proceed?

Contains:

```text
Gateway

Action Normalizer

Authority Engine

Competence Engine

Novelty Engine

Uncertainty Engine

Consequence Engine

Autonomy Engine

Contract Engine
```

The decision plane must be low-latency, reproducible, and safe under partial failure.

---

## 10.2 Execution Plane

Responsible for:

```text
Enforcing autonomy level

Calling external tools

Running simulations

Routing approvals

Applying execution restrictions

Recording side effects

Managing compensating actions
```

The execution plane must never silently expand the contract.

If a contract authorizes:

```text
refund ₹18,400 to customer 829
```

the execution plane cannot transform that into:

```text
refund ₹20,000 to customer 829
```

A materially changed action requires a new decision.

---

## 10.3 Learning Plane

Responsible for:

```text
Observing outcomes

Evaluating correctness

Separating agent error from infrastructure error

Attributing intervention effects

Creating competence evidence

Updating contextual competence estimates

Updating autonomy state
```

The learning plane operates after execution.

It must never modify the historical decision that already occurred.

---

# 11. Component Architecture

The logical system contains the following components:

```text
AEGIS

├── 01 Agent Gateway
├── 02 Identity Resolver
├── 03 Objective Resolver
├── 04 Action Normalizer
├── 05 Authority Engine
├── 06 Decision Snapshot Manager
├── 07 Competence Topology Engine
├── 08 Novelty Engine
├── 09 Uncertainty Engine
├── 10 Consequence Engine
├── 11 Autonomy State Manager
├── 12 Adaptive Autonomy Engine
├── 13 Contract Engine
├── 14 Enforcement Runtime
├── 15 Approval Coordinator
├── 16 Simulation Runtime
├── 17 Tool Adapter Layer
├── 18 Observation Collector
├── 19 Outcome Evaluation Engine
├── 20 Attribution Engine
├── 21 Competence Evidence Writer
├── 22 Event Ledger
├── 23 Configuration Registry
├── 24 Algorithm Registry
├── 25 Research and Benchmark Harness
└── 26 Dashboard
```

These are logical components.

They must not immediately become 26 independent microservices.

The first production version will use a modular architecture with strong internal boundaries.

Service extraction will occur only when justified by:

```text
Independent scaling

Fault isolation

Different runtime requirements

Independent deployment

Security boundary

Research isolation
```

This prevents premature distributed-system complexity.

---

# 12. Deterministic, Statistical, and AI Responsibilities

AEGIS must distinguish three computational classes.

## 12.1 Deterministic Components

These must produce reproducible results from identical inputs.

Examples:

```text
Schema validation

Delegation constraint evaluation

Hard policy evaluation

Budget accounting

Threshold application

Decision-level selection

Contract generation

Version resolution

Enforcement
```

---

## 12.2 Statistical Components

These may estimate probabilities but must remain reproducible from frozen inputs and algorithm versions.

Examples:

```text
Bayesian competence estimation

Similarity-weighted evidence aggregation

Credible intervals

Novelty estimation

Anomaly estimation

Calibrated uncertainty estimation
```

---

## 12.3 AI-Assisted Components

LLMs or embedding models may assist with:

```text
Semantic action classification

Intent extraction

Unstructured evidence interpretation

Semantic similarity

Consequence candidate extraction

Human-readable explanations
```

Every AI-derived field used in a decision must include:

```text
model identifier

model version

prompt/template version

input reference

output

confidence or validation status

fallback behavior
```

AI-derived information must not be silently treated as ground truth.

---

# 13. The Decision Snapshot

One of the most important architectural objects is the Decision Snapshot.

The problem is temporal inconsistency.

Suppose:

```text
10:00:00.000

Action enters AEGIS.
```

During assessment:

```text
10:00:00.100

Competence history updates.
```

Then:

```text
10:00:00.200

Delegation changes.
```

Then:

```text
10:00:00.300

Autonomy budget changes.
```

If each engine reads a different moment of system state, the final decision may be internally inconsistent.

Therefore AEGIS must establish a logically consistent decision snapshot.

The snapshot records:

```text
decision_snapshot_id

action version

delegation state version

competence evidence cutoff

autonomy state version

configuration version

algorithm versions

timestamp
```

All assessment engines must evaluate against that snapshot.

The contract must reference it.

This enables reproducibility.

---

# 14. Decision Freshness

A decision cannot remain valid forever.

Suppose AEGIS approves:

```text
Refund ₹18,400
```

but execution happens 40 minutes later.

During those 40 minutes:

```text
The customer may already have been refunded.

The delegation may have been revoked.

The account may have entered fraud review.

The agent may have been suspended.

The external environment may have changed.
```

Therefore every contract requires a validity window.

Conceptually:

```text
created_at

valid_from

valid_until

execution_preconditions
```

Immediately before external execution, AEGIS must verify:

```text
Contract not expired

Action unchanged

Agent identity unchanged

Critical preconditions still true

No revocation event exists
```

If material state changed, the action must be reassessed.

---

# 15. Action Identity and Mutation

An action is defined by more than its tool name.

The following are different actions:

```text
refund(customer=829, amount=18400)
```

and:

```text
refund(customer=829, amount=18500)
```

Therefore the normalized action receives a canonical fingerprint.

Conceptually:

\[
fingerprint =
Hash(
CanonicalActionCriticalFields
)
\]

The contract binds to this fingerprint.

Any material mutation invalidates the authorization to execute.

This prevents:

```text
Agent receives approval for a small action

↓

Parameters change after approval

↓

Larger action executes under old approval
```

---

# 16. Failure Philosophy

AEGIS must distinguish between failure classes.

## 16.1 Assessment Failure

Example:

```text
Competence Engine unavailable
```

Response:

```text
Do not assume competence.

Reduce autonomy according to degradation policy.
```

---

## 16.2 Authority Failure

Example:

```text
Delegation cannot be validated.
```

Response:

```text
Do not execute autonomously.
```

Authority uncertainty is treated more strictly than competence uncertainty.

---

## 16.3 Execution Failure

Example:

```text
Payment API times out.
```

Response depends on:

```text
Idempotency

Known side effects

Retry safety

External confirmation

Compensation availability
```

---

## 16.4 Observation Failure

Example:

```text
AEGIS cannot determine whether the refund actually completed.
```

Response:

```text
Mark outcome unresolved.

Do not update competence.

Prevent unsafe duplicate retry.

Escalate reconciliation.
```

---

## 16.5 Learning Failure

Example:

```text
Attribution Engine unavailable.
```

Response:

```text
Preserve raw observations.

Delay competence update.

Do not infer success or failure automatically.
```

A learning failure must never corrupt competence history.

---

# 17. Event-Sourced Audit Principle

AEGIS must preserve the important transitions that explain system behavior.

Examples:

```text
ACTION_PROPOSED

ACTION_NORMALIZED

AUTHORITY_EVALUATED

COMPETENCE_ESTIMATED

NOVELTY_ESTIMATED

UNCERTAINTY_ESTIMATED

CONSEQUENCE_ESTIMATED

AUTONOMY_DECIDED

CONTRACT_CREATED

CONTRACT_ENFORCED

EXECUTION_STARTED

TOOL_CALLED

TOOL_RESPONDED

SIDE_EFFECT_OBSERVED

HUMAN_INTERVENED

OUTCOME_EVALUATED

ATTRIBUTION_COMPLETED

COMPETENCE_EVIDENCE_CREATED

AUTONOMY_STATE_UPDATED
```

The event ledger is not the same thing as application logs.

Logs answer:

> What did the software process do?

The event ledger answers:

> What happened in the AEGIS domain?

---

# 18. Data Ownership

Each authoritative piece of data must have one owner.

```text
Agent Registry
owns agent identity and version metadata.

Intent System
owns intents and objectives.

Delegation System
owns delegated authority.

Action System
owns canonical actions.

Competence System
owns competence evidence and estimates.

Autonomy State Manager
owns current autonomy state.

Contract System
owns Adaptive Autonomy Contracts.

Execution System
owns execution attempts.

Observation System
owns observations.

Outcome System
owns outcome evaluations.

Attribution System
owns attribution records.

Event Ledger
owns immutable domain events.
```

Other components may reference this data.

They must not silently maintain conflicting copies.

---

# 19. Core Persistence Architecture

The initial authoritative database is PostgreSQL.

PostgreSQL is responsible for:

```text
Transactional state

Relational integrity

Contracts

Delegations

Actions

Execution attempts

Outcomes

Attributions

Version metadata

Audit references
```

pgvector is used for:

```text
Semantic action representations

Similarity search

Historical evidence retrieval

Novelty support
```

Redis is used only for transient operational concerns such as:

```text
Short-lived caching

Distributed coordination

Temporary locks

Rate limiting

Worker coordination
```

Redis must not be the sole authoritative store for:

```text
Contracts

Delegations

Competence evidence

Outcome attribution

Autonomy decisions
```

---

# 20. Initial Runtime Architecture

The first implementation uses a modular monorepo.

```text
aegis/
│
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── demo-agent/
│
├── packages/
│   ├── contracts/
│   ├── sdk-typescript/
│   ├── shared-schemas/
│   └── test-fixtures/
│
├── aegis_core/
│   ├── actions/
│   ├── authority/
│   ├── competence/
│   ├── novelty/
│   ├── uncertainty/
│   ├── consequences/
│   ├── autonomy/
│   ├── contracts/
│   ├── execution/
│   ├── outcomes/
│   ├── attribution/
│   └── ledger/
│
├── research/
│   ├── experiments/
│   ├── benchmarks/
│   ├── simulations/
│   └── notebooks/
│
├── infrastructure/
│
└── docs/
```

This structure is conceptual at SPEC-000.

Exact repository and package definitions will be locked in the implementation architecture specification.

The important principle is:

```text
Production runtime

and

Research experimentation
```

must share domain definitions but remain operationally isolated.

---

# 21. Research Isolation

AEGIS is intended to be both:

```text
A production-grade platform

and

A research-grade experimental system
```

These goals can conflict.

Therefore every experimental autonomy algorithm must support:

```text
OFF

SHADOW

CANARY

ACTIVE
```

In SHADOW mode:

```text
Production Algorithm
→ makes real decision

Experimental Algorithm
→ sees same frozen snapshot
→ produces alternative decision
→ cannot affect execution
```

The system can then compare:

```text
Production decision

Experimental decision

Actual outcome

Counterfactual expected behavior
```

This architecture is essential for safely improving the Autonomy Budget algorithm.

---

# 22. Autonomy Levels

The platform begins with six autonomy levels.

```text
L0 — DENY

The action may not proceed.
```

```text
L1 — HUMAN EXECUTES

The agent may provide context, but the action itself must be performed by a human.
```

```text
L2 — AGENT DRAFTS

The agent may prepare the proposed action, but a human performs final execution.
```

```text
L3 — AGENT SIMULATES

The agent may run the action in a non-production or predictive environment. Real execution requires approval.
```

```text
L4 — GUARDED EXECUTION

The agent may execute under explicit safeguards such as compensation, checkpoints, restricted parameters, or immediate intervention capability.
```

```text
L5 — AUTONOMOUS EXECUTION

The agent may execute without per-action human approval.
```

These levels represent execution semantics.

They are not merely UI labels.

Each level must map to enforceable runtime behavior.

---

# 23. Autonomy Ceiling and Autonomy Decision

The system must distinguish:

```text
MAXIMUM POSSIBLE AUTONOMY
```

from:

```text
FINAL GRANTED AUTONOMY
```

Example:

```text
Delegation allows maximum L5.

Competence supports L5.

Consequence limits action to L4.

Uncertainty limits action to L3.

Current autonomy state supports L4.
```

Final decision:

```text
L3
```

Conceptually:

\[
L_{final}
=
\min(
L_{authority},
L_{competence},
L_{novelty},
L_{uncertainty},
L_{consequence},
L_{state}
)
\]

This minimum-ceiling model is only a starting architectural principle.

SPEC-007 will determine whether the production algorithm uses pure ceilings, budget admission, hybrid constraints, or another formal mechanism.

The important invariant is:

> A favorable factor must not erase a hard limiting factor.

Extremely high competence must not cancel extreme irreversibility.

---

# 24. The Autonomy Budget Is Not a Permission System

The Autonomy Budget must never mean:

```text
Agent has 100 points.

Therefore agent may do anything costing less than 100.
```

Authority still comes first.

The budget only operates inside the authorized action space.

The correct relationship is:

```text
AUTHORITY
defines what may be considered.

AUTONOMY ENVELOPE
defines the maximum independence possible.

AUTONOMY BUDGET
determines whether current independent capacity is sufficient.

CONTRACT
defines the exact execution conditions.
```

---

# 25. Human Intervention Model

Humans are not a generic fallback.

AEGIS must record the type of intervention.

Examples:

```text
APPROVED_WITHOUT_CHANGE

APPROVED_WITH_MODIFICATION

REJECTED

REQUESTED_MORE_EVIDENCE

EXECUTED_MANUALLY

CORRECTED_AGENT_DECISION

OVERRULED_AEGIS

EMERGENCY_STOP
```

These events have different meanings for learning.

For example:

```text
Human approved without change
```

does not automatically prove the agent was correct.

Likewise:

```text
Human rejected
```

does not automatically prove the agent was wrong.

Outcome evidence must still be evaluated.

---

# 26. Security Trust Boundaries

The architecture contains several major trust boundaries.

```text
BOUNDARY A

External Agent
→ AEGIS Gateway
```

Threats:

```text
Forged agent identity

Malformed actions

Replay attacks

Parameter manipulation
```

```text
BOUNDARY B

AEGIS Decision Plane
→ Execution Plane
```

Threats:

```text
Contract tampering

Decision substitution

Parameter mutation

Expired execution
```

```text
BOUNDARY C

Execution Plane
→ External Tool
```

Threats:

```text
Credential misuse

Unexpected side effects

Tool compromise

Response forgery
```

```text
BOUNDARY D

Observation
→ Learning
```

Threats:

```text
False success signals

Poisoned competence evidence

Manipulated outcomes

Agent gaming
```

The fourth boundary is especially important.

An agent that can influence the evidence used to measure its own competence could attempt to earn greater autonomy.

Therefore competence evidence must come from independently validated outcome sources whenever possible.

This problem will be formally addressed in SPEC-016.

---

# 27. The Anti-Gaming Principle

AEGIS must assume that autonomy metrics can create incentives.

Possible gaming behavior includes:

```text
Choosing only easy tasks to inflate success rates

Avoiding uncertain tasks

Manipulating outcome reports

Splitting dangerous actions into apparently small actions

Repeatedly attempting near-identical low-risk actions to farm competence

Selecting favorable evidence

Hiding failed intermediate steps
```

Therefore future algorithms must consider:

```text
Evidence independence

Action diversity

Difficulty adjustment

Repeated-action discounting

Failure visibility

Sequence-level effects

Outcome source trust
```

A simple success counter is prohibited.

---

# 28. Sequence Awareness

Individual actions cannot always be evaluated independently.

Consider:

```text
Action 1:
Read customer 1

Action 2:
Email customer 1

Action 3:
Read customer 2

Action 4:
Email customer 2
```

Each action may be low-risk.

But repeated 100,000 times, the sequence has enormous blast radius.

Therefore AEGIS must eventually support:

```text
Per-action assessment

Task-level cumulative assessment

Sequence-level budget consumption

Rate-aware consequence escalation
```

V1 may implement a constrained version.

The architecture must not prevent future sequence-aware autonomy.

---

# 29. Multi-Agent Awareness

An action may originate from a chain:

```text
Human
  ↓
Coordinator Agent
  ↓
Research Agent
  ↓
Decision Agent
  ↓
Execution Agent
```

AEGIS must preserve:

```text
Original principal

Originating intent

Delegation path

Immediate actor

Upstream agent dependencies
```

The final executing agent's competence does not erase weaknesses earlier in the chain.

Multi-agent causal responsibility will be designed in later specifications.

---

# 30. Success Criteria for the Architecture

SPEC-000 is successful only if the final system can eventually demonstrate all of the following:

```text
Two agents with identical permissions receive different autonomy levels because their contextual competence differs.

The same agent receives different autonomy levels for different action regions.

A highly competent agent is blocked when authority is absent.

A familiar action is escalated when evidence is contradictory.

A low-risk novel action is treated differently from a high-risk familiar action.

An irreversible action cannot gain full autonomy merely because competence is high.

A failed external API call does not incorrectly reduce agent competence.

A human-rescued bad decision does not incorrectly increase agent competence.

A historical decision can be reconstructed from its frozen evidence and versions.

An experimental algorithm can evaluate production traffic without affecting execution.

A materially modified action cannot execute under an earlier contract.

Missing assessment data causes safe degradation rather than increased autonomy.
```

---

# 31. Foundational Engineering Principle

Every future AEGIS component must answer five questions.

```text
1. What exact question does this component answer?

2. What authoritative data does it consume?

3. What exact artifact does it produce?

4. What happens when it is wrong or unavailable?

5. How can its result be reproduced and challenged?
```

If a component cannot answer these five questions, it is not ready to be implemented.

---

# 32. Final System Identity

AEGIS is not a dashboard that watches agents.

AEGIS is not a safety prompt around an LLM.

AEGIS is not a static permission system.

AEGIS is a closed-loop autonomy-control infrastructure layer.

Its core cycle is:

```text
AUTHORITY
   ↓
ASSESSMENT
   ↓
AUTONOMY
   ↓
CONTRACT
   ↓
ENFORCEMENT
   ↓
OBSERVATION
   ↓
ATTRIBUTION
   ↓
LEARNING
```

The defining principle of the system is:

> An AI agent's autonomy must be authorized in scope, earned through contextual evidence, constrained by uncertainty and consequence, explicitly contracted before execution, and continuously revised from independently observed outcomes.

That principle governs every specification that follows.