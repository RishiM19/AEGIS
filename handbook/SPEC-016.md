# AEGIS TECHNICAL SPECIFICATION 016

## Anti-Gaming and Evidence Integrity System

**Document ID:** AEGIS-SPEC-016
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Evidence Integrity Architecture
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-003, AEGIS-SPEC-013, AEGIS-SPEC-014, AEGIS-SPEC-015
**Primary Owner:** Evidence Integrity Engine
**Primary Runtime Component:** Evidence Integrity Engine
**Consumers:** Competence Engine (SPEC-003), Autonomy Decision Engine, Research Harness, Dashboard

---

# 0. Purpose of This Specification

SPEC-000 §26 states plainly: "An agent that can influence the evidence used to measure its own competence could attempt to earn greater autonomy... This problem will be formally addressed in SPEC-016." SPEC-000 §27 (the Anti-Gaming Principle) lists the specific gaming behaviors this specification must account for. This is that specification.

This is not a duplicate of SPEC-013 (Attribution). SPEC-013 determines *what an outcome actually means*. This specification determines *whether the evidence feeding SPEC-013 and SPEC-003 can be trusted at face value*, and actively looks for patterns suggesting an agent (or an operator on its behalf) is shaping its own evidence trail.

---

# 1. Foundational Principle

```text
A simple success counter is prohibited.
```
(SPEC-000 §27.) Evidence quality is not just about correctness of individual outcomes; it is about whether the aggregate pattern of evidence has been manipulated, selected, or engineered to produce a favorable competence picture without corresponding real capability.

---

# 2. The Problem This Specification Solves

Restated from SPEC-000 §27, made concrete:

```text
An agent (or its operator) chooses only easy, low-risk, near-identical
tasks to inflate its apparent success rate, while avoiding anything
that would reveal weakness (Competence Farming).

Dangerous actions are split into a sequence of individually small
actions to stay under per-action risk thresholds while achieving the
same aggregate effect (Action Splitting — connects to SPEC-000 §28
Sequence Awareness).

Failed intermediate steps are hidden or omitted from the evidence
trail while only the final favorable state is reported (Failure
Visibility Suppression).

Evidence is selectively drawn from favorable sources while
unfavorable independent observations are quietly deprioritized
(Evidence Source Cherry-Picking).
```

---

# 3. Position in the System

```text
Competence Evidence Items (SPEC-013) and Delegation Chain records
(SPEC-015) are written
          ↓
EVIDENCE INTEGRITY ENGINE — periodic and event-triggered analysis,
   not a synchronous gate on every single decision
          ↓
GAMING SIGNAL RAISED (if a pattern is detected)
          ↓
EVIDENCE INTEGRITY SCORE ATTACHED to affected Competence Evidence
   Items (retroactively discounting them for SPEC-003's consumption,
   never deleting them — LRN-INV-004 immutability still applies)
          ↓
Consumed by SPEC-003 (competence estimates discount low-integrity
   evidence) and surfaced to Dashboard/human review
```

This is explicitly not a synchronous per-action gate (SPEC-000 §12.1's deterministic components remain the fast path); gaming detection operates over aggregate evidence patterns, which requires a window of data the single-action decision path does not have.

---

# 4. Core Domain Objects

## 4.1 Gaming Signal

```text
gamingSignalId
signalType                — see §5
affectedAgentId
affectedActionRegion         — SPEC-003 region this signal concerns
supportingEvidenceItemIds[]
detectedAt
detectionMethod                — versioned, per SPEC-000 INV-006
confidenceLevel                  — carries epistemic provenance (SPEC-005)
```

## 4.2 Evidence Integrity Score

```text
integrityScoreId
competenceEvidenceItemId    — the SPEC-013 item this score discounts
score                         — a discount multiplier applied when
                                 SPEC-003 consumes this evidence, never
                                 a deletion of the underlying item
rationale                       — which Gaming Signal(s), if any, drove
                                   this score
computedAt
```

## 4.3 Independent Outcome Source Registry

```text
sourceId
sourceType                — e.g. payment provider ledger, external
                             audit system, independent monitor
independenceLevel            — DIRECT_INDEPENDENT | PARTIALLY_INDEPENDENT
                                | AGENT_SELF_REPORTED
trustWeight
```

---

# 5. Gaming Signal Types

```text
COMPETENCE_FARMING          — statistically anomalous concentration of
                               near-identical, low-risk actions relative
                               to the agent's declared capability breadth
ACTION_SPLITTING              — a sequence of individually small actions
                                 whose aggregate effect resembles a
                                 single larger action that would have
                                 triggered stricter assessment (feeds
                                 from SPEC-009's sequence detection where
                                 available, but this specification also
                                 detects the pattern in historical
                                 evidence, not only at runtime)
FAILURE_VISIBILITY_SUPPRESSION   — evidence trail shows disproportionately
                                    few intermediate-failure observations
                                    relative to what independent sources
                                    report for comparable action regions
EVIDENCE_SOURCE_CHERRY_PICKING     — evidence disproportionately sourced
                                     from low-independence sources
                                     (AGENT_SELF_REPORTED) for a given
                                     action region, compared to what
                                     independent sources are available
DIFFICULTY_AVOIDANCE                 — statistically significant avoidance
                                       of action regions where the
                                       agent's demonstrated novelty
                                       (SPEC-004) is high, relative to
                                       its declared capabilities
```

---

# 6. Invariants

## GAME-INV-001 — Evidence Is Never Deleted, Only Discounted

Following LRN-INV-004, the Evidence Integrity Engine never deletes or edits a Competence Evidence Item. It attaches an Evidence Integrity Score that SPEC-003 applies as a discount at consumption time.

## GAME-INV-002 — Gaming Detection Requires Aggregate Evidence, Never a Single Action

No Gaming Signal may be raised from a single action or a single evidence item; every signal type in §5 requires a statistically meaningful pattern across multiple items, to avoid false-positive punishment of one unlucky or genuinely difficult action.

## GAME-INV-003 — Independent Evidence Outweighs Self-Reported Evidence

Evidence sourced from `AGENT_SELF_REPORTED` sources receives structurally lower `trustWeight` than `DIRECT_INDEPENDENT` sources for the same claim, by default, before any gaming signal is even considered.

## GAME-INV-004 — Action Diversity Is a Required Input to Competence Confidence

SPEC-003's competence estimate for a region with low action diversity (many near-identical actions, little variation) must carry a wider uncertainty band than a region with genuinely diverse demonstrated evidence, independent of whether an explicit Gaming Signal has fired — this is a standing discount, not only a reactive one.

## GAME-INV-005 — Difficulty-Adjusted Success Rate Is Required

A raw success rate is prohibited as the primary competence signal (SPEC-000 §27). Success rate must be considered jointly with the novelty (SPEC-004) and consequence (SPEC-006) profile of the actions attempted — succeeding at only easy actions does not produce the same evidence weight as succeeding across a representative difficulty distribution.

## GAME-INV-006 — Gaming Detection Must Be Reproducible and Explainable

Given the same evidence set and detector version, the same Gaming Signals must be produced (SPEC-000 INV-003/005), and each signal must cite the specific supporting evidence items.

## GAME-INV-007 — A Gaming Signal Does Not Itself Change Lifecycle State

Raising a Gaming Signal discounts evidence; it does not automatically suspend or retire an agent (SPEC-002's lifecycle state changes remain a separate, explicitly authorized decision, informed by but not automatically triggered by this specification).

---

# 7. Detection Method

Detection runs as a periodic batch process plus event-triggered re-evaluation whenever a threshold volume of new Competence Evidence Items lands for a given agent/region:

```text
1. Pull all Competence Evidence Items for an agent/region over a
   configured window.
2. Compute action diversity, source independence distribution,
   difficulty distribution, and failure-visibility ratio relative
   to the Independent Outcome Source Registry's expected baseline
   for that region.
3. Compare against a versioned statistical baseline (same
   discipline as SPEC-004's Novelty baselines — explicit historical
   reference windows, no future data leakage).
4. Raise Gaming Signals where a pattern crosses a versioned
   threshold.
5. Compute/update Evidence Integrity Scores for affected items.
6. Publish to SPEC-003 for discounted consumption and to Dashboard
   for human review.
```

---

# 8. Failure Behavior

| Failure | Response |
|---|---|
| Evidence Integrity Engine unavailable | SPEC-003 must not assume full-trust evidence in its absence; the last computed Evidence Integrity Scores remain applied, and no new evidence is granted full trust by default beyond the standing GAME-INV-003 discount for self-reported sources. |
| Independent Outcome Source Registry incomplete for a region | Baseline comparison for that region is marked low-confidence; Gaming Signals from that region carry reduced `confidenceLevel`, not full weight. |
| Detection method version mismatch across a re-run | Historical Gaming Signals are not silently recomputed under the new version; a new detection run produces new, separately versioned signals (SPEC-000 INV-007 analogue). |

---

# 9. Security Boundaries

```text
BOUNDARY: Competence Evidence / Delegation Chain Records → Evidence
          Integrity Engine
Threats: an operator with write access to evidence records attempting
         to pre-filter which evidence reaches this engine, defeating
         detection before it runs (mitigated by this engine reading
         directly from the Event Ledger, SPEC-014, rather than a
         mutable intermediate copy).
```

---

# 10. Events

```text
GAMING_SIGNAL_RAISED
EVIDENCE_INTEGRITY_SCORE_COMPUTED
EVIDENCE_INTEGRITY_SCORE_UPDATED
DETECTION_BASELINE_UPDATED
```

---

# 11. Testing Strategy

```text
A synthetic agent evidence trail engineered to farm competence via
near-identical low-risk actions must trigger COMPETENCE_FARMING
within a bounded evidence-volume threshold, in controlled simulation.

A single unlucky failure must never, by itself, trigger any Gaming
Signal (GAME-INV-002), verified by single-item fault injection.

Two detection runs against the same frozen evidence set and detector
version must produce identical Gaming Signals (GAME-INV-006).
```

---

# 12. Adversarial Scenarios

```text
An operator gradually shifts an agent's task mix toward easier
actions slowly enough to stay under a naive rate-of-change threshold.
Expected: DIFFICULTY_AVOIDANCE detection compares against the
agent's declared capability breadth (SPEC-002), not only a
short-window rate of change, catching a slow drift a naive detector
would miss.

An agent's operator attempts to re-register a new Agent Version
specifically to reset a discounted Evidence Integrity Score.
Expected: per AGENT-INV-003, competence evidence does not
automatically transfer across versions, so a new version starts with
no evidence at all — reducing autonomy, not resetting it to a
favorable state, which removes the incentive for this maneuver.
```

---

# 13. Research Questions

See `handbook/AEGIS-RESEARCH-THESIS.md` §8. Additionally:

```text
What is the false-positive rate of each Gaming Signal type against
a benchmark of agents that are difficult but not actually gaming,
and how should that rate inform threshold tuning?
```

---

# 14. V1 Implementation Boundary

V1 must implement: GAME-INV-003 (source-weighted trust) and GAME-INV-004/005 (diversity- and difficulty-adjusted competence) as standing discounts, plus at minimum COMPETENCE_FARMING and DIFFICULTY_AVOIDANCE detection for the flagship refund benchmark. ACTION_SPLITTING, FAILURE_VISIBILITY_SUPPRESSION, and EVIDENCE_SOURCE_CHERRY_PICKING detection are V1-scoped only to the extent SPEC-009's sequence detection and SPEC-014's event completeness already surface the underlying signals; dedicated statistical detectors for those three types may be deferred past V1 with that limitation explicitly documented.

---

# 15. Newly Locked Decisions

```text
1. Evidence Integrity Scores discount evidence at consumption time;
   they never delete or edit the underlying immutable evidence item.

2. No Gaming Signal may be raised from a single action; all signal
   types require an aggregate pattern.

3. Self-reported evidence carries a structurally lower trust weight
   than independently sourced evidence, as a standing rule, not only
   when a gaming signal has fired.

4. A Gaming Signal does not itself change an agent's lifecycle state.
```

---

# 16. Unresolved Questions

```text
What statistical test is most appropriate for each Gaming Signal
type, and how is its threshold versioned and promoted through
SPEC-017's SHADOW/CANARY process before affecting production
competence estimates?

Should an agent be able to see its own Evidence Integrity Scores
(transparency) without that visibility itself becoming a new gaming
vector (an agent adjusting behavior specifically to avoid detection
rather than to genuinely diversify)?
```
