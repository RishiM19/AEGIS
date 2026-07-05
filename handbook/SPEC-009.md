# AEGIS TECHNICAL SPECIFICATION 009

## Runtime Monitoring, Intervention and Anomaly Detection System

**Document ID:** AEGIS-SPEC-009  
**Status:** Design Draft  
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents  
**Specification Type:** Runtime Observation, Detection, Intervention and Containment Architecture  
**Depends On:** AEGIS-SPEC-000 through AEGIS-SPEC-008  
**Primary Owner:** Runtime Safety Plane  
**Primary Runtime Component:** AEGIS Runtime Sentinel  
**Consumers:** Execution Gateway, Autonomy Decision Engine, Recovery System, Agent Registry, Approval System, Dashboard, Audit System, Research Harness, Incident Response System

---

# 0. Purpose of This Specification

This specification defines how AEGIS observes autonomous execution after authority has been granted and execution has begun.

SPEC-007 determines:

```text
How much autonomy should this action receive?
```

SPEC-008 determines:

```text
Can the agent exercise only that authority?
```

SPEC-009 determines:

```text
Should the execution be allowed to continue?
```

The central problem is:

```text
An action was correctly assessed.

A valid Autonomy Grant was issued.

The Execution Gateway verified the grant.

All runtime preconditions passed.

Execution began.

What happens if:

1. The environment changes?

2. The target changes?

3. The agent behaves differently than expected?

4. The execution trajectory becomes abnormal?

5. Failure rates increase?

6. The action exceeds expected duration?

7. Side effects differ from predictions?

8. A dependency degrades?

9. Aggregate exposure becomes dangerous?

10. A sequence of individually safe actions becomes unsafe?

11. The agent begins repeating actions?

12. The agent changes tools unexpectedly?

13. The external provider behaves abnormally?

14. Monitoring data becomes unavailable?

15. A safety invariant is violated?

16. A canary stage fails?

17. Recovery capability disappears?

18. The action becomes irreversible?

19. The risk increases faster than the system can respond?

20. A kill switch must be triggered?
```

The Runtime Sentinel is therefore not:

```text
A dashboard that displays metrics.
```

It is:

```text
An active runtime control system
that observes autonomous behavior,
evaluates live execution conditions,
and can intervene before harm expands.
```

Its central guarantee is:

\[
ContinuedExecution
\Rightarrow
RuntimeConditionsRemainAcceptable
\]

Where that guarantee cannot be established:

\[
Uncertainty
\Rightarrow
BoundedResponse
\]

not:

\[
Uncertainty
\Rightarrow
ContinueBlindly
\]

---

# 1. Foundational Principle

Autonomy must not be treated as a one-time authorization event.

The correct model is:

```text
ASSESS

↓

GRANT

↓

VERIFY

↓

EXECUTE

↓

OBSERVE

↓

RE-EVALUATE

↓

CONTINUE / CONSTRAIN / PAUSE / STOP / RECOVER
```

Therefore:

\[
SafeAutonomy
=
PreExecutionGovernance
+
RuntimeGovernance
\]

A system that evaluates only before execution assumes:

\[
Risk(t_0)
=
Risk(t_n)
\]

This assumption is false in dynamic environments.

AEGIS instead models:

\[
Risk = f(Action, Agent, Environment, Time, Observations)
\]

Therefore:

\[
Risk_t
\neq
Risk_{t+1}
\]

may occur even when the original action remains unchanged.

---

# 2. The Runtime Safety Problem

An authorized action can become unsafe through:

```text
Environment drift

Target-state drift

Dependency degradation

Execution divergence

Unexpected side effects

Aggregate accumulation

Agent behavior change

Provider behavior change

Adversarial interference

Monitoring blindness

Recovery degradation

Temporal escalation
```

Therefore:

```text
AUTHORIZED
```

does not permanently imply:

```text
SAFE TO CONTINUE.
```

---

# 3. Core Runtime Safety Property

For an active execution \(e\):

\[
Continue(e,t)
\iff
AuthorityValid(e,t)
\land
RuntimeInvariantsHold(e,t)
\land
RiskAcceptable(e,t)
\land
RequiredObservabilityAvailable(e,t)
\]

Otherwise the Runtime Sentinel must produce an explicit response.

Possible responses:

```text
CONTINUE

CONTINUE_WITH_INCREASED_OBSERVATION

CONSTRAIN

THROTTLE

PAUSE

BLOCK_NEXT_STAGE

CANCEL

TERMINATE

ISOLATE

REVOKE

RECOVER

ESCALATE
```

---

# 4. Runtime Sentinel Responsibilities

The Runtime Sentinel owns:

```text
1. Register monitored executions.

2. Establish monitoring contexts.

3. Subscribe to required telemetry.

4. Verify monitoring readiness.

5. Maintain execution timelines.

6. Ingest runtime signals.

7. Normalize observations.

8. Validate signal provenance.

9. Track signal freshness.

10. Track telemetry completeness.

11. Evaluate deterministic runtime invariants.

12. Evaluate threshold rules.

13. Evaluate rate-of-change rules.

14. Evaluate temporal rules.

15. Evaluate sequence rules.

16. Evaluate aggregate exposure.

17. Evaluate behavioral baselines.

18. Evaluate anomaly detectors.

19. Evaluate cross-execution patterns.

20. Evaluate dependency health.

21. Evaluate recovery readiness.

22. Evaluate monitoring health.

23. Calculate runtime risk state.

24. Detect execution divergence.

25. Detect unsafe progression.

26. Detect observation blindness.

27. Generate runtime findings.

28. Correlate findings into incidents.

29. Determine required intervention class.

30. Trigger enforcement actions.

31. Verify intervention acknowledgment.

32. Verify intervention effectiveness.

33. Escalate failed interventions.

34. Trigger grant invalidation where required.

35. Trigger agent containment where required.

36. Trigger recovery workflows.

37. Preserve runtime evidence.

38. Produce monitoring receipts.

39. Update autonomy evidence.

40. Support deterministic reconstruction.
```

---

# 5. Non-Responsibilities

The Runtime Sentinel does not:

```text
Issue initial Autonomy Grants

Execute external business actions

Own external credentials

Replace the Execution Gateway

Perform rollback logic itself

Approve business objectives

Generate arbitrary agent plans

Use an LLM as the final kill-switch authority

Treat anomaly as proof of malicious intent
```

The Runtime Sentinel answers:

> **Given what is happening now, what runtime control response is required?**

---

# 6. Complete Runtime Control Loop

```text
Autonomy Grant Issued
        ↓
Execution Requested
        ↓
Execution Gateway
        ↓
Monitoring Requirement Detected
        ↓
Monitoring Context Created
        ↓
Signal Sources Registered
        ↓
Monitor Readiness Verified
        ↓
Execution Begins
        ↓
Runtime Signals Ingested
        ↓
Normalization
        ↓
Freshness and Integrity Checks
        ↓
Invariant Evaluation
        ↓
Threshold Evaluation
        ↓
Temporal Evaluation
        ↓
Sequence Evaluation
        ↓
Anomaly Evaluation
        ↓
Aggregate Risk Evaluation
        ↓
Runtime Risk State Updated
        ↓
        ├── NORMAL → CONTINUE
        │
        ├── ELEVATED → INCREASE OBSERVATION
        │
        ├── CONCERNING → CONSTRAIN / THROTTLE
        │
        ├── DANGEROUS → PAUSE / STOP
        │
        └── CRITICAL → ISOLATE / REVOKE / RECOVER
```

---

# 7. The Fundamental Monitoring Distinction

AEGIS distinguishes:

```text
OBSERVATION
```

from:

```text
DETECTION
```

from:

```text
DECISION
```

from:

```text
INTERVENTION
```

Example:

```text
Observation:
Refund rate = 47/minute

Detection:
Rate exceeds baseline by 8.2 standard deviations

Decision:
Runtime state = DANGEROUS

Intervention:
Pause new refund dispatches
```

These must remain separate.

---

# 8. Why Separation Matters

A raw metric should not directly trigger arbitrary action without defined semantics.

Forbidden architecture:

```text
Metric spike
→ random automated response
```

Required architecture:

```text
Signal

↓

Validated observation

↓

Detection result

↓

Runtime finding

↓

Intervention policy

↓

Enforcement command

↓

Effect verification
```

---

# 9. Runtime Monitoring Invariants

## MON-INV-001 — Required Monitoring Must Exist Before Execution

If a grant requires monitoring:

\[
MonitorReady = false
\Rightarrow
NoExecution
\]

---

## MON-INV-002 — Monitoring Must Be Independent of Agent Self-Reporting

The agent may provide telemetry.

It cannot be the only source for critical safety signals.

---

## MON-INV-003 — Every Critical Signal Has a Freshness Requirement

Stale telemetry cannot be treated as current safety evidence.

---

## MON-INV-004 — Monitoring Blindness Is a Runtime Event

Missing data is not equivalent to safe data.

---

## MON-INV-005 — Hard Invariant Violations Override Statistical Confidence

If:

```text
Maximum authorized value exceeded
```

then:

```text
STOP
```

does not depend on anomaly probability.

---

## MON-INV-006 — Detection and Intervention Are Auditable

Every intervention must identify:

```text
What was observed?

Which rule fired?

Why was the response chosen?

Who or what executed the intervention?

Did it work?
```

---

## MON-INV-007 — Intervention Authority Is Explicit

The Sentinel may perform only predefined intervention actions.

---

## MON-INV-008 — Monitoring Cannot Expand Agent Authority

---

## MON-INV-009 — A Failed Intervention Must Escalate

---

## MON-INV-010 — Critical Intervention Paths Must Not Depend on an LLM

---

## MON-INV-011 — Runtime State Is Monotonic Within an Evaluation Instant

A critical finding cannot be ignored by a simultaneous lower-risk finding.

---

## MON-INV-012 — Safety-Critical Signals Preserve Provenance

---

## MON-INV-013 — Signal Loss Cannot Silently Reduce Risk

---

## MON-INV-014 — Aggregate Risk Is First-Class

Individually valid actions may collectively trigger intervention.

---

## MON-INV-015 — Runtime Intervention Must Be Faster Than the Harm Expansion Window

Where this cannot be achieved, the action must receive less autonomy.

---

## MON-INV-016 — Intervention Effectiveness Must Be Verified

Sending a stop command is not the same as stopping execution.

---

## MON-INV-017 — In-Flight Work Must Be Explicitly Accounted For

---

## MON-INV-018 — Unknown Runtime State Must Be Represented Explicitly

---

## MON-INV-019 — Detection Models Cannot Directly Mint Authority

---

## MON-INV-020 — Historical Baselines Must Be Tenant-Aware

---

## MON-INV-021 — Cross-Tenant Data Must Not Leak Through Monitoring

---

## MON-INV-022 — Monitoring Failure Must Have Grant-Defined Behavior

---

## MON-INV-023 — Intervention Is Idempotent Where Possible

---

## MON-INV-024 — Repeated Alerts Must Not Cause Repeated Harmful Intervention

---

## MON-INV-025 — Runtime Evidence Is Append-Only

---

# 10. Core Domain Objects

SPEC-009 defines:

```text
Monitoring Requirement

Monitoring Context

Signal Source

Signal Definition

Raw Signal

Normalized Observation

Signal Health State

Runtime Invariant

Detection Rule

Threshold Rule

Rate Rule

Temporal Rule

Sequence Rule

Aggregate Rule

Anomaly Detector

Behavioral Baseline

Detection Result

Runtime Finding

Runtime Risk State

Intervention Policy

Intervention Command

Intervention Attempt

Intervention Receipt

Runtime Incident

Containment Scope

Escalation Policy

Monitoring Receipt
```

---

# 11. Monitoring Requirement

A Monitoring Requirement is created by:

```text
Autonomy Grant

Action Policy

Tool Policy

Organization Policy

Runtime Circuit Breaker

Emergency Safety Policy
```

Conceptual schema:

```typescript
interface MonitoringRequirement {
  requirementId: string;

  sourceType:
    | "AUTONOMY_GRANT"
    | "ACTION_POLICY"
    | "TOOL_POLICY"
    | "ORGANIZATION_POLICY"
    | "GLOBAL_POLICY";

  sourceId: string;

  requiredSignals: RequiredSignal[];

  maximumSignalAgeMs: number;

  maximumDetectionLatencyMs: number;

  maximumInterventionLatencyMs: number;

  requiredDetectors: string[];

  requiredInterventions: string[];

  failureBehavior:
    | "CONTINUE"
    | "DEGRADE"
    | "PAUSE"
    | "STOP";

  criticality: string;
}
```

---

# 12. Monitoring Context

A Monitoring Context binds observation to one runtime subject.

```typescript
interface MonitoringContext {
  contextId: string;

  organizationId: string;

  tenantId: string;

  agentId: string;

  grantId?: string;

  executionSessionId?: string;

  actionId?: string;

  toolId?: string;

  state:
    | "INITIALIZING"
    | "READY"
    | "ACTIVE"
    | "DEGRADED"
    | "BLIND"
    | "INTERVENING"
    | "CLOSED";

  createdAt: Timestamp;

  activatedAt?: Timestamp;

  closedAt?: Timestamp;
}
```

---

# 13. Monitoring Context Scope

Contexts may exist for:

```text
One execution

One grant

One agent

One tenant

One tool

One provider

One workflow

One organization
```

This enables both:

```text
Local anomaly detection
```

and:

```text
Systemic anomaly detection.
```

---

# 14. Monitoring Readiness Handshake

Before monitored execution:

```text
Execution Gateway:
Create monitoring context.

↓

Runtime Sentinel:
Resolve requirements.

↓

Runtime Sentinel:
Subscribe to signal sources.

↓

Runtime Sentinel:
Verify signal freshness.

↓

Runtime Sentinel:
Verify detector readiness.

↓

Runtime Sentinel:
Verify intervention path.

↓

Runtime Sentinel:
Return READY.

↓

Execution Gateway:
Dispatch.
```

---

# 15. Ready Means More Than Process Running

A monitor is not ready merely because:

```text
Health endpoint returns 200.
```

Readiness requires:

```text
Required signal sources connected

Required schemas loaded

Required detectors active

Required baselines available

Required intervention channels reachable

Required kill switch verified

Required event storage writable
```

---

# 16. Signal Sources

Signals may originate from:

```text
Execution Gateway

Tool Adapter

External Provider

Application Database

Infrastructure

Agent Runtime

Policy Engine

Recovery System

Approval System

Security System

Network Layer

Independent Observer

Human Operator
```

---

# 17. Signal Source Schema

```typescript
interface SignalSource {
  sourceId: string;

  sourceType:
    | "GATEWAY"
    | "ADAPTER"
    | "PROVIDER"
    | "DATABASE"
    | "INFRASTRUCTURE"
    | "AGENT"
    | "SECURITY"
    | "MONITOR"
    | "HUMAN";

  trustLevel:
    | "UNTRUSTED"
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "AUTHORITATIVE";

  independentOfAgent: boolean;

  expectedFrequencyMs?: number;

  maximumSilenceMs?: number;

  integrityMechanism?: string;
}
```

---

# 18. Signal Trust

AEGIS must not treat all telemetry equally.

Example:

```text
Agent reports:
Everything succeeded.
```

Independent provider reports:

```text
37% failure rate.
```

The provider signal may have greater authority for provider-side execution state.

---

# 19. Signal Authority Is Contextual

No source is universally authoritative.

Examples:

```text
Payment provider:
Authoritative for refund state.

Database:
Authoritative for committed row state.

Execution Gateway:
Authoritative for dispatch state.

Agent:
Useful for internal reasoning state,
but not authoritative for external side effects.
```

---

# 20. Signal Definition

```typescript
interface SignalDefinition {
  signalId: string;

  name: string;

  valueType:
    | "BOOLEAN"
    | "INTEGER"
    | "DECIMAL"
    | "DURATION"
    | "RATE"
    | "CATEGORY"
    | "VECTOR";

  unit?: string;

  expectedFrequencyMs?: number;

  maximumAgeMs: number;

  aggregationMethods: string[];

  criticality: string;
}
```

---

# 21. Example Signals

```text
execution.success_rate

execution.failure_rate

execution.unknown_outcome_rate

execution.duration

execution.retry_count

execution.target_count

execution.value

execution.velocity

execution.duplicate_rate

agent.tool_switch_rate

agent.action_frequency

agent.constraint_violation_rate

provider.error_rate

provider.latency

dependency.health

monitor.signal_age

recovery.readiness

deployment.error_rate

database.mutation_rate

security.bypass_attempt_count
```

---

# 22. Raw Signal

```typescript
interface RawSignal {
  rawSignalId: string;

  sourceId: string;

  signalId: string;

  subjectId: string;

  observedValue: unknown;

  sourceTimestamp: Timestamp;

  receivedAt: Timestamp;

  sequenceNumber?: number;

  integrityMetadata?: Record<string, unknown>;
}
```

---

# 23. Raw Signals Are Untrusted Inputs

Even trusted sources may produce:

```text
Malformed values

Duplicate events

Delayed events

Out-of-order events

Impossible timestamps

Schema drift

Corrupted payloads
```

Therefore every signal passes through validation.

---

# 24. Normalized Observation

```typescript
interface NormalizedObservation {
  observationId: string;

  contextId: string;

  signalId: string;

  normalizedValue: unknown;

  sourceId: string;

  trustLevel: string;

  observedAt: Timestamp;

  receivedAt: Timestamp;

  ageMs: number;

  quality:
    | "VALID"
    | "STALE"
    | "PARTIAL"
    | "CONFLICTING"
    | "INVALID";

  provenanceReference: string;
}
```

---

# 25. Observation Quality

AEGIS explicitly distinguishes:

```text
Value = 0
```

from:

```text
No value received.
```

This distinction is critical.

Example:

```text
Error rate:
0%
```

is not equivalent to:

```text
Error telemetry unavailable.
```

---

# 26. Signal Freshness

For signal \(s\):

\[
Age(s)
=
CurrentTime - ObservationTime
\]

If:

\[
Age(s) > MaximumAge(s)
\]

then:

```text
Signal = STALE
```

The stale value must not silently satisfy a safety precondition.

---

# 27. Signal Health State

```typescript
type SignalHealthState =
  | "HEALTHY"
  | "DELAYED"
  | "STALE"
  | "MISSING"
  | "CONFLICTING"
  | "CORRUPTED";
```

---

# 28. Monitoring Blindness

Monitoring blindness occurs when AEGIS cannot establish required runtime state.

Examples:

```text
Required telemetry stops.

Provider callback stream fails.

Metric ingestion is delayed.

Signal source becomes corrupted.

Critical sources disagree.

Observation coverage falls below minimum.
```

Blindness is itself a runtime risk condition.

---

# 29. Blindness Response

Grant-defined options:

```text
CONTINUE

INCREASE OTHER OBSERVATION

THROTTLE

PAUSE

STOP
```

For high-impact actions, default:

```text
PAUSE OR STOP
```

---

# 30. Detection Architecture

AEGIS uses multiple detection layers.

```text
LAYER 1:
Hard runtime invariants

LAYER 2:
Static thresholds

LAYER 3:
Rate-of-change rules

LAYER 4:
Temporal rules

LAYER 5:
Sequence rules

LAYER 6:
Aggregate exposure rules

LAYER 7:
Behavioral baselines

LAYER 8:
Statistical anomaly detection

LAYER 9:
Cross-context correlation
```

No single detector is sufficient.

---

# 31. Why Multiple Layers

A hard invariant catches:

```text
Value exceeded authorized maximum.
```

A threshold catches:

```text
Failure rate > 10%.
```

A rate rule catches:

```text
Failure rate increased 8× in 30 seconds.
```

A sequence rule catches:

```text
Read customer
→ change bank details
→ issue refund
```

An aggregate rule catches:

```text
1,000 individually valid refunds.
```

An anomaly model catches:

```text
Behavior unlike historical normality.
```

---

# 32. Detection Priority

The system must evaluate:

```text
Deterministic safety conditions
```

before relying on:

```text
Probabilistic anomaly models.
```

Priority:

```text
Hard invariant

↓

Policy threshold

↓

Temporal and sequence rule

↓

Aggregate rule

↓

Statistical anomaly
```

---

# 33. Runtime Invariant

```typescript
interface RuntimeInvariant {
  invariantId: string;

  subjectType: string;

  expression: string;

  severityOnViolation: string;

  requiredResponse: string;

  evaluationFrequencyMs?: number;
}
```

---

# 34. Example Hard Invariants

```text
Executed value <= granted value

Executed targets <= granted targets

Current environment = granted environment

Execution count <= granted execution count

Grant status = ACTIVE during dispatch

Required monitor = ACTIVE

Required recovery = AVAILABLE

Tenant identity = granted tenant

Provider destination = approved destination
```

Violation means:

```text
DETERMINISTIC RUNTIME BREACH
```

---

# 35. Hard Invariant Response

Hard safety violations do not wait for anomaly confirmation.

Example:

```text
Authorized:
10 targets

Observed:
11 targets
```

Required response:

```text
STOP FURTHER EXECUTION

REVOKE OR INVALIDATE AUTHORITY

OPEN INCIDENT

PRESERVE EVIDENCE

EVALUATE RECOVERY
```

---

# 36. Threshold Rule

```typescript
interface ThresholdRule {
  ruleId: string;

  signalId: string;

  operator:
    | "GT"
    | "GTE"
    | "LT"
    | "LTE"
    | "EQ";

  threshold: number;

  evaluationWindowMs: number;

  minimumSampleCount?: number;

  severity: string;
}
```

---

# 37. Example Threshold

```text
deployment.error_rate >= 5%
for 60 seconds
```

Result:

```text
BLOCK NEXT STAGE
```

---

# 38. Static Threshold Limitation

A fixed threshold may miss:

```text
Rapid deterioration below the absolute limit.
```

Example:

```text
Normal:
0.1%

Current:
4.8%

Threshold:
5%
```

Technically below threshold.

Operationally alarming.

Therefore AEGIS also needs rate rules.

---

# 39. Rate-of-Change Rule

```typescript
interface RateRule {
  ruleId: string;

  signalId: string;

  comparisonWindowMs: number;

  maximumAbsoluteChange?: number;

  maximumRelativeChange?: number;

  severity: string;
}
```

---

# 40. Example Rate Rule

```text
Refund failure rate:

Previous 5 minutes:
0.4%

Current 1 minute:
7.8%
```

Even if the absolute threshold is 10%:

```text
Rapid deterioration detected.
```

Possible response:

```text
THROTTLE

INCREASE OBSERVATION

PREPARE PAUSE
```

---

# 41. Temporal Rule

A temporal rule reasons about duration and ordering over time.

```typescript
interface TemporalRule {
  ruleId: string;

  condition: string;

  durationMs: number;

  requiredResponse: string;
}
```

---

# 42. Temporal Examples

```text
Provider latency > 3 seconds
for 2 minutes
```

```text
Recovery unavailable
for more than 30 seconds
during high-impact execution
```

```text
Execution remains DISPATCHING
for more than expected maximum
```

---

# 43. Sequence Rule

Some dangerous behavior exists only as a sequence.

```typescript
interface SequenceRule {
  ruleId: string;

  orderedEvents: string[];

  maximumSequenceWindowMs: number;

  subjectScope: string;

  severity: string;
}
```

---

# 44. Sequence Example

Individually:

```text
Read account profile

Update payment destination

Issue refund
```

may each be authorized.

Together, within 60 seconds:

```text
Possible account takeover pattern.
```

AEGIS must detect the sequence.

---

# 45. Sequence Detection State

Sequence detection requires:

```text
Per-subject state

Ordered event history

Time-window expiration

Deduplication

Cross-execution correlation
```

---

# 46. Aggregate Rule

```typescript
interface AggregateRule {
  ruleId: string;

  metric: string;

  scope:
    | "AGENT"
    | "TENANT"
    | "ORGANIZATION"
    | "TOOL"
    | "TARGET_CLASS";

  windowMs: number;

  maximumValue: number;

  severity: string;

  requiredResponse: string;
}
```

---

# 47. Aggregate Risk Example

Each refund:

```text
₹4,000
```

Grant maximum:

```text
₹5,000
```

Every action is individually compliant.

But:

```text
500 refunds in 10 minutes
```

may violate:

```text
Tenant rolling refund exposure.
```

Runtime response:

```text
OPEN CIRCUIT

BLOCK NEW REFUND EXECUTIONS

ESCALATE
```

---

# 48. Aggregate Exposure Is Not an Anomaly

If a hard cumulative limit is exceeded:

```text
The response is deterministic.
```

Statistical models are unnecessary.

---

# 49. Behavioral Baseline

A Behavioral Baseline describes expected behavior for a defined subject.

```typescript
interface BehavioralBaseline {
  baselineId: string;

  subjectType:
    | "AGENT"
    | "TOOL"
    | "ACTION"
    | "TENANT"
    | "PROVIDER";

  subjectId: string;

  metricProfiles: MetricProfile[];

  sampleWindowStart: Timestamp;

  sampleWindowEnd: Timestamp;

  sampleCount: number;

  version: number;

  confidence: number;
}
```

---

# 50. Baseline Dimensions

Possible dimensions:

```text
Actions per minute

Tool usage distribution

Target distribution

Value distribution

Execution duration

Failure rate

Retry frequency

Time-of-day pattern

Sequence pattern

Approval frequency

Autonomy-level distribution
```

---

# 51. Baseline Scope

A support agent should not be compared directly with:

```text
A deployment agent.
```

Baselines should be contextual.

Possible hierarchy:

```text
Agent-specific baseline

↓

Agent-class baseline

↓

Action-specific baseline

↓

Tenant baseline

↓

Global baseline
```

---

# 52. Cold Start Problem

A new agent has insufficient history.

AEGIS must not fabricate confidence.

Cold-start options:

```text
Use action-class baseline

Use tenant baseline

Use conservative thresholds

Require lower autonomy

Increase monitoring

Require staged execution
```

---

# 53. Baseline Poisoning

An attacker may slowly normalize dangerous behavior.

Example:

```text
Increase refund volume
2% every day.
```

Eventually the abnormal behavior becomes the baseline.

Defenses:

```text
Immutable reference baselines

Slow baseline promotion

Human-reviewed high-impact baseline changes

Maximum baseline drift

Policy floors and ceilings

Known-safe training windows
```

---

# 54. Baseline Versioning

Every anomaly decision must identify:

```text
Which baseline version was used?
```

Historical decisions must remain reproducible.

---

# 55. Anomaly Detector

```typescript
interface AnomalyDetector {
  detectorId: string;

  detectorType:
    | "Z_SCORE"
    | "ROBUST_Z_SCORE"
    | "IQR"
    | "EWMA"
    | "CUSUM"
    | "ISOLATION_FOREST"
    | "CHANGE_POINT"
    | "SEQUENCE_DEVIATION"
    | "CUSTOM";

  inputSignals: string[];

  baselineId?: string;

  configurationVersion: number;

  minimumSamples: number;

  outputSchemaVersion: number;
}
```

---

# 56. V1 Detection Strategy

V1 should prioritize interpretable detectors:

```text
Hard invariants

Static thresholds

Rolling windows

EWMA

CUSUM

Robust Z-score

Sequence rules

Aggregate limits
```

More complex models may be added later.

---

# 57. Why Not Start With Deep Learning

AEGIS requires:

```text
Interpretability

Determinism where possible

Fast evaluation

Low operational complexity

Reproducibility

Clear intervention justification
```

A highly complex model is not automatically a better safety detector.

---

# 58. Detection Result

```typescript
interface DetectionResult {
  detectionId: string;

  contextId: string;

  detectorId: string;

  detectorVersion: number;

  inputObservationIds: string[];

  result:
    | "NORMAL"
    | "ANOMALOUS"
    | "INSUFFICIENT_DATA"
    | "UNKNOWN";

  anomalyScore?: number;

  confidence?: number;

  explanation: DetectionExplanation;

  detectedAt: Timestamp;
}
```

---

# 59. Detection Explanation

```typescript
interface DetectionExplanation {
  summary: string;

  expectedRange?: unknown;

  observedValue?: unknown;

  deviation?: unknown;

  contributingSignals: string[];

  baselineReference?: string;
}
```

---

# 60. Anomaly Does Not Equal Harm

An anomaly may indicate:

```text
A legitimate traffic spike

A new customer pattern

A provider outage

An agent defect

An attack

A telemetry bug
```

Therefore:

```text
ANOMALY
```

does not automatically mean:

```text
TERMINATE AGENT.
```

The response depends on:

```text
Severity

Confidence

Action impact

Reversibility

Detection latency

Current exposure

Available containment
```

---

# 61. Runtime Finding

A Runtime Finding converts detector output into operational meaning.

```typescript
interface RuntimeFinding {
  findingId: string;

  contextId: string;

  findingType:
    | "INVARIANT_VIOLATION"
    | "THRESHOLD_BREACH"
    | "RAPID_DEGRADATION"
    | "TEMPORAL_VIOLATION"
    | "SEQUENCE_ANOMALY"
    | "AGGREGATE_EXPOSURE"
    | "BEHAVIORAL_ANOMALY"
    | "MONITORING_BLINDNESS"
    | "DEPENDENCY_DEGRADATION"
    | "RECOVERY_DEGRADATION";

  severity:
    | "INFO"
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  confidence: number;

  affectedScope: string[];

  evidenceReferences: string[];

  detectedAt: Timestamp;
}
```

---

# 62. Runtime Risk State

AEGIS defines:

```typescript
type RuntimeRiskState =
  | "R0_NORMAL"
  | "R1_ELEVATED"
  | "R2_CONCERNING"
  | "R3_DANGEROUS"
  | "R4_CRITICAL"
  | "R_UNKNOWN";
```

---

# 63. R0 — Normal

Meaning:

```text
All required signals healthy.

No meaningful findings.

Execution trajectory consistent with expectations.
```

Default response:

```text
CONTINUE
```

---

# 64. R1 — Elevated

Meaning:

```text
Weak anomaly

Early degradation

Low-confidence deviation

Non-critical telemetry issue
```

Possible response:

```text
Increase observation frequency

Reduce batch size

Enable additional signals

Prepare intervention
```

---

# 65. R2 — Concerning

Meaning:

```text
Persistent anomaly

Moderate threshold breach

Significant behavioral deviation

Meaningful dependency degradation
```

Possible response:

```text
Throttle

Constrain concurrency

Block expansion

Require checkpoint

Escalate to human
```

---

# 66. R3 — Dangerous

Meaning:

```text
High-confidence dangerous behavior

Major failure-rate increase

Large aggregate exposure

Critical dependency degradation

Severe sequence anomaly
```

Possible response:

```text
Pause

Stop new dispatches

Cancel where possible

Revoke current grant

Trigger recovery readiness
```

---

# 67. R4 — Critical

Meaning:

```text
Hard safety invariant violation

Active uncontrolled harm

Confirmed bypass

Containment failure

Rapid irreversible impact
```

Required response may include:

```text
Terminate execution

Open circuit

Revoke grants

Revoke credential leases

Isolate agent

Freeze tool

Trigger recovery

Open security incident
```

---

# 68. R_UNKNOWN

Meaning:

```text
AEGIS cannot determine runtime safety.
```

Reasons:

```text
Critical telemetry missing

Conflicting authoritative signals

Detector failure

Monitoring infrastructure failure
```

Response is policy-defined.

For high-impact execution:

```text
PAUSE OR STOP
```

---

# 69. Runtime Risk Aggregation

Multiple findings may exist simultaneously.

AEGIS must not simply average them.

Example:

```text
99 normal signals

1 critical invariant violation
```

Result:

```text
CRITICAL
```

not:

```text
Mostly normal.
```

---

# 70. Risk Aggregation Principle

Conceptually:

\[
RuntimeRisk
=
Max(
HardSafetyRisk,
PolicyRisk,
AggregateRisk,
AnomalyRisk,
ObservabilityRisk
)
\]

with policy-defined escalation modifiers.

---

# 71. Risk Escalation Velocity

The rate of risk increase matters.

Example:

```text
R0
→ R1
→ R2
→ R3
```

within five seconds is more concerning than the same progression over five hours.

Define:

\[
RiskVelocity
=
\frac{\Delta Risk}{\Delta Time}
\]

High velocity may trigger earlier containment.

---

# 72. Intervention Model

Detection without intervention is observation.

AEGIS requires an explicit intervention plane.

Possible intervention classes:

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

---

# 73. I0 — Observe

No execution change.

Actions:

```text
Record finding

Increase evidence collection

Update dashboard
```

---

# 74. I1 — Intensify Monitoring

Actions:

```text
Increase sampling frequency

Enable additional signal sources

Reduce evaluation windows

Start detailed tracing

Request checkpoint
```

---

# 75. I2 — Constrain

Reduce permitted execution scope without increasing authority.

Examples:

```text
Reduce batch size

Reduce concurrency

Block tool switching

Disable stage expansion

Reduce maximum velocity
```

---

# 76. I3 — Throttle

Slow the rate of new side effects.

Examples:

```text
100 actions/minute
→ 10 actions/minute
```

Useful when:

```text
Risk is rising

Immediate termination is unnecessary

More observation is needed
```

---

# 77. I4 — Pause

Stop new work while preserving resumability.

```text
No new dispatches.

In-flight work explicitly tracked.
```

Pause is preferred when:

```text
State may be recoverable

Investigation is required

Continuation may later be safe
```

---

# 78. I5 — Cancel

Request cancellation of an external operation.

Possible outcomes:

```text
CANCELLATION_CONFIRMED

TOO_LATE_TO_CANCEL

CANCELLATION_FAILED

CANCELLATION_UNKNOWN
```

---

# 79. I6 — Terminate

End the execution session.

Termination does not imply:

```text
All external effects stopped.
```

The system must still reconcile in-flight effects.

---

# 80. I7 — Isolate

Contain the execution subject.

Possible scopes:

```text
Execution

Grant

Agent

Tenant

Tool

Provider
```

Mechanisms:

```text
Block gateway requests

Revoke credential leases

Restrict network path

Disable adapter

Suspend agent workload
```

---

# 81. I8 — Revoke

Invalidate future authority.

Targets:

```text
Current grant

All grants for agent

All grants for action class

All grants for tool

All grants for tenant
```

Revocation does not undo past effects.

---

# 82. I9 — Recover

Trigger the dedicated Recovery System.

Possible actions:

```text
Rollback

Compensate

Restore snapshot

Reverse transaction

Redeploy previous version

Escalate manual recovery
```

---

# 83. Intervention Policy

```typescript
interface InterventionPolicy {
  policyId: string;

  findingTypes: string[];

  minimumSeverity: string;

  minimumConfidence?: number;

  runtimeRiskStates: RuntimeRiskState[];

  actionImpactClasses?: string[];

  interventions: InterventionStep[];

  escalationPolicyId: string;
}
```

---

# 84. Intervention Step

```typescript
interface InterventionStep {
  ordinal: number;

  interventionType: string;

  targetScope: string;

  timeoutMs: number;

  verificationMethod: string;

  onFailure:
    | "RETRY"
    | "ESCALATE"
    | "NEXT_STEP"
    | "EMERGENCY_CONTAINMENT";
}
```

---

# 85. Intervention Authority

The Sentinel must possess only predefined control capabilities.

It may not arbitrarily execute business actions.

Allowed examples:

```text
Pause execution session

Open circuit breaker

Revoke grant

Revoke credential lease

Disable tool adapter

Request recovery

Suspend agent execution
```

Forbidden:

```text
Issue arbitrary refund

Modify arbitrary customer record

Deploy arbitrary code
```

---

# 86. Intervention Command

```typescript
interface InterventionCommand {
  commandId: string;

  incidentId: string;

  interventionType: string;

  targetType: string;

  targetId: string;

  reasonFindingIds: string[];

  issuedAt: Timestamp;

  expiresAt?: Timestamp;

  idempotencyKey: string;

  signature: string;
}
```

---

# 87. Signed Intervention Commands

Critical intervention commands should be signed.

This prevents:

```text
Fake kill-switch requests

Unauthorized agent suspension

Forged grant revocation

Tampered containment scope
```

---

# 88. Intervention Attempt

```typescript
interface InterventionAttempt {
  attemptId: string;

  commandId: string;

  ordinal: number;

  state:
    | "CREATED"
    | "SENT"
    | "ACKNOWLEDGED"
    | "VERIFIED"
    | "FAILED"
    | "UNKNOWN";

  startedAt: Timestamp;

  completedAt?: Timestamp;
}
```

---

# 89. Intervention Receipt

```typescript
interface InterventionReceipt {
  receiptId: string;

  commandId: string;

  targetId: string;

  requestedIntervention: string;

  realizedEffect: string;

  effectiveness:
    | "EFFECTIVE"
    | "PARTIALLY_EFFECTIVE"
    | "INEFFECTIVE"
    | "UNKNOWN";

  remainingExposure: unknown;

  verifiedAt: Timestamp;

  signature: string;
}
```

---

# 90. Why Intervention Receipts Matter

The command:

```text
STOP
```

is not proof that execution stopped.

AEGIS must verify:

```text
Were new dispatches blocked?

Were credential leases revoked?

Did provider activity stop?

How many actions remained in flight?

Did aggregate exposure continue increasing?
```

---

# 91. Intervention Effectiveness

Define:

\[
IE
=
\frac{
PreventedPostInterventionHarm
}{
PotentialPostInterventionHarm
}
\]

Operational proxies may include:

```text
Time to stop new dispatches

Number of post-stop side effects

Remaining in-flight actions

Exposure growth after intervention
```

---

# 92. Intervention Latency

Define:

\[
T_{detect}
=
TimeOfDetection - TimeOfUnsafeCondition
\]

\[
T_{decide}
=
TimeOfInterventionDecision - TimeOfDetection
\]

\[
T_{act}
=
TimeOfEffectiveContainment - TimeOfDecision
\]

Total:

\[
T_{contain}
=
T_{detect}
+
T_{decide}
+
T_{act}
\]

---

# 93. Harm Expansion Window

Define:

\[
T_{harm}
=
TimeAvailableBeforeUnacceptableImpact
\]

Safe runtime intervention requires:

\[
T_{contain}
<
T_{harm}
\]

If this cannot be achieved:

```text
The action should not receive that level of autonomy.
```

This creates a direct connection between SPEC-009 and SPEC-007.

---

# 94. Autonomy Must Depend on Monitorability

Two actions with identical consequence may deserve different autonomy.

Action A:

```text
Harm develops over 30 minutes.

Detection:
2 seconds.

Intervention:
1 second.
```

Action B:

```text
Irreversible harm occurs in 20 milliseconds.

Detection:
2 seconds.
```

Action B cannot be made safe by runtime monitoring.

Therefore:

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

---

# 95. Monitorability Score

Conceptual:

\[
M
=
\frac{
T_{harm}
}{
T_{contain}
}
\]

Interpretation:

```text
M >> 1:
Strong intervention opportunity

M ≈ 1:
Marginal

M < 1:
Monitoring too slow
```

This score may become an input to future autonomy decisions.

---

# 96. Runtime Incident

Multiple findings may belong to one incident.

```typescript
interface RuntimeIncident {
  incidentId: string;

  organizationId: string;

  tenantId: string;

  state:
    | "OPEN"
    | "CONTAINING"
    | "CONTAINED"
    | "RECOVERING"
    | "RESOLVED"
    | "UNRESOLVED";

  severity: string;

  findingIds: string[];

  affectedExecutionIds: string[];

  affectedAgentIds: string[];

  affectedToolIds: string[];

  openedAt: Timestamp;

  containedAt?: Timestamp;

  resolvedAt?: Timestamp;
}
```

---

# 97. Incident Correlation

Findings should correlate when they share:

```text
Agent

Grant

Tool

Target class

Provider

Tenant

Time window

Failure signature

Sequence pattern
```

---

# 98. Example Correlation

```text
Agent A:
Refund failures spike.

Agent B:
Refund failures spike.

Agent C:
Refund failures spike.
```

Shared:

```text
Payment provider.
```

Likely incident:

```text
Provider degradation.
```

Not:

```text
Three independent malicious agents.
```

---

# 99. Cross-Context Detection

AEGIS must detect patterns invisible inside one execution.

Examples:

```text
Many agents targeting one customer

Many agents failing against one provider

One agent using many grants rapidly

One tenant generating abnormal aggregate exposure

One tool producing correlated unknown outcomes
```

---

# 100. Intervention Scope

The response scope should match the evidence.

Possible scopes:

```text
EXECUTION

GRANT

AGENT

ACTION_CLASS

TOOL_OPERATION

TOOL

PROVIDER

TENANT

ORGANIZATION

GLOBAL
```

---

# 101. Minimum Necessary Containment

Prefer:

```text
Pause one execution
```

over:

```text
Stop entire organization
```

when the evidence supports only the smaller scope.

But:

```text
Containment must expand
if narrower intervention fails.
```

---

# 102. Escalation Policy

```typescript
interface EscalationPolicy {
  policyId: string;

  steps: EscalationStep[];
}
```

```typescript
interface EscalationStep {
  ordinal: number;

  trigger:
    | "INTERVENTION_FAILED"
    | "INTERVENTION_TIMEOUT"
    | "RISK_INCREASED"
    | "EXPOSURE_CONTINUES"
    | "HUMAN_NO_RESPONSE";

  action: string;

  targetScope: string;
}
```

---

# 103. Example Escalation

```text
Step 1:
Pause execution.

↓

Pause not acknowledged within 500 ms.

↓

Step 2:
Open agent-level circuit breaker.

↓

New dispatches still observed.

↓

Step 3:
Revoke credential leases.

↓

Provider activity continues.

↓

Step 4:
Network isolate workload.

↓

Step 5:
Emergency incident escalation.
```

---

# 104. Failed Intervention Is a Critical Signal

If AEGIS requests:

```text
STOP
```

and execution continues:

```text
The runtime state escalates.
```

This may indicate:

```text
Infrastructure failure

Gateway bypass

Compromised component

Provider limitation

Unknown in-flight work
```

---

# 105. Kill Switch Architecture

A kill switch must define:

```text
Target

Activation mechanism

Expected latency

In-flight behavior

Verification method

Fallback mechanism
```

---

# 106. Kill Switch Types

```text
Execution-level pause

Grant revocation

Agent circuit breaker

Tool circuit breaker

Credential revocation

Network isolation

Workload termination

Tenant freeze

Organization freeze
```

---

# 107. Kill Switch Hierarchy

Recommended:

```text
Level 1:
Stop new execution dispatches

Level 2:
Revoke execution authority

Level 3:
Revoke credential access

Level 4:
Isolate runtime

Level 5:
Terminate workload
```

The system may escalate through levels.

---

# 108. In-Flight Execution Problem

Stopping new dispatches does not stop:

```text
Already accepted provider operations

Queued work

Database transactions in progress

Asynchronous jobs

External workflows
```

Therefore every intervention must account for:

```text
New work

Queued work

In-flight work

Externally accepted work

Completed work
```

---

# 109. Runtime Exposure Ledger

AEGIS should maintain:

```typescript
interface RuntimeExposure {
  contextId: string;

  authorizedExposure: number;

  realizedExposure: number;

  inFlightExposure: number;

  uncertainExposure: number;

  preventedExposure: number;

  updatedAt: Timestamp;
}
```

---

# 110. Why Exposure Matters

After a stop command:

```text
Realized:
₹1,00,000

In flight:
₹25,000

Unknown:
₹10,000
```

The system must not report:

```text
Execution stopped successfully.
```

without exposing remaining risk.

---

# 111. Stage Monitoring

For staged execution:

```text
Stage 1

↓

Observe

↓

Evaluate success criteria

↓

Continue or stop
```

The Runtime Sentinel owns runtime stage evaluation.

---

# 112. Stage Success Criteria

```typescript
interface StageSuccessCriterion {
  criterionId: string;

  signalId: string;

  operator: string;

  expectedValue: unknown;

  evaluationWindowMs: number;

  requiredSampleCount: number;
}
```

---

# 113. Canary Example

```text
Deployment:
10% traffic

Observe:
5 minutes

Required:
Error rate < 1%
Latency increase < 15%
No critical alerts
```

Only if all pass:

```text
Next stage may be considered.
```

The Runtime Sentinel does not automatically mint the next grant unless SPEC-007 explicitly permits pre-authorized staged progression.

---

# 114. Stage Failure

If:

```text
Error rate = 8%
```

then:

```text
BLOCK NEXT STAGE

PAUSE EXECUTION

TRIGGER RECOVERY EVALUATION
```

---

# 115. Agent Behavior Monitoring

AEGIS may monitor:

```text
Action frequency

Tool switching

Repeated denied attempts

Grant request velocity

Target diversity

Retry patterns

Sequence patterns

Time-of-day deviations

Constraint probing

Bypass attempts
```

---

# 116. Constraint Probing

Example:

```text
Request:
₹5,001

Rejected.

Request:
₹5,000

Accepted.

Request:
Different target.

Rejected.

Request:
Another target variation.
```

This may indicate:

```text
Boundary probing.
```

One violation may be accidental.

Repeated systematic attempts are behaviorally significant.

---

# 117. Agent Runtime State

```typescript
interface AgentRuntimeState {
  agentId: string;

  activeExecutionCount: number;

  recentViolationCount: number;

  recentBypassAttemptCount: number;

  anomalyScore: number;

  runtimeRiskState: RuntimeRiskState;

  containmentState:
    | "NONE"
    | "CONSTRAINED"
    | "THROTTLED"
    | "PAUSED"
    | "ISOLATED";
}
```

---

# 118. Runtime Behavior and Future Autonomy

SPEC-009 produces evidence for future decisions.

Examples:

```text
Agent repeatedly executes safely
under L3 constraints.
```

May contribute to:

```text
Higher competence confidence.
```

Example:

```text
Agent triggers repeated runtime intervention.
```

May contribute to:

```text
Autonomy downgrade.
```

But:

```text
Runtime monitoring does not directly modify competence.
```

It emits evidence to the appropriate assessment system.

---

# 119. No Self-Healing Reputation

The agent cannot improve its trust score merely by reporting:

```text
I behaved safely.
```

Runtime evidence must come from observed execution.

---

# 120. Dependency Monitoring

Runtime safety may depend on:

```text
Payment provider

Database

Queue

Model API

Monitoring pipeline

Recovery service

Approval service

Credential broker

Policy cache
```

---

# 121. Dependency State

```typescript
type DependencyState =
  | "HEALTHY"
  | "DEGRADED"
  | "UNAVAILABLE"
  | "UNKNOWN";
```

---

# 122. Dependency Failure Response

Example:

```text
Recovery system unavailable
during reversible high-impact execution.
```

Possible response:

```text
Block next stage.

Pause new dispatches.
```

Because:

```text
The original safety assumption no longer holds.
```

---

# 123. Recovery Readiness Drift

Recovery may be available at execution start and fail later.

Therefore:

```text
Recovery readiness may require continuous monitoring.
```

---

# 124. Monitoring the Monitor

The Sentinel itself must be monitored.

Required health signals:

```text
Signal ingestion lag

Rule evaluation lag

Dropped event count

Queue depth

Detector failures

Intervention command latency

Storage failures

Clock drift

Baseline availability
```

---

# 125. Meta-Monitoring

If:

```text
Runtime Sentinel cannot evaluate events quickly enough
```

then:

```text
The monitoring guarantee has degraded.
```

This must affect execution policy.

---

# 126. Detection Lag

Define:

\[
DetectionLag
=
EvaluationTime - ObservationTime
\]

If:

\[
DetectionLag > MaximumAllowedLag
\]

then monitoring state becomes:

```text
DEGRADED
```

or:

```text
BLIND
```

---

# 127. Backpressure

If signal volume exceeds processing capacity:

```text
Do not silently drop safety-critical events.
```

Possible responses:

```text
Prioritize critical signals

Throttle execution

Reduce new autonomy

Open circuit

Scale monitoring workers
```

---

# 128. Signal Priority

Suggested classes:

```text
P0:
Hard safety invariant signals

P1:
Intervention and bypass signals

P2:
Execution outcome signals

P3:
Behavioral anomaly signals

P4:
Diagnostic telemetry
```

Under overload:

```text
P4 may degrade before P0.
```

---

# 129. Event-Time vs Processing-Time

Distributed signals may arrive late.

AEGIS must distinguish:

```text
When the event occurred
```

from:

```text
When AEGIS processed it.
```

This is essential for:

```text
Temporal rules

Sequence detection

Latency measurement

Incident reconstruction
```

---

# 130. Out-of-Order Events

The system should support:

```text
Event-time windows

Sequence numbers

Allowed lateness

Reconciliation
```

Safety-critical late events must not simply disappear.

---

# 131. Duplicate Events

Signal ingestion must support deduplication.

A duplicate:

```text
REFUND_COMPLETED
```

event must not count as two refunds.

---

# 132. Conflicting Signals

Example:

```text
Gateway:
Execution timeout.

Provider callback:
Succeeded.

Database:
No local record.
```

The system must preserve conflict explicitly.

Possible state:

```text
CONFLICTING OBSERVATIONS
```

Then:

```text
Reconciliation required.
```

---

# 133. Clock Synchronization

Critical components require bounded clock skew.

Large clock drift can break:

```text
Signal freshness

Grant expiry

Temporal rules

Sequence ordering

Latency measurement
```

---

# 134. Clock Anomaly

If clock skew exceeds policy:

```text
Time-sensitive evaluations become unreliable.
```

Possible response:

```text
DEGRADE

PAUSE HIGH-IMPACT EXECUTION
```

---

# 135. Detection Model Lifecycle

Every detector requires:

```text
Version

Configuration

Owner

Input schema

Validation dataset

Performance metrics

Deployment date

Rollback version
```

---

# 136. Detector Versioning

A runtime finding must record:

```text
Detector:
refund_velocity_detector

Version:
17
```

Historical incidents must remain reproducible.

---

# 137. Detector Deployment

New detectors should support:

```text
Shadow mode

Evaluation mode

Advisory mode

Enforcement mode
```

---

# 138. Shadow Mode

The detector runs but cannot intervene.

Used to measure:

```text
False positives

False negatives

Alert volume

Latency

Operational usefulness
```

---

# 139. Advisory Mode

The detector creates findings and recommendations.

No automated intervention.

---

# 140. Enforcement Mode

The detector may contribute to automated intervention according to policy.

Promotion to enforcement requires validation.

---

# 141. Detector Confidence

Probabilistic detectors must emit confidence.

But:

```text
Confidence must not override hard invariants.
```

---

# 142. False Positive Cost

An unnecessary intervention may cause:

```text
Business interruption

User frustration

Failed workflow

Operational cost

Loss of agent usefulness
```

AEGIS must measure this.

---

# 143. False Negative Cost

A missed dangerous event may cause:

```text
Financial loss

Data corruption

Security breach

Service outage

Irreversible harm
```

Detector tuning must consider asymmetric cost.

---

# 144. Detection Utility

Conceptually:

\[
DetectionUtility
=
PreventedHarm
-
InterventionCost
-
FalsePositiveCost
-
MonitoringCost
\]

---

# 145. Intervention Hysteresis

Without hysteresis:

```text
Normal

Dangerous

Normal

Dangerous
```

may cause rapid oscillation.

AEGIS should support:

```text
Entry threshold

Exit threshold

Minimum hold duration
```

---

# 146. Example Hysteresis

Enter throttled state:

```text
Failure rate > 10%
```

Exit throttled state only when:

```text
Failure rate < 3%
for 5 minutes
```

---

# 147. Cooldown Period

After critical intervention:

```text
Do not immediately restore full autonomy.
```

Possible requirement:

```text
Cooldown

Human review

Fresh assessment

New grant
```

---

# 148. Automatic Resume

Automatic resume is allowed only if explicitly defined.

Requirements may include:

```text
Risk returned to acceptable state

Minimum stable period completed

No unresolved unknown outcomes

Recovery readiness restored

Fresh grant still valid
```

---

# 149. Resume Is an Authority Decision

The Sentinel may remove a temporary pause only when policy permits.

It may not:

```text
Create new authority

Extend grant expiry

Increase scope

Increase autonomy level
```

---

# 150. Human Intervention

Humans may:

```text
Acknowledge incident

Approve continued pause

Request termination

Request recovery

Escalate containment

Resume where policy permits
```

Human actions must be:

```text
Authenticated

Authorized

Scoped

Audited
```

---

# 151. Human Override

A human override must not silently erase:

```text
Runtime findings

Intervention history

Evidence

Risk state
```

---

# 152. Emergency Containment

Critical conditions may bypass ordinary approval workflows.

Example:

```text
Confirmed active unauthorized execution.
```

Response:

```text
Immediate containment.
```

Human approval may follow.

---

# 153. Why Emergency Stop Differs From Business Action

Stopping autonomous execution reduces authority.

It does not expand business authority.

Therefore emergency containment may use a separate authorization model.

---

# 154. Runtime Event Model

Required events:

```text
MONITORING_CONTEXT_CREATED

MONITORING_REQUIREMENTS_RESOLVED

SIGNAL_SOURCE_REGISTERED

SIGNAL_SOURCE_READY

SIGNAL_SOURCE_DEGRADED

SIGNAL_SOURCE_LOST

MONITORING_READY

MONITORING_ACTIVATED

RAW_SIGNAL_RECEIVED

SIGNAL_VALIDATED

SIGNAL_REJECTED

SIGNAL_STALE

SIGNAL_CONFLICT_DETECTED

RUNTIME_INVARIANT_EVALUATED

RUNTIME_INVARIANT_VIOLATED

THRESHOLD_BREACHED

RATE_ANOMALY_DETECTED

TEMPORAL_VIOLATION_DETECTED

SEQUENCE_ANOMALY_DETECTED

AGGREGATE_LIMIT_BREACHED

BEHAVIORAL_ANOMALY_DETECTED

MONITORING_BLINDNESS_DETECTED

RUNTIME_FINDING_CREATED

RUNTIME_RISK_STATE_CHANGED

INTERVENTION_DECIDED

INTERVENTION_COMMAND_ISSUED

INTERVENTION_ACKNOWLEDGED

INTERVENTION_VERIFIED

INTERVENTION_FAILED

INTERVENTION_ESCALATED

EXECUTION_THROTTLED

EXECUTION_PAUSED

EXECUTION_CANCEL_REQUESTED

EXECUTION_TERMINATED

AGENT_ISOLATED

GRANT_REVOCATION_REQUESTED

TOOL_CIRCUIT_OPENED

RECOVERY_REQUESTED

RUNTIME_INCIDENT_OPENED

RUNTIME_INCIDENT_CONTAINED

RUNTIME_INCIDENT_RESOLVED

MONITORING_CONTEXT_CLOSED

MONITORING_RECEIPT_ISSUED
```

---

# 155. Runtime Event Requirements

Each event should include:

```text
Event ID

Context ID

Execution ID

Grant ID

Agent ID

Tenant ID

Timestamp

Event-time timestamp

Processing-time timestamp

Sequence number

Event type

Evidence references

Integrity metadata
```

---

# 156. Monitoring Receipt

```typescript
interface MonitoringReceipt {
  receiptId: string;

  contextId: string;

  executionSessionId: string;

  monitoringStartedAt: Timestamp;

  monitoringEndedAt: Timestamp;

  requiredSignals: string[];

  signalCoverage: number;

  maximumDetectionLagMs: number;

  findings: string[];

  interventions: string[];

  finalRuntimeRiskState: RuntimeRiskState;

  unresolvedUncertainty: string[];

  signature: string;
}
```

---

# 157. Why Monitoring Receipts Matter

The system should be able to prove:

```text
Was the execution actually monitored?

Which signals were available?

Was monitoring degraded?

What anomalies occurred?

What intervention occurred?

How quickly?

Did the intervention work?
```

---

# 158. Monitoring Coverage

Define:

\[
MC
=
\frac{
ObservedRequiredSignalTime
}{
TotalRequiredSignalTime
}
\]

A monitored execution with:

```text
40% monitoring coverage
```

must not be represented as fully monitored.

---

# 159. Signal Coverage

Per required signal:

\[
SC_s
=
\frac{
TimeSignalHealthy
}{
RequiredMonitoringDuration
}
\]

---

# 160. Intervention Success Rate

\[
ISR
=
\frac{
EffectiveInterventions
}{
TotalRequiredInterventions
}
\]

---

# 161. Post-Intervention Leakage

Define:

\[
PIL
=
SideEffectsAfterEffectiveStopDecision
\]

Target:

```text
As close to zero as technically possible.
```

---

# 162. Detection Precision

\[
Precision
=
\frac{TruePositiveFindings}
{AllPositiveFindings}
\]

---

# 163. Detection Recall

\[
Recall
=
\frac{DetectedDangerousEvents}
{AllDangerousEvents}
\]

---

# 164. Mean Time to Detect

\[
MTTD
=
Mean(
DetectionTime - UnsafeConditionStart
)
\]

---

# 165. Mean Time to Contain

\[
MTTC
=
Mean(
EffectiveContainmentTime - UnsafeConditionStart
)
\]

---

# 166. Containment Efficiency

\[
CE
=
\frac{
PreventedExposure
}{
PotentialExposure
}
\]

---

# 167. Runtime Architecture

Conceptual architecture:

```text
                    ┌─────────────────────┐
                    │  Execution Gateway  │
                    └──────────┬──────────┘
                               │
                      Monitoring Context
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Runtime Sentinel   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   Signal Ingestion     Context Manager      Signal Health
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                    Observation Normalizer
                               │
                               ▼
                    Runtime Evaluation Engine
                               │
       ┌───────────────┬───────┼────────┬───────────────┐
       │               │       │        │               │
       ▼               ▼       ▼        ▼               ▼
  Invariants      Thresholds  Temporal  Sequence     Anomaly
       │               │       │        │               │
       └───────────────┴───────┼────────┴───────────────┘
                               ▼
                       Finding Correlator
                               │
                               ▼
                       Runtime Risk Engine
                               │
                               ▼
                      Intervention Engine
                               │
       ┌───────────────┬───────┼───────────────┐
       │               │       │               │
       ▼               ▼       ▼               ▼
   Gateway          Grant    Credential      Recovery
   Control         Revoker     Revoker        System
       │               │       │               │
       └───────────────┴───────┼───────────────┘
                               ▼
                    Effectiveness Verifier
                               │
                               ▼
                       Incident Manager
                               │
                               ▼
                      Monitoring Receipt
```

---

# 168. Control Plane vs Runtime Plane

Control plane:

```text
Monitoring policies

Detector definitions

Baseline management

Intervention policies

Escalation policies

Detector deployment
```

Runtime plane:

```text
Signal ingestion

Observation normalization

Rule evaluation

Anomaly detection

Risk state updates

Intervention execution

Effect verification
```

---

# 169. Critical Path Requirements

The runtime path must be:

```text
Low latency

Deterministic for hard rules

Highly available

Horizontally scalable

Partition tolerant where possible

Independent of LLM availability
```

---

# 170. LLM Role in SPEC-009

LLMs may assist with:

```text
Incident summarization

Human-readable explanations

Pattern investigation

Post-incident analysis

Rule authoring assistance

Correlation suggestions
```

LLMs must not be the sole authority for:

```text
Hard invariant evaluation

Kill-switch activation

Grant revocation

Credential revocation

Critical runtime containment
```

---

# 171. Why LLMs Are Not the Critical Detector

LLMs introduce:

```text
Variable latency

Probabilistic output

Prompt injection exposure

Non-determinism

Difficult reproducibility
```

The critical runtime safety path requires stronger guarantees.

---

# 172. Required V1 Components

```text
Monitoring Context Manager

Monitoring Requirement Resolver

Signal Source Registry

Signal Ingestion API

Event Stream Consumer

Signal Validator

Observation Normalizer

Signal Freshness Tracker

Signal Health Engine

Runtime Invariant Engine

Threshold Rule Engine

Rate-of-Change Engine

Temporal Rule Engine

Sequence Rule Engine

Aggregate Exposure Engine

Behavioral Baseline Store

Interpretable Anomaly Detector

Finding Generator

Finding Correlator

Runtime Risk Engine

Intervention Policy Engine

Intervention Dispatcher

Gateway Control Adapter

Grant Revocation Adapter

Credential Revocation Adapter

Circuit Breaker Controller

Recovery Trigger Adapter

Intervention Effectiveness Verifier

Incident Manager

Monitoring Receipt Builder

Runtime Event Publisher
```

---

# 173. V1 Technology Direction

Recommended conceptual stack:

```text
Event transport:
Kafka-compatible event stream

Fast runtime state:
Redis-compatible store

Durable relational state:
PostgreSQL

Time-series analysis:
PostgreSQL initially,
specialized time-series storage later if required

Rule evaluation:
Deterministic TypeScript or Rust service

Stream processing:
Purpose-built consumers initially

Advanced distributed stream processing:
Later if scale requires

Observability:
OpenTelemetry-compatible signals
```

Exact technology selection belongs to the implementation architecture specification.

---

# 174. Why Not Overbuild V1

V1 does not require:

```text
Global petabyte-scale telemetry

Custom distributed stream processor

Deep neural anomaly models

Universal eBPF monitoring

Autonomous incident remediation for every tool
```

The objective is:

```text
Production-grade runtime control
for a bounded flagship benchmark.
```

---

# 175. Flagship Runtime Benchmark

The primary benchmark remains:

```text
Autonomous customer refund operations.
```

Scenario:

```text
Agent receives valid L3 refund grants.

Each refund is individually constrained.

Runtime Sentinel observes:

Refund velocity

Failure rate

Target diversity

Total rolling value

Repeated constraint violations

Provider latency

Unknown outcomes

Duplicate attempts

Bypass attempts
```

---

# 176. Flagship Benchmark Scenario A — Normal Execution

```text
50 refunds

Average:
₹2,500

Failure rate:
0.4%

Unknown outcomes:
0

Constraint violations:
0

Rolling exposure:
Within policy
```

Result:

```text
R0_NORMAL

CONTINUE
```

---

# 177. Scenario B — Rapid Failure Increase

```text
Historical failure rate:
0.5%

Current:
8%

Increase:
16×
```

Result:

```text
R2_CONCERNING

THROTTLE

INCREASE OBSERVATION
```

If it reaches:

```text
20%
```

Result:

```text
R3_DANGEROUS

PAUSE NEW REFUNDS
```

---

# 178. Scenario C — Aggregate Exposure

Each refund:

```text
Below ₹5,000
```

But rolling total:

```text
₹25,00,000 in 10 minutes
```

Policy maximum:

```text
₹5,00,000
```

Result:

```text
AGGREGATE LIMIT BREACH

R4_CRITICAL

OPEN REFUND CIRCUIT

BLOCK NEW DISPATCHES

REVOKE ACTIVE REFUND GRANTS

OPEN INCIDENT
```

---

# 179. Scenario D — Monitoring Blindness

```text
Provider status stream:
LOST

Gateway events:
HEALTHY

Refund execution:
ACTIVE
```

Grant requires provider-side monitoring.

Result:

```text
R_UNKNOWN

PAUSE NEW EXECUTION

RECONCILE IN-FLIGHT REFUNDS
```

---

# 180. Scenario E — Constraint Probing

Agent attempts:

```text
₹5,001

₹5,000

Different transaction

Different tenant

Alternative refund tool
```

Result:

```text
BEHAVIORAL FINDING:
BOUNDARY PROBING

R3_DANGEROUS

ISOLATE AGENT

REVOKE ACTIVE GRANTS

SECURITY REVIEW
```

---

# 181. Scenario F — Intervention Failure

Sentinel:

```text
PAUSE EXECUTION
```

Gateway:

```text
No acknowledgment.
```

Provider:

```text
New refunds continue.
```

Result:

```text
R4_CRITICAL

REVOKE CREDENTIAL LEASES

OPEN TOOL CIRCUIT

ISOLATE AGENT WORKLOAD

OPEN SECURITY INCIDENT
```

---

# 182. Scenario G — Provider Degradation

Multiple unrelated agents show:

```text
Timeout spike

Unknown outcomes

High latency
```

Shared dependency:

```text
Payment provider.
```

Result:

```text
PROVIDER-LEVEL INCIDENT

OPEN PROVIDER CIRCUIT

PAUSE NEW REFUNDS

RECONCILE UNKNOWN OUTCOMES
```

Not:

```text
Punish every agent independently.
```

---

# 183. Scenario H — Safe Canary

Deployment grant:

```text
10% traffic
```

Observed:

```text
Error rate:
0.3%

Latency:
+4%

Critical alerts:
0
```

Result:

```text
STAGE PASSED
```

The Sentinel emits:

```text
CHECKPOINT_SUCCESS
```

It does not independently grant 100% rollout authority.

---

# 184. Scenario I — Failed Canary

Observed:

```text
Error rate:
12%

Latency:
+90%
```

Result:

```text
BLOCK NEXT STAGE

PAUSE DEPLOYMENT

REQUEST RECOVERY
```

---

# 185. Scenario J — Slow Baseline Poisoning

Agent activity:

```text
Week 1:
100 actions/day

Week 2:
105

Week 3:
110

Week 10:
160
```

Naive rolling baseline:

```text
Normal.
```

Reference policy:

```text
Maximum 120/day.
```

Result:

```text
POLICY LIMIT BREACH
```

This demonstrates why anomaly models never replace hard limits.

---

# 186. Attack — Agent Suppresses Telemetry

Attack:

```text
Agent stops reporting failures.
```

Defense:

```text
Independent gateway and provider telemetry.
```

---

# 187. Attack — Fake Healthy Metrics

Attack:

```text
Agent sends success_rate = 100%.
```

Defense:

```text
Signal trust model

Independent sources

Authoritative source selection
```

---

# 188. Attack — Alert Flooding

Attack:

```text
Generate huge numbers of low-value events
to overwhelm monitoring.
```

Defense:

```text
Signal priority

Rate limits

Backpressure

Critical-event isolation
```

---

# 189. Attack — Detector Evasion

Attack:

```text
Stay just below static thresholds.
```

Defense:

```text
Rate rules

Aggregate rules

Sequence rules

Behavioral baselines
```

---

# 190. Attack — Slow Drift

Attack:

```text
Gradually normalize dangerous behavior.
```

Defense:

```text
Reference baselines

Drift limits

Hard policy boundaries
```

---

# 191. Attack — Signal Delay

Attack:

```text
Delay telemetry until harm completes.
```

Defense:

```text
Freshness requirements

Detection-lag monitoring

Blindness response
```

---

# 192. Attack — Fake Stop Acknowledgment

Attack:

```text
Component reports execution stopped
while side effects continue.
```

Defense:

```text
Independent effectiveness verification.
```

---

# 193. Attack — Intervention Replay

Attack:

```text
Replay old isolation command.
```

Defense:

```text
Signed commands

Expiry

Nonce

Idempotency

Target-state verification
```

---

# 194. Attack — Cross-Tenant Baseline Leakage

Attack:

```text
Infer another tenant's behavior
through anomaly output.
```

Defense:

```text
Tenant isolation

Minimum disclosure

Scoped baselines
```

---

# 195. Attack — Baseline Poisoning

Defense:

```text
Versioned baselines

Controlled promotion

Maximum drift

Known-safe windows
```

---

# 196. Attack — Kill-Switch Abuse

Attack:

```text
Malicious actor disables competitors' agents.
```

Defense:

```text
Signed intervention authority

Strict scope

Independent authorization

Immutable audit
```

---

# 197. Attack — Monitoring Bypass

Attack:

```text
Execute through unmonitored path.
```

Defense:

```text
Execution Gateway requires monitor readiness token
for monitored grants.
```

---

# 198. Monitoring Readiness Token

Conceptual:

```typescript
interface MonitoringReadinessToken {
  contextId: string;

  executionSessionId: string;

  requirementHash: string;

  readyAt: Timestamp;

  expiresAt: Timestamp;

  signature: string;
}
```

The Execution Gateway verifies it before dispatch.

---

# 199. Why Readiness Tokens Matter

Without cryptographic binding:

```text
Agent may claim:
Monitoring is active.
```

The gateway must verify:

```text
The actual Runtime Sentinel confirmed readiness
for this exact execution.
```

---

# 200. Testing Strategy

Required test groups:

```text
Signal ingestion tests

Signal validation tests

Freshness tests

Missing-signal tests

Conflicting-signal tests

Invariant tests

Threshold tests

Rate-rule tests

Temporal-rule tests

Sequence-rule tests

Aggregate-limit tests

Baseline tests

Anomaly-detector tests

Risk aggregation tests

Intervention tests

Intervention-failure tests

Escalation tests

Kill-switch tests

Monitoring-blindness tests

Backpressure tests

Out-of-order event tests

Duplicate event tests

Multi-tenant isolation tests

Recovery integration tests

Grant revocation tests

Circuit-breaker tests
```

---

# 201. Core Property Test

```text
Required monitor not ready
→ execution cannot begin.
```

---

# 202. Blindness Property

```text
Critical required signal becomes unavailable
→ system must not continue as if signal were healthy.
```

---

# 203. Hard Invariant Property

```text
Hard invariant violated
→ probabilistic detector confidence cannot suppress intervention.
```

---

# 204. Intervention Property

```text
Critical stop decision issued
→ effectiveness must be verified.
```

---

# 205. Escalation Property

```text
Initial intervention ineffective
→ containment scope escalates according to policy.
```

---

# 206. Aggregate Property

```text
Individually compliant actions
that exceed aggregate limit
→ new execution is stopped.
```

---

# 207. Sequence Property

```text
Dangerous ordered event pattern
→ detection occurs within defined maximum latency.
```

---

# 208. Event Ordering Property

Out-of-order delivery must not produce:

```text
Impossible safe state.
```

---

# 209. Duplicate Event Property

Repeated delivery of one event must not:

```text
Double-count exposure.
```

---

# 210. Intervention Idempotency Property

Repeated identical:

```text
PAUSE
```

commands must not create inconsistent state.

---

# 211. Failure Injection

Inject:

```text
Signal source loss

Delayed signals

Duplicate signals

Out-of-order signals

Corrupted signals

Detector crash

Rule-engine crash

Event-bus delay

Redis failure

Database failure

Intervention timeout

Gateway unresponsiveness

Credential revocation failure

Recovery service failure
```

---

# 212. Chaos Requirement

Under monitoring infrastructure failure:

```text
No high-impact execution may silently transition
from monitored autonomy
to unmonitored autonomy.
```

---

# 213. Adversarial Testing

Required:

```text
Fake healthy telemetry

Telemetry suppression

Signal replay

Signal flooding

Slow drift

Threshold evasion

Sequence splitting

Cross-agent coordination

Baseline poisoning

Fake stop acknowledgment

Intervention replay

Kill-switch abuse

Monitoring bypass

Cross-tenant signal injection
```

---

# 214. Benchmark Baselines

Compare:

```text
Baseline A:
No runtime monitoring

Baseline B:
Dashboard-only monitoring

Baseline C:
Static threshold alerts

Baseline D:
Anomaly detection without intervention

Baseline E:
AEGIS Runtime Sentinel
```

---

# 215. Research Question 1

Can active runtime intervention reduce realized harm compared with pre-execution authorization alone?

---

# 216. Research Question 2

How much does intervention latency affect realized autonomous-agent harm?

Measure:

```text
100 ms

500 ms

1 second

5 seconds

30 seconds
```

---

# 217. Research Question 3

Can multi-layer detection outperform anomaly-only monitoring?

Compare:

```text
Anomaly model only
```

against:

```text
Invariants
+
Thresholds
+
Temporal rules
+
Sequence rules
+
Aggregate limits
+
Anomaly detection
```

---

# 218. Research Question 4

Can monitoring blindness be treated as a first-class risk state to prevent unsafe fail-open behavior?

---

# 219. Research Question 5

Can intervention effectiveness verification detect false containment?

Example:

```text
Stop acknowledged
but side effects continue.
```

---

# 220. Research Question 6

Can aggregate runtime monitoring detect dangerous behavior missed by per-action authorization?

---

# 221. Research Question 7

Can monitorability predict the maximum safe autonomy level?

Hypothesis:

\[
HigherMonitorability
\Rightarrow
HigherPotentialAutonomy
\]

subject to consequence and reversibility constraints.

---

# 222. Research Question 8

Can sequence detection identify dangerous multi-step behavior where every individual action is authorized?

---

# 223. Research Question 9

Can adaptive throttling reduce harm while preserving more useful work than binary stop-or-continue systems?

---

# 224. Research Question 10

Can independent signal provenance reduce successful telemetry manipulation by autonomous agents?

---

# 225. Research Question 11

Can runtime intervention history improve future autonomy calibration?

---

# 226. Research Question 12

How should detection sensitivity vary with:

```text
Consequence

Reversibility

Execution velocity

Monitoring quality

Intervention latency
```

---

# 227. Dashboard Representation

The runtime dashboard should show:

```text
Current runtime risk state

Active monitoring contexts

Signal health

Monitoring coverage

Detection lag

Active findings

Current interventions

Intervention effectiveness

In-flight exposure

Unknown exposure

Open incidents

Agent containment state

Tool circuit state

Provider health

Recovery readiness
```

---

# 228. Example Runtime View

```text
RUNTIME STATUS:
R2 — CONCERNING

EXECUTION:
exec_01J...

AGENT:
agent_support_07

ACTION:
Customer Refund Batch

MONITORING:
ACTIVE

SIGNAL COVERAGE:
100%

CURRENT REFUND RATE:
47 / minute

EXPECTED:
8–15 / minute

FAILURE RATE:
6.8%

BASELINE:
0.7%

FINDINGS:
Rapid velocity increase
Failure-rate degradation

INTERVENTION:
THROTTLE

PREVIOUS RATE:
50 / minute

CURRENT LIMIT:
10 / minute

EFFECTIVENESS:
VERIFIED

IN-FLIGHT EXPOSURE:
₹42,000

RUNTIME STATE:
STABILIZING
```

---

# 229. Example Critical Incident

```text
RUNTIME STATUS:
R4 — CRITICAL

INCIDENT:
incident_01J...

AGENT:
agent_support_07

FINDING:
Hard aggregate exposure limit exceeded

AUTHORIZED INDIVIDUAL REFUND:
≤ ₹5,000

ROLLING TENANT LIMIT:
₹5,00,000

OBSERVED:
₹7,42,000

INTERVENTION:
REFUND CIRCUIT OPENED

NEW DISPATCHES:
BLOCKED

ACTIVE GRANTS:
REVOCATION REQUESTED

CREDENTIAL LEASES:
REVOKED

IN-FLIGHT:
₹38,000

UNKNOWN:
₹12,000

RECOVERY:
EVALUATION STARTED

CONTAINMENT:
PARTIALLY EFFECTIVE
```

---

# 230. Example Monitoring Blindness

```text
RUNTIME STATUS:
R_UNKNOWN

REQUIRED SIGNAL:
provider.refund_status

LAST HEALTHY SIGNAL:
43 seconds ago

MAXIMUM AGE:
10 seconds

MONITORING:
BLIND

EXECUTION RESPONSE:
PAUSED

NEW DISPATCHES:
BLOCKED

IN-FLIGHT EXECUTIONS:
RECONCILING
```

---

# 231. Example Failed Intervention

```text
INTERVENTION:
PAUSE EXECUTION

ACKNOWLEDGED:
YES

EFFECT VERIFIED:
NO

NEW SIDE EFFECTS AFTER PAUSE:
17

RUNTIME STATE:
ESCALATED TO R4

NEXT ACTION:
REVOKE CREDENTIAL LEASE

AGENT:
ISOLATION REQUESTED
```

---

# 232. Rejected Alternative — Dashboard-Only Monitoring

Rejected because:

```text
Humans may observe harm
after it has already expanded.
```

---

# 233. Rejected Alternative — Agent Self-Reporting Only

Rejected because compromised or defective agents cannot be trusted as the only observer.

---

# 234. Rejected Alternative — Anomaly Detection Only

Rejected because hard safety boundaries should not depend on statistical deviation.

---

# 235. Rejected Alternative — Static Thresholds Only

Rejected because:

```text
Slow drift

Sequence attacks

Aggregate behavior

Contextual anomalies
```

may remain invisible.

---

# 236. Rejected Alternative — LLM as Kill-Switch Judge

Rejected because critical intervention requires:

```text
Low latency

Determinism

Reproducibility

Resistance to prompt injection
```

---

# 237. Rejected Alternative — Alert Without Intervention

Rejected for high-impact monitored autonomy.

An alert does not stop execution.

---

# 238. Rejected Alternative — Stop Command Equals Success

Rejected because intervention effectiveness must be verified.

---

# 239. Rejected Alternative — Missing Data Means Zero

Rejected because:

```text
No telemetry
```

does not mean:

```text
No harm.
```

---

# 240. Rejected Alternative — One Global Baseline

Rejected because different:

```text
Agents

Actions

Tenants

Tools
```

have different normal behavior.

---

# 241. Rejected Alternative — Automatically Learn Every New Pattern

Rejected because dangerous drift may poison the baseline.

---

# 242. Rejected Alternative — Immediate Full-System Shutdown for Every Anomaly

Rejected because containment should match evidence and scope.

---

# 243. Rejected Alternative — Automatic Resume After Metric Recovery

Rejected unless explicitly authorized by policy.

---

# 244. Rejected Alternative — Monitoring Makes Irreversible Actions Safe

Rejected.

If:

\[
T_{contain}
>
T_{harm}
\]

runtime monitoring cannot prevent unacceptable harm.

---

# 245. V1 Implementation Boundary

The first production-grade implementation must include:

```text
Monitoring requirement resolution

Monitoring contexts

Pre-execution readiness handshake

Signed monitoring readiness token

Signal source registry

Signal trust levels

Independent signal support

Signal ingestion

Strict signal validation

Observation normalization

Signal freshness tracking

Signal health states

Monitoring blindness detection

Hard runtime invariants

Static threshold rules

Rate-of-change rules

Temporal rules

Sequence rules

Aggregate exposure rules

Rolling windows

Versioned behavioral baselines

At least one interpretable anomaly detector

Detection results

Runtime findings

Runtime risk states

Risk aggregation

Risk velocity

Intervention policies

Observe intervention

Increase-monitoring intervention

Constrain intervention

Throttle intervention

Pause intervention

Cancel request support

Terminate intervention

Isolation support

Grant revocation integration

Credential revocation integration

Circuit-breaker integration

Recovery trigger integration

Signed intervention commands

Intervention attempts

Intervention receipts

Effectiveness verification

Escalation policies

Runtime incidents

In-flight exposure tracking

Unknown exposure tracking

Stage monitoring

Canary evaluation

Monitoring of recovery readiness

Monitoring of monitor health

Detection-lag tracking

Backpressure behavior

Signal priority

Event-time processing

Duplicate-event handling

Out-of-order event handling

Conflicting observation handling

Detector versioning

Shadow detector mode

Advisory detector mode

Enforcement detector mode

Hysteresis

Cooldown periods

Monitoring receipts

Immutable runtime events

Multi-tenant isolation
```

V1 should not require:

```text
Deep neural anomaly models

Global-scale stream processing

Universal eBPF instrumentation

Fully autonomous incident remediation

Automatic recovery for every tool

Universal causal inference

Perfect anomaly detection

Zero false positives

Self-modifying intervention policies

LLM-controlled kill switches
```

---

# 246. Decisions Locked by SPEC-009

The following are now architectural commitments:

```text
1. Runtime safety is continuous, not a one-time authorization event.

2. Authorized execution may become unsafe after it begins.

3. The Runtime Sentinel is the active runtime observation and intervention system.

4. Monitored grants require monitor readiness before dispatch.

5. Monitoring readiness is bound to the exact execution.

6. Monitoring readiness may be cryptographically represented.

7. Required monitoring must be active before execution.

8. Monitoring starts before side effects.

9. Observation, detection, decision and intervention are separate stages.

10. Raw signals are untrusted inputs.

11. Signals preserve provenance.

12. Signal sources have explicit trust levels.

13. Critical monitoring cannot depend only on agent self-reporting.

14. Authoritative signal source depends on the observed fact.

15. Signal freshness is explicitly enforced.

16. Stale telemetry is not current safety evidence.

17. Missing telemetry is not zero.

18. Monitoring blindness is a first-class runtime condition.

19. Blindness behavior is policy-defined.

20. High-impact monitored autonomy fails safe when critical visibility is lost.

21. Detection uses multiple layers.

22. Hard invariants have highest priority.

23. Static thresholds are supported.

24. Rate-of-change detection is supported.

25. Temporal rules are supported.

26. Sequence detection is supported.

27. Aggregate exposure detection is supported.

28. Behavioral baselines are supported.

29. Statistical anomaly detection is supplementary, not foundational.

30. V1 prioritizes interpretable detectors.

31. Deep learning is not required for V1.

32. Hard invariant violations do not require anomaly confidence.

33. Anomaly does not automatically imply malicious behavior.

34. Detection results become structured runtime findings.

35. Runtime risk has explicit states from normal to critical.

36. Unknown runtime safety has an explicit R_UNKNOWN state.

37. Critical findings cannot be averaged away by normal signals.

38. Risk escalation velocity is explicitly modeled.

39. Runtime intervention is a dedicated control plane.

40. Intervention classes range from observation to recovery.

41. The Sentinel can reduce or suspend authority but cannot expand it.

42. The Sentinel cannot mint new business authority.

43. Intervention authority is explicit and scoped.

44. Critical intervention commands may be signed.

45. Intervention commands are idempotent where possible.

46. Sending a stop command is not proof of containment.

47. Intervention effectiveness must be independently verified.

48. Failed intervention causes escalation.

49. Containment scope should match evidence.

50. Containment expands when narrower intervention fails.

51. In-flight work is explicitly tracked.

52. External accepted work is explicitly tracked.

53. Unknown exposure is explicitly tracked.

54. Runtime exposure is a first-class object.

55. Harm expansion velocity matters.

56. Detection latency is measured.

57. Decision latency is measured.

58. Intervention latency is measured.

59. Total containment latency is measured.

60. Runtime monitoring is useful only when containment can beat harm expansion.

61. Monitorability may constrain maximum safe autonomy.

62. Actions that cause irreversible harm faster than AEGIS can intervene require lower autonomy.

63. Runtime incidents correlate multiple findings.

64. Cross-execution patterns are monitored.

65. Cross-agent patterns are monitored.

66. Provider-level incidents are distinguished from agent-level incidents.

67. Aggregate risk is not reducible to per-action risk.

68. Individually valid actions may collectively be stopped.

69. Stage progression is monitored.

70. Failed canaries block progression.

71. The Sentinel does not automatically mint the next stage grant.

72. Agent boundary probing is behaviorally significant.

73. Runtime evidence may inform future autonomy assessments.

74. Agents cannot self-report their way into higher trust.

75. Dependency health is part of runtime safety.

76. Recovery readiness may require continuous observation.

77. The monitoring system itself is monitored.

78. Detection lag is a safety metric.

79. Safety-critical signals receive priority under overload.

80. Backpressure cannot silently drop critical events.

81. Event time and processing time are separate.

82. Duplicate signals are deduplicated.

83. Out-of-order signals are handled explicitly.

84. Conflicting authoritative signals create uncertainty.

85. Clock health matters for runtime safety.

86. Detectors are versioned.

87. Detector deployments support shadow mode.

88. Detector deployments support advisory mode.

89. Detector deployments support enforcement mode.

90. Baselines are versioned.

91. Baseline poisoning is explicitly defended against.

92. New agents use conservative cold-start behavior.

93. Hysteresis prevents intervention oscillation.

94. Cooldown may be required after critical intervention.

95. Automatic resume is not assumed.

96. Resume cannot increase authority.

97. Human runtime actions are authenticated and audited.

98. Emergency containment may occur before human approval.

99. Emergency containment reduces authority rather than expands it.

100. Every monitored execution produces a monitoring receipt.

101. Monitoring coverage is measurable.

102. Intervention success is measurable.

103. Post-intervention leakage is measurable.

104. Mean time to detect is measurable.

105. Mean time to contain is measurable.

106. The critical runtime safety path does not depend on an LLM.

107. LLMs may assist with explanation and investigation only.

108. The flagship runtime benchmark remains autonomous customer refunds.
```

---

# 247. Final Runtime Mental Model

A traditional monitoring system asks:

```text
What happened?
```

An observability platform asks:

```text
Why did it happen?
```

An alerting system asks:

```text
Should someone be notified?
```

AEGIS asks:

```text
Which autonomous execution is active?

Which authority is it using?

Which runtime conditions made that authority safe?

Are those conditions still true?

Which signals prove that?

How fresh are those signals?

Which sources are authoritative?

Has the environment changed?

Has the target changed?

Has the agent changed behavior?

Has the provider degraded?

Has execution diverged from expectation?

Are individually valid actions becoming dangerous in aggregate?

Is a dangerous sequence emerging?

Is risk increasing?

How quickly is it increasing?

Can AEGIS still observe the execution?

Can AEGIS intervene faster than harm can expand?

Which intervention is justified?

What is the minimum containment scope?

Was the intervention acknowledged?

Did the execution actually stop?

What work remains in flight?

What exposure is already realized?

What exposure remains uncertain?

Should authority be revoked?

Should credentials be revoked?

Should the agent be isolated?

Should the tool circuit be opened?

Should recovery begin?

Can the entire runtime incident be reconstructed later?
```

The result is not:

```text
ALERT:
Refund volume high.
```

The result is:

```text
RUNTIME INCIDENT:
incident_01J...

AGENT:
agent_support_07

ACTION:
Autonomous Customer Refund

INITIAL AUTONOMY:
L3 — CONSTRAINED

MONITORING:
ACTIVE

SIGNAL COVERAGE:
100%

DETECTED CONDITION:
Refund velocity increased 7.4×

AGGREGATE EXPOSURE:
Approaching tenant limit

RUNTIME RISK:
R3 — DANGEROUS

INTERVENTION:
PAUSE NEW DISPATCHES

ACKNOWLEDGED:
YES

EFFECTIVENESS:
VERIFIED

NEW DISPATCHES:
0

IN-FLIGHT REFUNDS:
7

REALIZED EXPOSURE:
₹4,62,000

IN-FLIGHT EXPOSURE:
₹28,000

UNKNOWN EXPOSURE:
₹0

ACTIVE GRANTS:
REVOKED

RECOVERY:
NOT YET REQUIRED

CONTAINMENT TIME:
842 ms

STATUS:
CONTAINED
```

That is not monitoring.

That is runtime governance.

---

# 248. Final Definition

The AEGIS Runtime Sentinel is:

> A continuous, multi-layer runtime safety system that independently observes autonomous execution, validates the health and freshness of its evidence, detects deterministic violations and emerging behavioral anomalies, calculates live runtime risk, applies bounded intervention, verifies containment effectiveness, and escalates when autonomous behavior can no longer be safely observed or controlled.

Its central guarantees are:

\[
\boxed{
Authorized
\neq
SafeForever
}
\]

\[
\boxed{
MissingData
\neq
SafeState
}
\]

\[
\boxed{
Alert
\neq
Intervention
}
\]

\[
\boxed{
StopRequested
\neq
Stopped
}
\]

\[
\boxed{
IndividualSafety
\neq
AggregateSafety
}
\]

\[
\boxed{
MonitoringUseful
\iff
T_{contain}
<
T_{harm}
}
\]

\[
\boxed{
RuntimeAutonomy
=
Authority
+
Observation
+
Intervention
}
\]

SPEC-007 determines:

```text
HOW MUCH AUTHORITY SHOULD EXIST?
```

SPEC-008 guarantees:

```text
ONLY THAT AUTHORITY CAN BE EXERCISED.
```

SPEC-009 guarantees:

```text
THAT AUTHORITY CAN BE REDUCED,
PAUSED,
OR TERMINATED
WHEN RUNTIME REALITY CHANGES.
```

Together:

```text
ASSESS

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
```

This is the point where AEGIS becomes more than an autonomous-agent permission system.

It becomes a real-time control system for autonomous behavior.