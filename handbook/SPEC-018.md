# AEGIS TECHNICAL SPECIFICATION 018

## Research, Benchmark and Metrics System

**Document ID:** AEGIS-SPEC-018
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Research Infrastructure Architecture
**Depends On:** AEGIS-SPEC-000 through AEGIS-SPEC-017 (cross-cutting; measures the behavior of every prior component)
**Primary Owner:** Research and Benchmark Harness
**Primary Runtime Component:** Research and Benchmark Harness, Dashboard
**Consumers:** Researchers, Operators, SPEC-017's promotion governance

---

# 0. Purpose of This Specification

`aegis-master-context.md` §37–41 and §59–61 and `handbook/AEGIS-RESEARCH-THESIS.md` establish that AEGIS must be measurable as a research system, not only operable as a production one. This specification is the last of the eighteen governed by SPEC-000's header, and it is the one that turns every metric named in the research thesis into an actual, owned measurement system, and turns the flagship refund benchmark into a runnable, repeatable evaluation environment.

This specification does not introduce new governance concepts. It measures the behavior of every specification that precedes it.

---

# 1. Foundational Principle

```text
The platform should eventually allow controlled comparison of static
permissions, human approval systems, risk-only gating, trust-score
systems, pre-execution governance only, runtime monitoring only, and
AEGIS adaptive autonomy.
```
(`aegis-master-context.md` §59, restated as this specification's central responsibility.)

---

# 2. The Problem This Specification Solves

Without this specification:

```text
The research questions in AEGIS-RESEARCH-THESIS.md §4 remain
unanswerable — they are well-posed questions with no measurement
system to actually resolve them.

Each baseline described in the research thesis's comparison
methodology (§7) would need to be independently reimplemented,
introducing confounds unrelated to the governance model itself.

Metrics like "prevented exposure" and "containment efficiency" are
named in aegis-master-context.md §61 but have no owned computation,
so operators cannot actually see them on a Dashboard.
```

---

# 3. Position in the System

```text
Event Ledger (SPEC-014) — the raw material every metric is computed from
          ↓
RESEARCH AND BENCHMARK HARNESS
  - runs the flagship benchmark and baseline configurations
    (via SPEC-017's SHADOW/CANARY mechanism)
  - computes the primary system metrics
  - produces comparisonEvidenceRef records SPEC-017 requires for
    promotion
          ↓
DASHBOARD — surfaces metrics and benchmark results to operators and
   researchers
```

This specification does not sit in the request path of any decision at all. It is entirely a downstream consumer of the Event Ledger and the Algorithm/Configuration Registry.

---

# 4. Core Domain Objects

## 4.1 Benchmark Run

```text
benchmarkRunId
benchmarkDefinitionRef        — e.g. "flagship-refund-benchmark-v1"
configurationUnderTest           — which baseline (SPEC-000 §59 list) or
                                    full AEGIS treatment this run used,
                                    expressed as an Experiment Assignment
                                    (SPEC-017)
scenarioSeed                       — deterministic scenario generation
                                      seed, for reproducibility
startedAt
completedAt
rawEventRange                        — Event Ledger range this run
                                        corresponds to
```

## 4.2 Research Metric

```text
metricId
metricName                — from the table in §6
benchmarkRunId
computedValue
computationMethod            — versioned per SPEC-000 INV-006
computedAt
```

## 4.3 Counterfactual Comparison

```text
comparisonId
treatmentBenchmarkRunId     — the AEGIS adaptive-autonomy run
baselineBenchmarkRunId         — one of the baseline configurations
metricDeltas[]                    — per-metric difference, treatment
                                     minus baseline
significanceAssessment                — statistical confidence in the
                                         observed delta, carrying
                                         epistemic provenance (SPEC-005)
```

---

# 5. Baseline Configurations

Restated from `handbook/AEGIS-RESEARCH-THESIS.md` §7, implemented here as concrete Experiment Assignments (SPEC-017) rather than separate codebases:

```text
Baseline 1 — Static permissions: Autonomy Decision Engine (SPEC-007)
             replaced with a fixed allow/deny table keyed only on
             declared capability (SPEC-002), bypassing SPEC-003–006.

Baseline 2 — Human approval on every action: Autonomy Decision Engine
             forced to always select L2 regardless of assessment
             inputs.

Baseline 3 — Risk-only gating: only SPEC-006 (Consequence) feeds the
             autonomy ceiling; SPEC-003/004/005 inputs are masked to
             a neutral constant.

Baseline 4 — Trust-score system: a single scalar computed as a
             simple rolling success rate, replacing SPEC-003's
             competence topology, feeding the same ceiling formula.

Baseline 5 — Pre-execution governance only: SPEC-009 (Runtime
             Sentinel) disabled; only the pre-execution decision
             plane and Execution Gateway run.

Baseline 6 — Runtime monitoring only: SPEC-007's decision plane
             forced to always grant L5, with SPEC-009 as the only
             active safety layer.

Treatment  — Full AEGIS: all specifications active as designed.
```

Each baseline is implemented as a distinct Experiment Assignment (SPEC-017 §4.3) running in SHADOW or a dedicated benchmark-only environment against the same frozen scenario seed — never against live production traffic, per SPEC-000 INV-011.

---

# 6. Primary System Metrics — Computation Ownership

Extends `handbook/AEGIS-RESEARCH-THESIS.md` §6 with the actual computation source:

```text
Decision accuracy               — Benchmark Run outcome vs. scenario's
                                    known ground-truth label (benchmark
                                    scenarios are authored with a known
                                    correct disposition)
Autonomy calibration             — distribution of granted autonomy
                                    levels vs. scenario difficulty tier
Human approval rate               — count(APPROVED_* decisions) /
                                     count(all Approval Requests),
                                     from SPEC-011 events
Useful work completed              — count(successfully executed
                                      actions) within benchmark run
Policy violation rate                — count(policy-blocked attempts) /
                                        count(total attempts)
Runtime incident rate                  — count(Runtime Incidents) /
                                          count(execution attempts),
                                          from SPEC-009 events
Mean time to detect                     — median(detection timestamp -
                                           harm-onset timestamp), from
                                           SPEC-009 events
Mean time to contain                      — median(containment-verified
                                             timestamp - detection
                                             timestamp)
Intervention success rate                   — count(verified-effective
                                               interventions) /
                                               count(interventions issued)
Post-intervention leakage                     — residual harm magnitude
                                                 recorded after
                                                 containment (SPEC-009,
                                                 SPEC-010)
Prevented exposure                              — modeled counterfactual
                                                   exposure minus
                                                   realized exposure (see
                                                   §8, open problem)
Realized exposure                                 — sum of confirmed
                                                     Effect Record
                                                     magnitudes (SPEC-010)
Unknown exposure                                    — sum of magnitudes
                                                       for effects with
                                                       UNKNOWN
                                                       verification status
Monitoring coverage                                  — fraction of
                                                        execution time
                                                        with all required
                                                        signals at
                                                        required freshness
                                                        (SPEC-009)
False positive intervention cost                      — useful work lost
                                                         to interventions
                                                         later found
                                                         unnecessary
Recovery success rate                                   — count(FULLY_
                                                           RECOVERED) /
                                                           count(Recovery
                                                           Plans), from
                                                           SPEC-010
```

---

# 7. Invariants

## RSCH-INV-001 — Benchmarks Never Touch Production Tenants

A Benchmark Run executes only against dedicated benchmark scenario data, never against real tenant data, regardless of how realistic the scenario is designed to be (Multi-Tenant Principle, Research Isolation).

## RSCH-INV-002 — Baselines Share Domain Definitions With Production

Every baseline configuration in §5 uses the same CAM (SPEC-001), Agent Identity (SPEC-002), and Event Ledger (SPEC-014) as production — only the decision-plane logic under test differs. This is required so that observed differences are attributable to the governance model, not to incidental implementation drift (SPEC-000 §20).

## RSCH-INV-003 — Metrics Must Cite Their Source Events

Every Research Metric must be traceable to the specific Event Ledger range (`rawEventRange`) it was computed from, satisfying the Reproducibility Principle for research outputs, not only for production decisions.

## RSCH-INV-004 — A Metric Improvement Does Not Auto-Promote an Algorithm

A favorable Counterfactual Comparison is evidence for a SPEC-017 promotion decision; it is not itself a promotion. Human approval remains required (CFG-INV-003).

## RSCH-INV-005 — Benchmark Scenario Ground Truth Is Versioned

The "known correct disposition" used for Decision Accuracy must itself be versioned and cannot be silently altered after Benchmark Runs have been scored against it — a change to ground truth produces a new scenario version, and historical scores remain tied to the version they were actually measured against.

## RSCH-INV-006 — Counterfactual Estimates Are Explicitly Labeled as Modeled

Metrics depending on a counterfactual estimate (Prevented Exposure, False Positive Intervention Cost) must carry explicit model provenance and confidence, per SPEC-000 §12.3 — they are never presented with the same certainty as directly measured metrics (Realized Exposure, Recovery Success Rate).

---

# 8. Failure Behavior

| Failure | Response |
|---|---|
| Research Harness unavailable | Production decision-making is entirely unaffected — this specification has no synchronous dependency on any decision-plane component (per §3). |
| Event Ledger range referenced by a metric is incomplete (`PARTIAL_GAPS_DETECTED` per SPEC-014) | The metric is computed and explicitly flagged as based on incomplete data; it is not silently presented as complete. |
| Counterfactual model unavailable | Prevented Exposure and related counterfactual metrics are reported as `UNAVAILABLE`, never estimated as zero (zero is not a safe default — it would understate the platform's value, and understating harm-prevention is exactly as dishonest as overstating it). |

---

# 9. Security Boundaries

```text
BOUNDARY: Benchmark Harness → Production Event Ledger
Threats: a benchmark configuration accidentally routed against real
         tenant data (mitigated structurally by RSCH-INV-001's
         dedicated benchmark-scenario requirement, enforced at the
         Event Ledger's tenant-scoping layer, SPEC-014 LEDGER-INV-006).
```

---

# 10. Events

```text
BENCHMARK_RUN_STARTED
BENCHMARK_RUN_COMPLETED
RESEARCH_METRIC_COMPUTED
COUNTERFACTUAL_COMPARISON_COMPUTED
BENCHMARK_SCENARIO_GROUND_TRUTH_VERSIONED
```

---

# 11. Testing Strategy

```text
Each of the six baseline configurations must be verifiable as
producing measurably different decisions than the full AEGIS
treatment on at least one scenario in the flagship benchmark suite,
confirming the baselines are not accidentally equivalent to the
treatment due to implementation error.

A benchmark run must never write to a production-tagged Event Ledger
range, verified by attempting a misconfigured run and confirming
rejection at the tenant-scoping boundary.

Ground-truth versioning must preserve historical Decision Accuracy
scores unchanged when ground truth is later revised for future runs.
```

---

# 12. Adversarial Scenarios

```text
A researcher under pressure to show a favorable result adjusts a
scenario's ground-truth label after seeing the treatment's initial
score. Expected: RSCH-INV-005 requires ground truth to be versioned;
retroactively changing it does not alter already-recorded scores, and
the change itself produces an auditable event distinguishing "new
scenario version" from "corrected mislabeling," which must be
reviewable.
```

---

# 13. Research Questions

This specification is the implementation vehicle for every research question in `handbook/AEGIS-RESEARCH-THESIS.md` §4. Its own additional question:

```text
How many benchmark scenarios, and what difficulty distribution, are
needed before a Counterfactual Comparison between two configurations
reaches the significance bar this specification requires before
treating a delta as real rather than noise?
```

---

# 14. V1 Implementation Boundary

V1 must implement: the flagship refund benchmark scenario suite, at least Baselines 1, 3, 4, and 6 (the ones most directly illustrating the central thesis), the metrics in §6 that do not depend on the unresolved counterfactual-harm model (i.e. all except Prevented Exposure and False Positive Intervention Cost, which remain `UNAVAILABLE` in V1 per §8's failure behavior), and ground-truth versioning. Baselines 2 and 5, and the counterfactual-dependent metrics, are explicitly deferred past V1.

---

# 15. Newly Locked Decisions

```text
1. Baseline configurations are implemented as restricted Experiment
   Assignments of the same platform, never as separate codebases.

2. Benchmark Runs never execute against production tenant data.

3. Counterfactual-dependent metrics are reported as UNAVAILABLE, not
   estimated as zero, when the underlying model is not yet available.

4. Ground truth for benchmark scenarios is versioned; historical
   scores are never retroactively altered by a ground-truth revision.
```

---

# 16. Unresolved Questions

```text
What is the actual counterfactual-harm estimation method (see
AEGIS-RESEARCH-THESIS.md §8) — this remains the single largest gap
blocking two of the named primary system metrics from being
computable at all.

Should Research Metrics ever feed back automatically into
Configuration Version defaults, or must every configuration change
remain a manually approved act even when metrics strongly favor it?
```

---

# 17. Closing Note on the SPEC-000–018 Boundary

This is the last specification in the range SPEC-000 declares itself to govern ("Governs: SPEC-001 through SPEC-018"). Per `handbook/AEGIS-SPEC-ROADMAP.md` §5, any specification beyond this point requires amending that header first, following the same amendment process (`AGENTS.md` §3) used throughout this batch of documents.
