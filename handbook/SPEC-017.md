# AEGIS TECHNICAL SPECIFICATION 017

## Configuration, Algorithm Registry and Experimentation Governance

**Document ID:** AEGIS-SPEC-017
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Cross-Cutting Infrastructure Architecture
**Depends On:** AEGIS-SPEC-000 through AEGIS-SPEC-014 (cross-cutting; every specification's versioned components register here)
**Primary Owner:** Configuration Registry, Algorithm Registry
**Primary Runtime Component:** Configuration Registry, Algorithm Registry
**Consumers:** Every decision-plane and learning-plane component; Research Harness (SPEC-018)

---

# 0. Purpose of This Specification

SPEC-000 §21 requires every experimental algorithm to support OFF/SHADOW/CANARY/ACTIVE modes and states that "the exact production event infrastructure may evolve" while versioning remains canonical (SPEC-000 INV-006, INV-011). No prior specification defines the concrete registries that make this real: where a version actually lives, how a promotion from SHADOW to ACTIVE is authorized, and how configuration (as distinct from algorithm code/weights) is itself versioned.

This specification is cross-cutting infrastructure every decision-making component (SPEC-003 through SPEC-010, SPEC-013, SPEC-016) depends on for the versioning that SPEC-000 INV-006 requires of it.

---

# 1. Foundational Principle

```text
Experimental algorithms may run in shadow mode. They may generate
alternative decisions. They may not influence production execution
until explicitly promoted.
```
(SPEC-000 §21.)

---

# 2. The Problem This Specification Solves

Without this specification:

```text
"Version" is an informal convention each team applies inconsistently,
making SPEC-000 INV-006 (Every Significant Decision Must Be Versioned)
unenforceable in practice — there is no single place that can answer
"which exact Competence Engine algorithm version produced this
decision six months ago?"

A promising experimental Novelty Engine variant is deployed directly
to production because there was no structural SHADOW mode to test it
against real traffic first, risking INV-011's separation.

Two different tenants silently end up running different, undocumented
configuration versions of the same Consequence Engine thresholds,
with no record of when or why they diverged.
```

---

# 3. Position in the System

```text
Every versioned component (Competence Engine, Novelty Engine,
Epistemic Engine, Consequence Engine, Autonomy Decision Engine,
Policy layer, Recovery strategy rules, Attribution rules, Evidence
Integrity detectors, CAM canonicalization rules, Runtime Sentinel
detection rules)
          ↓  registers its versions here
ALGORITHM REGISTRY  +  CONFIGURATION REGISTRY
          ↓
Every Decision Snapshot (SPEC-000 §13) references specific entries
from these registries, not floating/implicit "latest" versions
          ↓
EXPERIMENTATION GOVERNANCE controls which version is ACTIVE
   (production-affecting) vs SHADOW (observed only) vs CANARY
   (limited production exposure) vs OFF
```

---

# 4. Core Domain Objects

## 4.1 Algorithm Registry Entry

```text
algorithmEntryId
componentName              — e.g. "CompetenceEngine", "NoveltyEngine",
                              "AutonomyDecisionEngine"
algorithmVersion
implementationReference       — code/model artifact reference
computationalClass              — DETERMINISTIC | STATISTICAL | AI_ASSISTED
                                   (per SPEC-000 §12)
registeredAt
experimentationState              — OFF | SHADOW | CANARY | ACTIVE
supersedes                          — prior algorithmEntryId, if any
```

## 4.2 Configuration Version

```text
configVersionId
componentName
configPayload              — the actual threshold/parameter set
                              (e.g. AUT-INV thresholds, policy
                              precedence rules)
tenantScope                   — GLOBAL | specific tenantId(s)
effectiveFrom
effectiveUntil                  — null if still current
approvedBy
```

## 4.3 Experiment Assignment

```text
experimentAssignmentId
algorithmEntryId
trafficScope               — which tenants/action regions this
                              assignment applies to
experimentationState          — mirrors the Algorithm Registry Entry's
                                 state at assignment time, frozen for
                                 this specific rollout
startedAt
promotionHistory[]              — ordered record of every state
                                   transition this assignment underwent
```

## 4.4 Promotion Record

```text
promotionRecordId
experimentAssignmentId
fromState
toState
approvedBy
comparisonEvidenceRef        — reference to the SHADOW/CANARY
                                comparison data that justified promotion
                                (produced by SPEC-018)
promotedAt
```

---

# 5. Invariants

## CFG-INV-001 — Every Decision-Affecting Component Version Is Registered

No component listed in SPEC-000 INV-006's versioning list may make a production decision using an algorithm or configuration version that lacks an Algorithm Registry Entry or Configuration Version record.

## CFG-INV-002 — SHADOW Cannot Affect Production Execution

An Algorithm Registry Entry in `SHADOW` state may compute an alternative decision against a real Decision Snapshot, but that decision must be structurally incapable of reaching the Contract Engine or Execution Gateway — it is recorded for comparison only (restates SPEC-000 INV-011 as an enforceable system property, not a policy expectation).

## CFG-INV-003 — Promotion Requires Explicit Approval and Comparison Evidence

A transition from `SHADOW`/`CANARY` to `ACTIVE` requires both an authorizing approval and a `comparisonEvidenceRef` pointing to actual SHADOW/CANARY performance data (produced by SPEC-018). Promotion without comparison evidence is rejected.

## CFG-INV-004 — Configuration Changes Are Versioned, Never Mutated In Place

A Configuration Version, once `effectiveFrom` has passed, is never edited. A change produces a new Configuration Version with its own `effectiveFrom`, preserving the ability to reconstruct exactly what configuration was active for any historical decision (feeds SPEC-014's reconstruction).

## CFG-INV-005 — Tenant Configuration Cannot Override a Platform-Wide Floor

Where another specification declares a platform-wide floor (e.g. SPEC-014's SAFETY_CRITICAL retention floor, SPEC-007's required V1 hard blockers), a tenant-scoped Configuration Version cannot express a value that violates that floor; such a configuration is rejected at write time, not merely at evaluation time.

## CFG-INV-006 — CANARY Exposure Is Bounded and Reversible

A `CANARY` assignment's `trafficScope` must be explicitly bounded (specific tenants/regions, never "all traffic by default"), and must be revertible to the prior `ACTIVE` entry without requiring a new decision-plane deployment.

## CFG-INV-007 — Registry Reads Must Be Snapshot-Consistent

All algorithm and configuration versions referenced by one Decision Snapshot (SPEC-000 §13) must be read as of the same snapshot instant — this specification's registries are subject to the same temporal-consistency requirement SPEC-000 §13 already imposes on the rest of the decision plane.

---

# 6. Experimentation State Machine

```text
OFF
  ↓  (registered, not yet exposed to any traffic)
SHADOW
  ↓  (comparison evidence gathered via SPEC-018, approval granted)
CANARY
  ↓  (bounded production exposure validated, approval granted)
ACTIVE
  ↓  (superseded by a newer entry, or rolled back)
OFF (retired)
```

A rollback from `ACTIVE` or `CANARY` directly to `OFF` is always permitted without the comparison-evidence requirement in CFG-INV-003 — that requirement gates promotion (moving toward more production influence), not demotion (moving toward less).

---

# 7. Failure Behavior

| Failure | Response |
|---|---|
| Configuration Registry unavailable at decision time | The affected component cannot make a new decision; per Safe Degradation (SPEC-000 INV-010), this is a hard block, not a fallback to an assumed default configuration. |
| Algorithm Registry Entry referenced by a Decision Snapshot cannot be resolved | The snapshot is invalid; the decision cannot proceed (consistent with SPEC-000 §13's snapshot-consistency requirement). |
| Promotion approval recorded without a valid `comparisonEvidenceRef` | Rejected; the promotion does not take effect. |

---

# 8. Security Boundaries

```text
BOUNDARY: Any Component → Algorithm/Configuration Registry
Threats: unauthorized promotion of an untested algorithm directly to
         ACTIVE, bypassing CFG-INV-003; a compromised deployment
         pipeline silently registering a new algorithm version with
         a falsified computationalClass to bypass LLM-boundary
         scrutiny (SPEC-000 INV-004/§56).
```

---

# 9. Events

```text
ALGORITHM_ENTRY_REGISTERED
CONFIGURATION_VERSION_CREATED
EXPERIMENT_ASSIGNMENT_CREATED
PROMOTION_APPROVED
PROMOTION_REJECTED_MISSING_EVIDENCE
ROLLBACK_EXECUTED
```

---

# 10. Testing Strategy

```text
A SHADOW-state algorithm entry must be structurally incapable of
reaching the Execution Gateway, verified by attempting to route a
SHADOW decision through the production execution path and confirming
rejection.

A promotion attempt without a comparisonEvidenceRef must be rejected
in all fault-injected promotion tests.

A tenant configuration attempting to violate a declared platform
floor must be rejected at write time, not merely flagged at
evaluation time.
```

---

# 11. Adversarial Scenarios

```text
An operator under deadline pressure attempts to promote a new
Autonomy Decision Engine variant straight from OFF to ACTIVE,
skipping SHADOW/CANARY entirely. Expected: the state machine (§6)
has no direct OFF→ACTIVE transition; this is structurally
unavailable, not merely discouraged by process.

A compromised CI/CD pipeline attempts to silently register a new
algorithm version under an existing componentName, hoping decision
snapshots referencing "latest" pick it up without explicit approval.
Expected: CFG-INV-007 requires snapshot-consistent, explicit version
references — there is no implicit "latest" resolution a silent
registration could hijack.
```

---

# 12. Research Questions

```text
What is the minimum SHADOW/CANARY exposure (volume and duration)
needed to produce statistically credible comparison evidence for a
promotion decision, per component type?
```

---

# 13. V1 Implementation Boundary

V1 must implement: the four-state experimentation state machine, snapshot-consistent registry reads, the promotion-requires-evidence rule, and configuration versioning with a platform-floor override rejection. Automated statistical promotion recommendation (as opposed to human-approved promotion using SPEC-018-produced evidence) is out of scope for V1.

---

# 14. Newly Locked Decisions

```text
1. No component may make a production decision using an unregistered
   algorithm or configuration version.

2. SHADOW-state algorithms are structurally incapable of affecting
   production execution.

3. Promotion to ACTIVE always requires explicit approval plus
   comparison evidence; demotion to OFF never requires either.

4. Tenant-scoped configuration cannot override a declared
   platform-wide floor.
```

---

# 15. Unresolved Questions

```text
Should CANARY rollout percentage/scope itself be governed by an
automated safety check (e.g. auto-rollback on a real-time metric
regression), and if so, does that check itself need its own
Algorithm Registry Entry (a governance-of-governance question)?
```
