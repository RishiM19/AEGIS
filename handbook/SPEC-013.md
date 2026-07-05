# AEGIS TECHNICAL SPECIFICATION 013

## Outcome Evaluation, Attribution and Evidence Feedback

**Document ID:** AEGIS-SPEC-013
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Learning Plane Architecture
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-002, AEGIS-SPEC-003, AEGIS-SPEC-007, AEGIS-SPEC-008, AEGIS-SPEC-009, AEGIS-SPEC-010, AEGIS-SPEC-011, AEGIS-SPEC-012
**Primary Owner:** Learning Plane
**Primary Runtime Component:** Outcome Evaluation Engine, Attribution Engine, Competence Evidence Writer
**Consumers:** Competence Engine (SPEC-003), Autonomy Decision Engine, Research Harness, Dashboard, Anti-Gaming System (SPEC-016)

---

# 0. Purpose of This Specification

Every specification through SPEC-012 either makes a decision or executes one. None of them closes the loop back to SPEC-003's Competence Topology. This specification is the Learning Plane: it evaluates what actually happened, determines who or what is responsible for it, and writes the resulting evidence back in a form SPEC-003 can consume — without ever violating SPEC-000 INV-007 (Learning Cannot Rewrite History) or INV-008 (Outcome Does Not Equal Agent Quality).

This is the formal closure of the Evidence Feedback Loop described in `aegis-master-context.md` §58: Decision → Grant → Execution → Observation → Outcome → Evidence → Future Assessment.

---

# 1. Foundational Principle

```text
A successful final outcome does not automatically mean the agent
made a good decision. A failed final outcome does not automatically
mean the agent made a bad decision.
```
(SPEC-000 INV-008.) This specification exists specifically to prevent the shortcut of treating raw outcomes as competence signals.

---

# 2. The Problem This Specification Solves

Without a formal Attribution step:

```text
A refund fails because the payment provider's API was down for
ten minutes, and the agent's competence score drops as if the agent
had made a bad decision.

A human approver reduces a requested refund amount before execution;
the action "succeeds," and the agent is credited with a decision it
did not actually make (it proposed a different amount).

A Runtime Sentinel intervention (SPEC-009) correctly prevents harm,
but because the action was "stopped," it is recorded as an agent
failure rather than correctly attributed to Runtime Sentinel's own
successful containment.

An agent farms easy, low-risk, repetitive actions to inflate its
apparent success rate, and this is not caught because outcome
evaluation does not distinguish diverse evidence from repetitive
evidence.
```

---

# 3. Position in the System

```text
Execution Attempt completes (SPEC-008) or Recovery Plan completes
(SPEC-010) or Approval Decision is recorded (SPEC-011)
          ↓
OBSERVATION COLLECTION — independent sources per Independent
   Observation Principle
          ↓
OUTCOME EVALUATION — what actually happened, in domain terms
          ↓
ATTRIBUTION — which factor(s) explain the outcome
          ↓
COMPETENCE EVIDENCE WRITE — structured, versioned, scoped
          ↓
Consumed by SPEC-003 (Competence Topology) for future assessments
```

---

# 4. Core Domain Objects

## 4.1 Observation

```text
observationId
subjectType              — EXECUTION_ATTEMPT | RECOVERY_PLAN | APPROVAL_DECISION
subjectId
observedAt
sourceType                 — independent source identifier (SPEC-000 §49)
rawObservationPayload
```

## 4.2 Outcome Evaluation

```text
outcomeEvaluationId
subjectId
outcomeClassification      — see §5
evaluatedAt
evaluationMethod              — deterministic rule | statistical model,
                                 versioned per SPEC-000 INV-006
```

## 4.3 Attribution Record

```text
attributionRecordId
outcomeEvaluationId
attributedFactors[]         — one or more of: AGENT_DECISION_QUALITY,
                               TOOL_EXECUTION_QUALITY, ENVIRONMENTAL_FAILURE,
                               HUMAN_INTERVENTION, DOWNSTREAM_SYSTEM_FAILURE,
                               RUNTIME_SENTINEL_INTERVENTION,
                               RECOVERY_ENGINE_ACTION
weightPerFactor[]              — must sum to a bounded total; a single
                                  outcome may be explained by multiple
                                  factors with partial weight
confidenceLevel                  — carries epistemic provenance (SPEC-005)
```

## 4.4 Competence Evidence Item

The object SPEC-003 actually consumes (SPEC-003 §Competence Requires Outcomes, COMP-INV-004):

```text
evidenceItemId
agentId
agentVersionId
actionRegion               — the competence-topology region this evidence
                              applies to (SPEC-003)
attributionRecordId          — the record this evidence derives from
evidenceWeight                 — down-weighted for HUMAN_INTERVENTION,
                                  RUNTIME_SENTINEL_INTERVENTION,
                                  ENVIRONMENTAL_FAILURE per §6
recordedAt
immutable                        — true; never edited after write
                                    (SPEC-000 INV-007)
```

---

# 5. Outcome Classification

```text
SUCCESS                    — the intended effect was achieved and verified
FAILURE                     — the intended effect was not achieved
PARTIAL                       — some but not all intended effects achieved
                                (aligned with SPEC-010 PARTIALLY_RECOVERED
                                for recovery subjects)
UNKNOWN                        — cannot be determined; must remain explicit,
                                  never defaulted to SUCCESS or FAILURE
```

`UNKNOWN` outcomes do not produce Competence Evidence Items at all — they are recorded as Observations awaiting resolution, consistent with EPI-INV-002 (Missing Is Not Negative Evidence) and its positive-evidence analogue.

---

# 6. Attribution Rules

Attribution is the deterministic (or versioned-statistical) core that prevents raw outcomes from becoming competence evidence unfiltered:

```text
IF a Runtime Sentinel intervention (SPEC-009) altered the execution
   path (throttle, pause, cancel, terminate, isolate, revoke),
   THEN attributedFactors includes RUNTIME_SENTINEL_INTERVENTION,
   and agent evidence weight for this outcome is reduced in
   proportion to how much the intervention — not the agent's own
   decision — determined the final state.

IF a human approval decision was APPROVED_WITH_MODIFICATION,
   CORRECTED_AGENT_DECISION, or OVERRULED_AEGIS (SPEC-011 §5),
   THEN the executed action differs from the agent's proposal, and
   agent evidence weight reflects only the originally proposed
   action, not the human-modified outcome (restating
   aegis-master-context.md §25's non-automatic-proof principle).

IF the Tool Adapter or external system reported a failure
   independent of the action's correctness (e.g. provider outage,
   timeout), THEN attributedFactors includes ENVIRONMENTAL_FAILURE
   or DOWNSTREAM_SYSTEM_FAILURE, and agent competence evidence weight
   for this outcome is near zero, not negative.

IF a Recovery Plan (SPEC-010) was required and succeeded,
   THEN attributedFactors includes RECOVERY_ENGINE_ACTION for the
   recovery's own evidence trail, kept separate from the originating
   agent's competence evidence (RCV-INV-011).

OTHERWISE, attributedFactors includes AGENT_DECISION_QUALITY with
   full weight.
```

Multiple factors may co-occur; weights are apportioned, not exclusive.

---

# 7. Invariants

## LRN-INV-001 — Outcome Is Not Competence

A raw `outcomeClassification` never writes directly to Competence Evidence. It must pass through Attribution first.

## LRN-INV-002 — Attribution Must Separate Named Factors

Every Attribution Record must explicitly separate agent decision quality from tool execution quality, environmental failure, human intervention, and downstream system failure (SPEC-000 INV-008, verbatim requirement).

## LRN-INV-003 — Unknown Outcomes Produce No Competence Evidence

An outcome classified `UNKNOWN` does not generate a Competence Evidence Item. It remains an open Observation.

## LRN-INV-004 — Evidence Is Immutable Once Written

A Competence Evidence Item, once recorded, is never edited. A later correction produces a new, linked evidence item with a superseding relationship, preserving the original (SPEC-000 INV-007).

## LRN-INV-005 — Evidence Diversity Is Tracked, Not Assumed

The Competence Evidence Writer records `actionRegion` and timestamp such that SPEC-003 can distinguish repeated near-identical evidence from genuinely diverse evidence — this is the structural hook SPEC-016's anti-gaming system consumes.

## LRN-INV-006 — Intervention and Recovery Evidence Are Attributed to the Responsible Component, Not the Original Agent

A successful Runtime Sentinel intervention or Recovery Plan execution generates evidence about the Runtime Sentinel's or Recovery Engine's own effectiveness, tracked separately from the originating agent's competence record.

## LRN-INV-007 — Attribution Must Be Reproducible

Given the same Observations, Outcome Evaluation, and algorithm version, Attribution must produce the same Attribution Record (SPEC-000 INV-003/006).

## LRN-INV-008 — Evidence Source Independence Is Recorded

Every Competence Evidence Item traces back to an Observation whose `sourceType` is recorded, so that evidence quality (source independence, per the Independent Observation Principle) can later be audited or discounted by SPEC-016.

---

# 8. Failure Behavior

| Failure | Response |
|---|---|
| Attribution Engine unavailable | Raw observations are preserved; competence evidence write is delayed, never inferred automatically from raw outcome alone (SPEC-000 §16.5). |
| Observation source unavailable/conflicting | Outcome classification = `UNKNOWN`; no Competence Evidence Item is written. |
| Attribution weights cannot be computed (missing intervention/approval context) | Default to the most conservative attribution — assume shared responsibility across all plausible factors rather than crediting the agent fully. |

---

# 9. Security Boundaries

```text
BOUNDARY D (restated from SPEC-000 §26): Observation → Learning
Threats: false success signals, poisoned competence evidence,
         manipulated outcomes, agent gaming. This specification is
         the primary structural defense (attribution weighting,
         source independence tracking); SPEC-016 is the specialized
         system that actively hunts for gaming patterns using the
         evidence this specification produces.
```

---

# 10. Events

```text
OBSERVATION_RECORDED
OUTCOME_EVALUATED
ATTRIBUTION_COMPLETED
COMPETENCE_EVIDENCE_ITEM_WRITTEN
COMPETENCE_EVIDENCE_ITEM_SUPERSEDED
OUTCOME_UNRESOLVED_ESCALATED
```

---

# 11. Testing Strategy

```text
An execution halted by Runtime Sentinel intervention must never
produce full-weight AGENT_DECISION_QUALITY evidence attributing the
halt to the agent, across all intervention classes I2-I9.

A provider-outage failure must produce near-zero, not negative,
agent evidence weight, tested against fault-injected provider
failures.

An UNKNOWN outcome must never produce a Competence Evidence Item,
verified across all evaluation-failure fault injections.
```

---

# 12. Adversarial Scenarios

```text
An agent is engineered to only propose actions just below a
threshold that historically triggers human review, systematically
avoiding REJECTED/CORRECTED_AGENT_DECISION outcomes while never
demonstrating competence on harder cases. Expected: this is a gaming
pattern this specification's evidence-diversity tracking (LRN-INV-005)
makes visible to SPEC-016, even though this specification itself does
not block it — attribution is descriptive, not punitive.

A compromised Tool Adapter reports false SUCCESS for a failed
execution to inflate an agent's apparent competence. Expected: this
is why LRN-INV-008 requires independent-source tracking — a
single-source, non-independent SUCCESS report for a high-consequence
action should be discounted rather than trusted at full weight
(handled jointly with SPEC-016's evidence integrity scoring).
```

---

# 13. Research Questions

See `handbook/AEGIS-RESEARCH-THESIS.md` Q11. Additionally:

```text
Can attribution weighting be validated against ground truth in a
controlled benchmark (deliberately injecting known-cause failures)
to measure how accurately this specification's rules recover the
true cause?
```

---

# 14. V1 Implementation Boundary

V1 must implement: the four-value outcome classification, the seven-factor closed attribution enumeration, immutable evidence writing, and the deterministic attribution rules in §6 for the flagship refund benchmark's known failure modes (provider outage, human modification, Runtime Sentinel intervention, recovery success). Statistically learned attribution weighting (as opposed to the deterministic rule set) is out of scope for V1.

---

# 15. Newly Locked Decisions

```text
1. Competence Evidence Items are never written directly from raw
   outcome classification; Attribution is a mandatory intermediate
   step.

2. Runtime Sentinel intervention and Recovery Engine action outcomes
   are attributed to those components, not the originating agent.

3. UNKNOWN outcomes produce no Competence Evidence Item.

4. Every Competence Evidence Item is immutable; corrections produce
   new, linked, superseding items.
```

---

# 16. Unresolved Questions

```text
What is the precise weighting function for multi-factor attribution
(e.g. an outcome that is 60% environmental failure, 40% agent
decision quality) — linear apportionment, or something more
structured?

At what evidence volume does a statistically learned attribution
model become preferable to the deterministic V1 rule set, and what
governance (SHADOW mode per SPEC-017) is required before promoting
one?
```
