# AEGIS ARCHITECTURE DECISIONS

**Document ID:** AEGIS-ARCHITECTURE-DECISIONS
**Status:** Canonical
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Document Type:** Locked Decisions Register
**Depends On:** AEGIS-MASTER-CONTEXT, SPEC-000 through SPEC-009

---

# 0. Purpose

This document is the single register of decisions that future work is **not allowed to silently change** (`aegis-master-context.md` §80).

It does not restate the reasoning behind each decision — that reasoning lives in the specification that introduced it. This document exists so that a future contributor can scan one file and know, at a glance, every invariant, guarantee, and locked principle currently in force, and where to go to read the full justification.

Amending anything in this document requires the contradiction/amendment process defined in `AGENTS.md` §3 and `aegis-master-context.md` §71–72.

---

# 1. The Twelve System Guarantees (Master Context)

These are the highest-level guarantees. Every invariant below exists to make one or more of these true.

```text
G1  — No Anonymous Autonomy
G2  — No Unstructured Authority
G3  — No Authority Expansion During Execution
G4  — No Permanent Trust
G5  — No Permanent Authorization Assumption
G6  — No Silent Monitoring Failure
G7  — No Alert-Only Safety Model
G8  — No Stop-Equals-Stopped Assumption
G9  — No Per-Action-Only Safety Model
G10 — No LLM-Only Critical Safety Path
G11 — No Unreconstructable Critical Decision
G12 — No Silent Architectural Drift
```

Source: `aegis-master-context.md` §10.

---

# 2. SPEC-000 — Foundational Invariants

```text
INV-001  No Competence-Created Authority
INV-002  No Ungoverned Significant Execution
INV-003  Same Decision State, Same Decision (determinism)
INV-004  LLMs Cannot Grant Final Autonomy
INV-005  Every Decision Must Be Explainable
INV-006  Every Significant Decision Must Be Versioned
INV-007  Learning Cannot Rewrite History
INV-008  Outcome Does Not Equal Agent Quality
INV-009  Uncertainty Cannot Be Hidden by Confidence
INV-010  Safe Degradation (missing info degrades autonomy, never increases it)
INV-011  Evaluation and Production Must Be Separable (OFF/SHADOW/CANARY/ACTIVE)
INV-012  Autonomy Is Contextual (no universal agent_trust_score)
```

Also locked at SPEC-000: the five-question test every component must answer (§31); the three computational classes — deterministic / statistical / AI-assisted (§12); the Decision Snapshot concept (§13); Decision Freshness / execution preconditions (§14); Action Identity and canonical fingerprint (§15); the failure-class taxonomy (§16); the event-sourced audit principle (§17); one-owner-per-datum data ownership (§18); the six autonomy levels L0–L5 (§22); the autonomy-ceiling minimum model, `L_final = min(L_authority, L_competence, L_novelty, L_uncertainty, L_consequence, L_state)`, as the starting principle later refined by SPEC-007 (§23); the anti-gaming principle (§27, forward-referencing what became SPEC-016); sequence awareness (§28); multi-agent awareness (§29, forward-referencing what became SPEC-015).

Source: `handbook/SPEC-000.md`.

---

# 3. SPEC-001 — Canonical Action Model (CAM) Invariants

```text
CAM-INV-001  Every Governed Action Has One Canonical Representation
CAM-INV-002  Raw Input Is Never Destroyed
CAM-INV-003  Material Mutation Creates a New Action Version
CAM-INV-004  Provenance Must Be Preserved Per Field
CAM-INV-005  Unknown Is Not Zero
CAM-INV-006  Semantic Equivalence Must Be Possible
CAM-INV-007  Exact Execution Must Bind to Exact Action Identity
CAM-INV-008  No Silent Enrichment
CAM-INV-009  Canonicalization Must Be Versioned
CAM-INV-010  CAM Describes the Proposed Action, Not the Final Decision
```

Also locked: the five-layer action structure (Identity, Lineage/Purpose, Canonical Operation/Targets/Context, Evidence/Effects/Sequence/Execution Descriptor, Field Provenance); the canonical fingerprint and material fingerprint as distinct hashes; idempotency, simulation support, and compensation support as first-class fields on every action.

Source: `handbook/SPEC-001.md`.

---

# 4. SPEC-002 — Agent Identity Invariants

```text
AGENT-INV-001  No Anonymous Autonomy (enforced here)
AGENT-INV-002  Agent, Version and Runtime Instance Are Distinct
AGENT-INV-003  Competence Does Not Silently Transfer Across Versions
AGENT-INV-004  Lifecycle State Is Authoritative and Externally Enforced
AGENT-INV-005  Suspension and Retirement Do Not Retroactively Alter History
AGENT-INV-006  Identity Verification Precedes Everything
AGENT-INV-007  Capability Declarations Are Descriptive, Not Grants
```

Also locked: the five-state lifecycle machine (REGISTERED → ACTIVE → CONSTRAINED → SUSPENDED → RETIRED) and the rule that no transition may be self-initiated by the agent.

Source: `handbook/SPEC-002.md`.

---

# 5. SPEC-003 — Competence Topology Invariants

```text
COMP-INV-001  Competence Is Contextual
COMP-INV-002  Competence Is Agent-Specific
COMP-INV-003  Competence Is Version-Sensitive
COMP-INV-004  Competence Requires Outcomes
COMP-INV-005  Unknown Outcome Is Not Success
COMP-INV-006  More Data Does Not Mean More Relevant Data
COMP-INV-007  Similarity Must Be Versioned
COMP-INV-008  Sparse Regions Must Remain Uncertain
COMP-INV-009  Recent Degradation Must Be Detectable
COMP-INV-010  Simulation Is Not Equivalent to Production Success
COMP-INV-011  Human Rescue Is Not Full Agent Success
COMP-INV-012  Competence Cannot Grant Authority
COMP-INV-013  Competence Assessment Must Be Reproducible
```

Source: `handbook/SPEC-003.md`.

---

# 6. SPEC-004 — Novelty Invariants

```text
NOV-INV-001  Novelty Is Contextual
NOV-INV-002  Novelty Is Agent-Relative
NOV-INV-003  Unseen Does Not Mean Dangerous
NOV-INV-004  Familiar Does Not Mean Safe
NOV-INV-005  One Nearby Observation Does Not Establish Familiarity
NOV-INV-006  Large Historical Volume Does Not Eliminate Local Novelty
NOV-INV-007  Novel Combinations Matter
NOV-INV-008  Unknown Values Must Not Be Treated as Familiar
NOV-INV-009  Feature Scaling Must Be Versioned
NOV-INV-010  Distribution Shift Is Not Individual Novelty
NOV-INV-011  Historical Reference Windows Must Be Explicit
NOV-INV-012  Novelty Must Be Explainable
NOV-INV-013  Future Data Leakage Is Prohibited
NOV-INV-014  Novelty Assessment Must Be Reproducible
```

Source: `handbook/SPEC-004.md`.

---

# 7. SPEC-005 — Epistemic (Uncertainty) Invariants

```text
EPI-INV-001  Unknown Is Not False
EPI-INV-002  Missing Is Not Negative Evidence
EPI-INV-003  Repetition Does Not Create Independent Evidence
EPI-INV-004  Model Confidence Is Not Ground Truth
EPI-INV-005  Provenance Must Be Preserved
EPI-INV-006  Evidence Reliability Is Source-Relative
EPI-INV-007  Freshness Is Claim-Relative
EPI-INV-008  Contradiction Must Remain Visible
EPI-INV-009  Evidence Volume Is Not Evidence Diversity
EPI-INV-010  Critical Missingness Must Be Explicit
EPI-INV-011  Derived Claims Must Preserve Lineage
EPI-INV-012  Circular Evidence Is Prohibited
EPI-INV-013  Future Evidence Leakage Is Prohibited
EPI-INV-014  Epistemic Assessments Must Be Reproducible
```

Source: `handbook/SPEC-005.md`.

---

# 8. SPEC-006 — Consequence (Risk) Invariants

```text
CON-INV-001  Consequence Is Independent of Confidence
CON-INV-002  Reversible Is Not Harmless
CON-INV-003  Technical Rollback Is Not Full Recovery
CON-INV-004  External Disclosure Is Not Fully Reversible
CON-INV-005  Blast Radius Must Be Explicit
CON-INV-006  Potential Scope Matters
CON-INV-007  Downstream Effects Must Be Modeled
CON-INV-008  Irreversibility Must Survive Aggregation
CON-INV-009  Rollback Must Be Verified
CON-INV-010  Recovery Time Matters
CON-INV-011  Residual Harm Must Be Preserved
CON-INV-012  Consequence Must Be Context-Specific
CON-INV-013  Unknown Consequence Is Not Low Consequence
CON-INV-014  Consequence Assessment Must Be Reproducible
```

Note: CON-INV-003, CON-INV-009, CON-INV-010, and CON-INV-011 are the direct ancestors of SPEC-010 (Recovery) — that specification is where "rollback must be verified" and "residual harm must be preserved" are turned into an executable system.

Source: `handbook/SPEC-006.md`.

---

# 9. SPEC-007 — Autonomy Decision Invariants

```text
AUT-INV-001  Autonomy Is Action-Scoped
AUT-INV-002  Autonomy Is Context-Specific
AUT-INV-003  Autonomy Is Time-Bound
AUT-INV-004  Action Mutation Invalidates the Decision
AUT-INV-005  Higher Consequence Cannot Increase Autonomy
AUT-INV-006  Lower Competence Cannot Increase Autonomy
AUT-INV-007  Higher Novelty Cannot Increase Autonomy
AUT-INV-008  Greater Epistemic Uncertainty Cannot Increase Autonomy
AUT-INV-009  Stronger Verified Guardrails May Increase Autonomy
AUT-INV-010  Better Verified Recovery May Increase Autonomy
AUT-INV-011  Soft Guardrails Cannot Be Treated as Hard Boundaries
AUT-INV-012  Human Approval Does Not Remove Execution Constraints
AUT-INV-013  Critical Blockers Survive Aggregation
AUT-INV-014  Unknown Is Not Equivalent to Safe
AUT-INV-015  The Engine Must Prefer Safer Useful Execution Over Unnecessary Denial
AUT-INV-016  Every Grant Must Be Enforceable
AUT-INV-017  The Grant Must Match the Decision
AUT-INV-018  Decisions Must Be Reproducible
```

Note: AUT-INV-010 ("Better Verified Recovery May Increase Autonomy") is the formal hook by which SPEC-010's Recoverability concept is permitted to influence the autonomy ceiling — recovery capability is a favorable factor here, never a way to erase a hard blocker (AUT-INV-013).

Also locked: L0–L5 execution semantics as restated in decision terms; Autonomy Policy / Policy Scope / Policy Precedence / Policy Conflict Resolution (§26–29) — this is where "Policy and Governance Evaluation" lives, not in a separate specification.

Source: `handbook/SPEC-007.md`.

---

# 10. SPEC-008 — Execution Gateway Invariants

```text
EXE-INV-001  Complete Mediation
EXE-INV-002  No Execution Without Valid Authority
EXE-INV-003  Grant Authenticity Is Mandatory
EXE-INV-004  Grant Scope Cannot Expand
EXE-INV-005  Action Mutation Invalidates Authority
EXE-INV-006  Unknown Parameters Are Rejected
EXE-INV-007  Missing Mandatory Constraints Fail Closed
EXE-INV-008  Expired Grants Never Execute
EXE-INV-009  Exhausted Grants Never Execute
EXE-INV-010  Single-Use Grants Execute At Most Once
EXE-INV-011  Grant Consumption Must Be Atomic
EXE-INV-012  Required Runtime Dependencies Must Remain Available
EXE-INV-013  Approval Must Match the Executed Action
EXE-INV-014  Monitoring Requirements Are Preconditions
EXE-INV-015  Recovery Requirements Are Preconditions
EXE-INV-016  Enforcement Must Be Independent of Agent Honesty
EXE-INV-017  Agent-Supplied Constraints Are Not Trusted
EXE-INV-018  External Responses Must Be Preserved
EXE-INV-019  Partial Execution Must Never Be Reported as No Execution
EXE-INV-020  Every Attempt Produces an Audit Event
EXE-INV-021  The Gateway Must Fail Closed
EXE-INV-022  Retry Must Not Duplicate Side Effects
EXE-INV-023  Tool Adapters Cannot Increase Authority
EXE-INV-024  Credentials Must Never Be Returned to the Agent
EXE-INV-025  Execution Results Cannot Rewrite History
```

Note: EXE-INV-015 ("Recovery Requirements Are Preconditions") is the exact seam where SPEC-010 attaches to the Execution Gateway — a grant may require recovery readiness before execution is allowed to proceed, symmetrically with how EXE-INV-014 requires monitoring readiness.

Source: `handbook/SPEC-008.md`.

---

# 11. SPEC-009 — Runtime Sentinel Invariants

```text
MON-INV-001  Required Monitoring Must Exist Before Execution
MON-INV-002  Monitoring Must Be Independent of Agent Self-Reporting
MON-INV-003  Every Critical Signal Has a Freshness Requirement
MON-INV-004  Monitoring Blindness Is a Runtime Event
MON-INV-005  Hard Invariant Violations Override Statistical Confidence
MON-INV-006  Detection and Intervention Are Auditable
MON-INV-007  Intervention Authority Is Explicit
MON-INV-008  Monitoring Cannot Expand Agent Authority
MON-INV-009  A Failed Intervention Must Escalate
MON-INV-010  Critical Intervention Paths Must Not Depend on an LLM
MON-INV-011  Runtime State Is Monotonic Within an Evaluation Instant
MON-INV-012  Safety-Critical Signals Preserve Provenance
MON-INV-013  Signal Loss Cannot Silently Reduce Risk
MON-INV-014  Aggregate Risk Is First-Class
MON-INV-015  Runtime Intervention Must Be Faster Than the Harm Expansion Window
MON-INV-016  Intervention Effectiveness Must Be Verified
MON-INV-017  In-Flight Work Must Be Explicitly Accounted For
MON-INV-018  Unknown Runtime State Must Be Represented Explicitly
MON-INV-019  Detection Models Cannot Directly Mint Authority
MON-INV-020  Historical Baselines Must Be Tenant-Aware
MON-INV-021  Cross-Tenant Data Must Not Leak Through Monitoring
MON-INV-022  Monitoring Failure Must Have Grant-Defined Behavior
MON-INV-023  Intervention Is Idempotent Where Possible
MON-INV-024  Repeated Alerts Must Not Cause Repeated Harmful Intervention
MON-INV-025  Runtime Evidence Is Append-Only

Runtime risk states: R0_NORMAL, R1_ELEVATED, R2_CONCERNING, R3_DANGEROUS,
                      R4_CRITICAL, R_UNKNOWN
Intervention classes: I0 Observe, I1 Intensify Monitoring, I2 Constrain,
                      I3 Throttle, I4 Pause, I5 Cancel, I6 Terminate,
                      I7 Isolate, I8 Revoke, I9 Recover
```

Note: I9 (Recover) is the formal trigger into SPEC-010.

Source: `handbook/SPEC-009.md`.

---

# 12. Cross-Cutting Locked Principles

These apply across every spec above and are not owned by any single one.

```text
Authority Direction Rule — downstream safety components (Runtime
Sentinel, Execution Gateway) may reduce authority; they may never
expand it, extend expiry, add targets/tools, or mint a new grant.

No-Self-Governance Principle — an agent is never the sole authority
for its own identity, competence, risk, policy compliance, grant
validity, monitoring health, containment status, or recovery success.

Independent Observation Principle — for critical external side
effects, agent self-reporting cannot be the only observation source.

Explicit Unknown-State Principle — "no evidence" must be represented
as UNKNOWN, never silently treated as "safe."

Fail-Safe Principle — high-impact execution must not silently
degrade from governed to ungoverned when a dependency fails.

Reproducibility Principle — every important decision preserves
enough state to reconstruct what was known, which versions were
active, and why the result came out the way it did.

Versioning Principle — all safety-critical logic (models, policies,
schemas, detectors, baselines) is versioned; historical decisions
remain explainable against historical versions.

Multi-Tenant Principle — tenant boundaries apply to every category
of data listed in aegis-master-context.md §54; cross-tenant leakage
is unacceptable.

LLM Boundary — LLMs may extract, classify, summarize, and explain;
they may never be the sole authority for hard invariant evaluation,
grant signature verification, exact scope enforcement, credential
control, kill-switch activation, or containment verification.

Event-Driven Architecture Principle — major state transitions
produce structured domain events, distinct from application logs.

Evidence Feedback Loop — Decision → Grant → Execution → Observation
→ Outcome → Evidence → Future Assessment. Observed success never
automatically means "increase autonomy" — evidence quality, action
similarity, recency, sample size, risk, and policy are still
evaluated (this loop is what SPEC-013 formalizes end-to-end).
```

Source: `aegis-master-context.md` §47–58.

---

# 13. Canonical Terminology

The full list of terms that must not be silently replaced with synonyms is maintained in `aegis-master-context.md` §45. Additions made by specifications written after the master context was authored:

```text
From SPEC-010: Recovery Plan, Compensating Action, Residual Harm,
               Recoverability, Recovery Verification Receipt
From SPEC-011: Approval Request, Approval Decision, Approval Coordinator
From SPEC-012: Simulation Session, Tool Adapter, Credential Lease
From SPEC-013: Outcome Evaluation, Attribution Record, Competence Evidence
From SPEC-014: Domain Event, Event Ledger, Reconstruction Query
From SPEC-015: Delegation Chain, Originating Principal, Causal Responsibility Record
From SPEC-016: Evidence Integrity Score, Gaming Signal, Independent Outcome Source
From SPEC-017: Configuration Version, Algorithm Registry Entry, Experiment Assignment
From SPEC-018: Benchmark Run, Research Metric, Counterfactual Comparison
```

Any specification introducing a new canonical term must add it here.

---

# 14. Locked Decisions List (Extends Master Context §62)

```text
36. Recovery is triggered by Runtime Sentinel intervention class I9 and
    by direct post-incident detection outside the runtime execution
    window (SPEC-010).

37. A Recovery Plan may require a new Autonomy Grant; it is never
    self-authorizing (SPEC-010).

38. Human intervention types are explicit and distinct
    (APPROVED_WITHOUT_CHANGE, APPROVED_WITH_MODIFICATION, REJECTED,
    REQUESTED_MORE_EVIDENCE, EXECUTED_MANUALLY, CORRECTED_AGENT_DECISION,
    OVERRULED_AEGIS, EMERGENCY_STOP) and carry different evidentiary
    weight for learning (SPEC-011, restating aegis-master-context.md §25).

39. Simulation execution is never treated as equivalent to production
    execution for competence purposes (COMP-INV-010; enforced
    structurally by SPEC-012).

40. Outcome attribution must separate agent decision quality, tool
    execution quality, environmental failure, human intervention, and
    downstream system failure before touching competence evidence
    (SPEC-000 INV-008; enforced structurally by SPEC-013).

41. The Event Ledger is the single authoritative reconstruction source
    for any governance decision; application logs are not a substitute
    (SPEC-014).

42. A materially modified action cannot execute under an earlier
    contract, and this rule applies transitively through a delegation
    chain (SPEC-000 §15; extended by SPEC-015).

43. Evidence used for competence or autonomy calibration must be
    scored for gaming risk before being trusted at face value
    (SPEC-016, resolving the anti-gaming principle first stated in
    SPEC-000 §27).

44. Experimental algorithms run OFF/SHADOW/CANARY/ACTIVE and cannot
    affect production execution until explicitly promoted
    (SPEC-000 §21; enforced structurally by SPEC-017).

45. Research and benchmark measurement is isolated from production
    decision-making but shares domain definitions with it
    (SPEC-000 §20/§21; formalized by SPEC-018).
```

---

# 15. Amendment Process

See `AGENTS.md` §3 and `aegis-master-context.md` §71–72. No entry in this document may be edited without following that process and recording the correction in place.
