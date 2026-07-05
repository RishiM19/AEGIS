# AEGIS RESEARCH THESIS

**Document ID:** AEGIS-RESEARCH-THESIS
**Status:** Canonical
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Document Type:** Research Program Definition
**Depends On:** AEGIS-MASTER-CONTEXT, AEGIS-ARCHITECTURE-DECISIONS

---

# 0. Purpose

`aegis-master-context.md` establishes that AEGIS is simultaneously a production-grade platform and a research-grade evaluation system (§40–41, §59–61, §68). This document formalizes that research identity into one place: the central thesis, the concepts it depends on, the questions it asks, the metrics that answer them, and the comparison methodology that makes the answers credible.

Only concepts formally defined by a completed specification are canonical here. Where a concept is still open, this document says so explicitly rather than presenting a provisional definition as settled.

---

# 1. The Central Thesis

> Autonomous systems can be governed more safely and more usefully through dynamically calibrated, bounded, continuously controllable, and recoverable authority than through static permission systems or permanent trust scores.

This is falsifiable. AEGIS is built to be tested against that claim, not merely to assert it.

The weaker, narrower version of this claim — "we can stop agents from doing forbidden things" — is not the research contribution. Any allowlist can do that. The actual claim under test is that *calibration* (matching the degree of freedom to the actual, evidenced situation) outperforms both extremes: blanket restriction (which destroys useful autonomous work) and blanket trust (which destroys safety).

---

# 2. Why a Single Trust Score Is the Wrong Null Hypothesis

The most obvious competing design is a single scalar `agent_trust_score` that rises and falls with outcomes. SPEC-000 INV-012 and `aegis-master-context.md` §15 explicitly forbid this as the *primary* governance abstraction, for a testable reason: competence, novelty, uncertainty, and consequence are not the same variable, and collapsing them destroys exactly the information needed to tell apart two situations that a scalar score would treat identically.

Concrete example already used as the running illustration across SPEC-003 through SPEC-007:

```text
Agent A: 10,000 relevant historical actions, 99.1% success, low
         uncertainty, familiar task, reversible, small blast radius.

Agent B: 12 relevant historical actions, 66.7% success, high
         uncertainty, novel task, partially irreversible, large
         blast radius.
```

A single trust score conflates these along one axis. The multi-engine architecture (SPEC-003–006) keeps them separable so the research program can ask which axis actually predicted the outcome — a question a scalar score structurally cannot answer.

---

# 3. Formal Concepts

## 3.1 Monitorability (SPEC-009, canonical)

```text
Monitorability = f(Detectability, DetectionLatency, InterventionLatency, HarmVelocity)

T_contain = T_detect + T_decide + T_act
T_harm    = TimeAvailableBeforeUnacceptableImpact

MonitoringUseful  ⟺  T_contain < T_harm
M = T_harm / T_contain
```

`M >> 1`: strong intervention opportunity. `M ≈ 1`: marginal. `M < 1`: monitoring is structurally too slow to help, regardless of detector quality.

Working relationship (not yet proven, treated as a hypothesis to test):

```text
MaximumSafeAutonomy ∝ Monitorability, subject to Consequence, Competence, Policy, Reversibility, Evidence, Uncertainty
```

Source: `aegis-master-context.md` §42–43.

## 3.2 Recoverability (SPEC-010, canonical as of this document)

```text
Recoverability = the degree to which the effects of an action, if harmful,
                  can be restored or compensated without introducing
                  additional uncontrolled harm.
```

SPEC-010 defines this formally as a function of effect classification (reversible / compensatable / partially reversible / irreversible), verified rollback latency, and residual-harm bound after compensation. See `handbook/SPEC-010.md` §{{Recoverability Model}} for the full definition. This document treats Recoverability as canonical from SPEC-010 onward, resolving the "emerging concept" status noted in `aegis-master-context.md` §44.

## 3.3 Authority Precision (working concept, not yet formalized)

```text
Authority Precision = how closely the exact scope of a granted Autonomy
                        Contract matches the minimum scope that would
                        have been sufficient to accomplish the objective.
```

Excess authority (a grant wider than necessary) is a measurable inefficiency even when never misused. This concept is used in metrics (§6) but does not yet have a locked mathematical definition; any specification that formalizes it must update this section rather than introduce a competing definition elsewhere.

## 3.4 Containment Efficiency (working concept, not yet formalized)

```text
Containment Efficiency = realized harm actually prevented ÷ harm that
                           would have occurred absent intervention.
```

Depends on a credible counterfactual-harm estimate, which is itself an open research problem (§8).

---

# 4. Primary Research Questions

Restated from `aegis-master-context.md` §60, grouped by which specification each depends on:

```text
Q1  Can dynamic action-specific autonomy outperform static permissions?
    [depends on SPEC-007 vs. a static-permission baseline]

Q2  Can evidence-backed competence improve autonomy calibration over a
    single trust score? [SPEC-003, SPEC-007]

Q3  Can bounded grants reduce excess authority relative to broad,
    long-lived permissions? [SPEC-007, SPEC-008, Authority Precision]

Q4  Can runtime intervention reduce realized harm relative to
    pre-execution governance alone? [SPEC-009, SPEC-010]

Q5  Can aggregate monitoring detect danger missed by per-action checks?
    [SPEC-009 MON-INV-014]

Q6  Can monitoring blindness detection prevent unsafe fail-open
    behavior? [SPEC-009 MON-INV-004]

Q7  Can sequence detection identify dangerous multi-step behavior
    invisible to single-action assessment? [SPEC-000 §28, SPEC-009]

Q8  Can adaptive throttling preserve more useful work than binary
    shutdown, at equivalent realized-harm levels? [SPEC-009 I2/I3 vs I6]

Q9  Can containment verification detect false stopping (STOP ≠ STOPPED)?
    [SPEC-009 MON-INV-016]

Q10 Can Monitorability (§3.1) predict maximum safe autonomy in advance,
    rather than only explaining it after the fact? [SPEC-009, SPEC-007]

Q11 Can runtime history improve future autonomy calibration without
    creating gaming incentives? [SPEC-013, SPEC-016]

Q12 How should Recoverability (§3.2) influence autonomy — as a ceiling
    input (like Monitorability) or only as a post-hoc mitigation
    measure? [SPEC-010, SPEC-007 AUT-INV-010]
```

---

# 5. The Flagship Benchmark

Autonomous customer refund operations (`aegis-master-context.md` §37–39), chosen specifically because it contains real financial consequence, clear external side effects, reversibility differences, aggregate exposure, fraud potential, provider dependency, retries and duplicate risk, human-approval boundaries, monitoring requirements, and recovery requirements — all in one bounded domain. V1 depth in one domain is preferred over shallow coverage across many (`aegis-master-context.md` §65).

The benchmark must remain coherent across every specification; a specification that cannot express a coherent refund scenario is not ready to be implemented.

---

# 6. Primary System Metrics

From `aegis-master-context.md` §61, with the specification responsible for producing each marked:

```text
Decision accuracy                    SPEC-007, SPEC-013
Autonomy calibration                 SPEC-007, SPEC-018
Authority precision                  SPEC-007, SPEC-008 (concept in §3.3)
Human approval rate                  SPEC-011
Useful work completed                SPEC-018
Policy violation rate                SPEC-007, SPEC-008
Runtime incident rate                SPEC-009
Mean time to detect                  SPEC-009
Mean time to contain                 SPEC-009
Intervention success rate            SPEC-009
Post-intervention leakage            SPEC-009, SPEC-010
Prevented exposure                   SPEC-009, SPEC-010 (Containment Efficiency, §3.4)
Realized exposure                    SPEC-010
Unknown exposure                     SPEC-009, SPEC-010
Monitoring coverage                  SPEC-009
False positive intervention cost     SPEC-009, SPEC-018
Recovery success rate                SPEC-010
```

Not all of these have a locked formula yet; several depend on the counterfactual-harm estimation problem (§8). SPEC-018 is the specification responsible for turning this table into an actual measurement system.

---

# 7. Comparison Methodology

The research program requires controlled comparison of AEGIS's adaptive-autonomy approach against weaker baselines, using the same frozen benchmark scenarios:

```text
Baseline 1 — Static permissions (allow/deny only)
Baseline 2 — Human approval on every action
Baseline 3 — Risk-only gating (consequence assessment, no competence/novelty)
Baseline 4 — Trust-score system (single scalar, updated on outcome)
Baseline 5 — Pre-execution governance only (no Runtime Sentinel)
Baseline 6 — Runtime monitoring only (no pre-execution decision plane)
Treatment  — Full AEGIS adaptive autonomy
```

Each baseline is implementable as a restricted configuration of the same platform (e.g. Baseline 3 disables SPEC-003/004/005 inputs to the autonomy ceiling) rather than a separate codebase, so that differences in outcome are attributable to the governance model and not to incidental implementation differences. This is the same SHADOW-mode mechanism defined in SPEC-000 §21 and formalized in SPEC-017.

---

# 8. Open Research Problems

These are acknowledged gaps, not silently assumed away:

```text
Counterfactual-harm estimation — "how much harm was prevented" requires
estimating what would have happened without intervention. No specification
has yet locked a method for this. SPEC-018 must either formalize one or
explicitly scope it out of V1 measurement.

Authority Precision formalization — §3.3 is currently descriptive, not
computable. A future specification or amendment must formalize it before
it can be used as a scored metric rather than a qualitative observation.

Recoverability's exact relationship to the autonomy ceiling — SPEC-007
AUT-INV-010 permits verified recovery capability to raise the ceiling,
but the exact functional form (linear, threshold, multiplicative with
Monitorability) is not yet locked. This is explicitly flagged as open
in SPEC-010.

Gaming-resistant evidence weighting — SPEC-016 addresses detection of
gaming behavior, but the deeper question of how much to discount
evidence under suspected gaming (versus rejecting it outright) remains
a research question, not a locked algorithm.
```

---

# 9. Relationship to Production

Per SPEC-000 §21 and §11 (Research Isolation, Evaluation/Production Separability), every experimental algorithm supporting this research program must be able to run in SHADOW mode: it observes the same frozen Decision Snapshot as production, produces an alternative decision, and cannot affect real execution until explicitly promoted through governance (INV-011). This document's research questions are answered by comparing SHADOW-mode alternative decisions and outcomes against the production path — never by letting an unproven algorithm affect a real refund.
