# AEGIS TECHNICAL SPECIFICATION 010

## Recovery, Rollback, Compensation and Post-Incident Restoration

**Document ID:** AEGIS-SPEC-010
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Post-Execution Restoration Architecture
**Depends On:** AEGIS-SPEC-000 through AEGIS-SPEC-009
**Primary Owner:** Recovery Plane
**Primary Runtime Component:** Recovery Engine
**Consumers:** Execution Gateway, Autonomy Decision Engine, Runtime Sentinel, Event Ledger, Research Harness, Dashboard

---

# 0. Purpose of This Specification

Every prior specification governs what happens *before* and *during* an action. This specification governs what happens *after* an action has produced — or may have produced — an undesirable real-world effect.

It answers the question posed in `aegis-master-context.md` §20 and §76:

> Once an autonomous action has produced an undesirable real-world effect, how does AEGIS determine the safest achievable restoration strategy and execute recovery without causing additional uncontrolled harm?

This specification does not redesign anything upstream. It consumes the Consequence Engine's reversibility classification (SPEC-006 CON-INV-002/003/009/010/011), the Execution Gateway's execution record (SPEC-008 EXE-INV-018/019), and the Runtime Sentinel's I9 (Recover) intervention command (SPEC-009) as its primary inputs.

---

# 1. Foundational Principle

```text
Containment is not recovery.
Stopping additional harm does not repair existing harm.
```

Recovery is a distinct governed action, not a side effect of stopping. A Recovery Action must pass through the same category of scrutiny as any other autonomous action: it is itself risk-assessed, it may itself require a new Autonomy Grant, and it is itself subject to Execution Gateway enforcement. Recovery does not get a free pass merely because its intent is remedial — a badly designed compensating action can cause more harm than the original incident (e.g. double-refunding, or reversing a legitimate concurrent transaction).

---

# 2. The Problem This Specification Solves

Without a formal Recovery Plane, the following failures are possible:

```text
An intervention successfully stops further refunds, but the ₹18,400
already disbursed to a fraudulent account is never pursued for reversal
because no component owns that responsibility.

A well-intentioned manual rollback issues a second compensating refund
without checking whether an earlier automated compensation already ran,
producing double compensation.

A partially completed multi-step action (e.g. refund initiated, ledger
updated, but customer notification failed) is treated as fully rolled
back when only some of its effects were actually undone.

An action classified as "irreversible" is never revisited, so the
residual harm it caused is never explicitly recorded, measured, or fed
back into future risk assessment.
```

---

# 3. Position in the System

```text
Runtime Sentinel issues I9 (Recover)
          OR
Post-incident detection identifies harm outside the live execution window
          ↓
RECOVERY TRIGGER EVALUATION
          ↓
EFFECT CLASSIFICATION (consult SPEC-006 reversibility assessment)
          ↓
RECOVERY STRATEGY SELECTION
          ↓
RECOVERY RISK ASSESSMENT (recovery action re-enters SPEC-003–007)
          ↓
RECOVERY AUTONOMY DECISION (may require new Autonomy Grant, per SPEC-007)
          ↓
RECOVERY EXECUTION (via Execution Gateway, SPEC-008)
          ↓
RECOVERY VERIFICATION
          ↓
RESIDUAL HARM ACCOUNTING
          ↓
OUTCOME EVIDENCE (feeds SPEC-013)
```

Recovery re-enters the same decision plane it came from. It does not bypass SPEC-007 or SPEC-008. This is the direct consequence of CON-INV-009 ("Rollback Must Be Verified") and AUT-INV-010 ("Better Verified Recovery May Increase Autonomy") — recovery capability only counts toward future autonomy once it has actually been exercised and verified, not merely claimed.

---

# 4. Core Domain Objects

## 4.1 Recovery Trigger

```text
triggerId
sourceType         — RUNTIME_SENTINEL_I9 | POST_INCIDENT_DETECTION | MANUAL
sourceReferenceId  — the incident, intervention, or execution attempt
triggeredAt
```

## 4.2 Effect Record

The unit of recovery. One Execution Attempt (SPEC-008) may produce multiple Effect Records if it had multiple distinct real-world side effects.

```text
effectId
executionAttemptId
effectDescription
effectClassification   — see §5
verifiedOccurred        — TRUE | FALSE | UNKNOWN
magnitude
```

## 4.3 Recovery Plan

```text
recoveryPlanId
effectIds[]                 — effects this plan addresses
strategy                     — see §6
compensatingActions[]        — ordered list of Canonical Actions (SPEC-001)
requiresNewGrant              — boolean
riskAssessmentId               — reference to SPEC-006 assessment of the plan itself
approvalStatus                  — PENDING | APPROVED | REJECTED
createdAt
```

## 4.4 Compensating Action

A Canonical Action (SPEC-001) whose purpose field is set to `COMPENSATION` and whose `parentActionId` points to the original action being compensated. It is not a special object type — it is a CAM instance with `compensationSupport` metadata (SPEC-001 §51) populated, which is exactly why CAM was designed with that field.

## 4.5 Recovery Verification Receipt

```text
receiptId
recoveryPlanId
verifiedAt
verificationMethod          — independent, per §7
verificationResult           — FULLY_RECOVERED | PARTIALLY_RECOVERED |
                                RECOVERY_FAILED | UNKNOWN
residualHarmRecordId          — reference, if any residual harm remains
```

## 4.6 Residual Harm Record

```text
residualHarmId
effectId
description
estimatedMagnitude
isPermanent               — boolean
acknowledgedBy             — human or system acknowledgment reference
```

---

# 5. Effect Classification

Every effect must be classified before a recovery strategy is chosen. This directly operationalizes SPEC-006's reversibility spectrum (`aegis-master-context.md` §6.6):

```text
FULLY_REVERSIBLE       — can be undone completely with no trace of harm
OPERATIONALLY_REVERSIBLE — can be undone but leaves an operational cost
                           (fees, delay, manual labor)
COMPENSATABLE           — cannot be undone, but an equivalent remedy exists
                           (e.g. a duplicate charge cannot be un-charged,
                           but a refund compensates it)
PARTIALLY_REVERSIBLE      — some portion can be undone or compensated,
                             some portion cannot
PRACTICALLY_IRREVERSIBLE   — technically possible to reverse but the cost,
                              delay, or side effects make it infeasible
FUNDAMENTALLY_IRREVERSIBLE  — no reversal or compensation is possible
                              (e.g. disclosed data cannot be un-disclosed,
                              CON-INV-004)
```

`UNKNOWN` classification is itself a valid, explicit state (RCV-INV-002) — it must never default to any of the above.

---

# 6. Recovery Strategies

```text
ROLLBACK              — reverse the effect via an inverse operation
                         (only valid for FULLY_REVERSIBLE /
                         OPERATIONALLY_REVERSIBLE)

COMPENSATE             — issue a distinct remedial action that offsets
                          the effect without reversing the original
                          operation (valid for COMPENSATABLE /
                          PARTIALLY_REVERSIBLE)

CONTAIN_AND_ACCEPT       — no further action is safe or possible; the
                            effect is recorded as Residual Harm and
                            escalated for human acknowledgment (valid
                            for PRACTICALLY_IRREVERSIBLE /
                            FUNDAMENTALLY_IRREVERSIBLE)

DEFER_TO_HUMAN            — the Recovery Engine cannot determine a safe
                             automated strategy; a human recovery
                             coordinator (SPEC-011) must choose
```

Strategy selection is deterministic given effect classification, not discretionary per SPEC-000 §12.1 (deterministic components).

---

# 7. Recovery Invariants

## RCV-INV-001 — Recovery Is a Governed Action, Not a Bypass

Every Compensating Action must pass through CAM normalization (SPEC-001), autonomy decision (SPEC-007), and Execution Gateway enforcement (SPEC-008) exactly like any other action. There is no privileged recovery-only execution path.

## RCV-INV-002 — Unknown Effect Status Is Explicit

An effect whose occurrence cannot be confirmed is recorded as `UNKNOWN`, never assumed to have or have not occurred.

## RCV-INV-003 — Recovery Cannot Assume Success

Issuing a compensating action is not recovery. Recovery is complete only once independently verified (§9). Between issuance and verification, the effect remains `PARTIALLY_RECOVERED` at best.

## RCV-INV-004 — Idempotent Compensation

A Recovery Plan must check for prior compensation attempts against the same Effect Record before issuing a new Compensating Action, using the same idempotency mechanism CAM defines for original actions (CAM §49). This directly prevents double compensation.

## RCV-INV-005 — Recovery Actions Are Risk-Assessed Like Any Other Action

A Compensating Action re-enters SPEC-003 through SPEC-007. High-consequence compensating actions (e.g. large reversing transfers) do not receive elevated autonomy merely because their intent is remedial.

## RCV-INV-006 — Irreversibility Must Be Recorded, Not Ignored

A `FUNDAMENTALLY_IRREVERSIBLE` or `PRACTICALLY_IRREVERSIBLE` classification does not close the incident. It produces a Residual Harm Record requiring explicit human acknowledgment.

## RCV-INV-007 — Recovery Ordering Must Respect Dependencies

Where multiple Effect Records depend on each other (e.g. a ledger entry must be reversed before a downstream notification is corrected), the Recovery Plan must order Compensating Actions to respect that dependency graph. Reordering without re-validating dependent state is prohibited.

## RCV-INV-008 — Partial Recovery Is a First-Class Outcome

`PARTIALLY_RECOVERED` is not a transient state to be silently rounded up to `FULLY_RECOVERED`. It is a terminal outcome that must be reported and accounted for exactly as such.

## RCV-INV-009 — Recovery Verification Must Be Independent

Following the Independent Observation Principle (`aegis-master-context.md` §49), the same source that executed the Compensating Action cannot be the sole source confirming it succeeded, for any effect above a configured consequence threshold.

## RCV-INV-010 — Recovery Cannot Create New Unbounded Authority

A Recovery Plan's `requiresNewGrant` path issues a grant scoped exactly to the compensating actions in the plan. It must not be used as a general-purpose mechanism to re-grant broader autonomy under the label of "recovery."

## RCV-INV-011 — Recovery Evidence Feeds Learning, Never Silently

A completed (or failed) recovery produces Outcome Evidence per SPEC-013. It does not automatically improve or degrade the responsible agent's competence — that judgment belongs to Attribution (SPEC-013 INV set), which must separate "agent caused a recoverable situation" from "agent is generally unreliable."

## RCV-INV-012 — Recoverability Assessment Must Be Reproducible

Given the same Effect Records, classification inputs, and algorithm version, the Recoverability Model (§8) must produce the same recovery strategy recommendation.

---

# 8. The Recoverability Model

This formalizes the concept left open in `aegis-master-context.md` §44.

```text
Recoverability(effect) = f(
    EffectClassification,
    VerifiedRollbackLatency,      — how long full verification actually took,
                                     historically, for this effect class
    ResidualHarmBound,             — the worst-case harm that remains even
                                     after the best available compensation
    CompensationAvailability       — whether a compensating action exists
                                     at all for this effect class
)
```

Recoverability is computed **per effect class**, using historical Recovery Verification Receipts, the same way Competence (SPEC-003) is computed per action region rather than as a single agent-wide score. This is intentional: an agent's actions may be highly recoverable in one domain (refunds, which have a mature compensation path) and not at all recoverable in another (irreversible infrastructure changes), and collapsing this into one number would repeat the exact mistake SPEC-000 INV-012 forbids for competence.

Per SPEC-007 AUT-INV-010, Recoverability may raise the maximum permitted autonomy ceiling for future actions of the same effect class — but only once it has been demonstrated via verified Recovery Verification Receipts, never from a claimed or theoretical compensation design. Recoverability cannot override a hard blocker (AUT-INV-013): a `FUNDAMENTALLY_IRREVERSIBLE` effect class has zero achievable Recoverability regardless of monitoring or compensation sophistication elsewhere in the system.

The exact functional form combining Recoverability with Monitorability (SPEC-009) into the autonomy ceiling is an open research question — see `handbook/AEGIS-RESEARCH-THESIS.md` §8. V1 treats Recoverability as an additive ceiling input, evaluated independently, per AUT-INV-013's requirement that no favorable factor may cancel a hard limiting factor.

---

# 9. Recovery Verification

Verification must use a source independent of the component that executed the Compensating Action (RCV-INV-009):

```text
Compensating Action executed
        ↓
Independent verification source queried
(e.g. payment provider ledger state, not the agent's own claim)
        ↓
Effect state re-checked against expected post-compensation state
        ↓
FULLY_RECOVERED    — verified state matches expected fully-compensated state
PARTIALLY_RECOVERED — some but not all expected changes verified
RECOVERY_FAILED     — verified state shows compensation did not take effect
UNKNOWN             — verification source unavailable or inconclusive
```

`UNKNOWN` verification result triggers escalation (RCV-INV-002), never a default to `FULLY_RECOVERED`.

---

# 10. Critical Flow — Refund Benchmark Example

```text
1. Runtime Sentinel issues I9 following a detected duplicate-refund
   sequence (SPEC-009 sequence detection).

2. Recovery Trigger created, sourceType = RUNTIME_SENTINEL_I9.

3. Effect Records constructed for each of the duplicate refund
   executions from the Execution Attempt log (SPEC-008).

4. Each effect classified: the first refund is COMPENSATABLE via
   nothing (it was legitimate); the duplicate refunds are classified
   COMPENSATABLE via reversal request to the payment provider.

5. Recovery Plan built: strategy = COMPENSATE for the duplicate
   refunds, with ordering respecting ledger-before-notification
   dependency (RCV-INV-007).

6. The Compensating Actions (reversal requests) are risk-assessed
   (SPEC-006), decided (SPEC-007), and granted a scoped new Autonomy
   Grant (RCV-INV-010).

7. Execution Gateway dispatches the reversal requests.

8. Independent verification against the payment provider's ledger
   confirms the reversals landed.

9. Recovery Verification Receipt: FULLY_RECOVERED.

10. Outcome Evidence generated; fed to SPEC-013, which separates
    "agent's duplicate-refund behavior" (a competence signal) from
    "recovery succeeded" (a separate signal about the Recovery Engine,
    not the original agent).
```

---

# 11. Failure Behavior

| Failure | Response |
|---|---|
| Effect classification cannot be determined | Treat as `PRACTICALLY_IRREVERSIBLE` until proven otherwise (safe degradation, consistent with SPEC-000 INV-010) — never assume the most favorable classification. |
| Independent verification source unavailable | Verification result = `UNKNOWN`; do not close the Recovery Plan; escalate per RCV-INV-002. |
| Compensating Action itself fails at the Execution Gateway | Recovery Plan marked `RECOVERY_FAILED` for that effect; escalate to human recovery coordinator (SPEC-011); do not silently retry without idempotency re-check (RCV-INV-004). |
| Recovery Engine itself unavailable | No automated recovery may proceed; the incident remains open and is surfaced as a monitoring finding (feeds back into SPEC-009), not silently dropped. |
| Dependency graph among effects cannot be resolved | Defer to human (`DEFER_TO_HUMAN` strategy); do not guess an ordering. |

---

# 12. Security Boundaries

```text
BOUNDARY: Runtime Sentinel / Post-Incident Detector → Recovery Engine
Threats: a forged or spoofed I9 trigger causing unnecessary compensating
         actions (which themselves have financial consequence).

BOUNDARY: Recovery Engine → Execution Gateway
Threats: a Compensating Action attempting to exceed the scope of its
         Recovery Plan (must be rejected exactly as EXE-INV-004 rejects
         any other grant-scope violation).

BOUNDARY: Recovery Engine → Independent Verification Source
Threats: verification source compromise producing false
         FULLY_RECOVERED results, masking an actual RECOVERY_FAILED
         state.
```

---

# 13. Events

```text
RECOVERY_TRIGGER_RECEIVED
EFFECT_RECORD_CREATED
EFFECT_CLASSIFIED
RECOVERY_PLAN_CREATED
RECOVERY_PLAN_RISK_ASSESSED
RECOVERY_GRANT_ISSUED
COMPENSATING_ACTION_DISPATCHED
COMPENSATING_ACTION_RESULT_RECEIVED
RECOVERY_VERIFICATION_ATTEMPTED
RECOVERY_VERIFIED
RECOVERY_FAILED
RESIDUAL_HARM_RECORDED
RESIDUAL_HARM_ACKNOWLEDGED
```

---

# 14. Testing Strategy

```text
A duplicate compensating action against the same Effect Record must be
rejected by the idempotency check (RCV-INV-004) in 100% of fault-injected
retries.

A FUNDAMENTALLY_IRREVERSIBLE effect must always produce a Residual Harm
Record and must never produce a FULLY_RECOVERED verification result.

Verification source unavailability must produce UNKNOWN, never a
default FULLY_RECOVERED, across all fault-injection scenarios.

A Compensating Action attempting a value outside its Recovery Plan's
scope must be rejected at the Execution Gateway exactly as a normal
grant-scope violation would be.
```

---

# 15. Adversarial Scenarios

```text
An attacker who has compromised a monitoring signal source triggers a
false I9 to force a compensating reversal of a legitimate transaction.
Expected: the Recovery Plan's own risk assessment (RCV-INV-005) treats
the reversal as a normal high-consequence action subject to full
autonomy-decision scrutiny, not an automatic pass-through.

An operator attempts to mark a RECOVERY_FAILED incident as
FULLY_RECOVERED to close an incident report without actually achieving
the required independent verification. Expected: verification result
can only be set by the independent verification path (RCV-INV-009);
manual override requires an explicit, separately audited human
intervention type (feeds SPEC-011), and does not silently overwrite
the receipt.
```

---

# 16. Research Questions

See `handbook/AEGIS-RESEARCH-THESIS.md` §4 Q12 and §8 for the open questions this specification surfaces: the exact functional form relating Recoverability to the autonomy ceiling, and how Containment Efficiency and Recovery Success Rate should be combined into a single measure of "how well did the system handle this incident end to end."

---

# 17. V1 Implementation Boundary

V1 must implement: Effect Record classification (deterministic rule-based, not learned); the four recovery strategies; idempotent compensation checking; independent verification for at least the flagship refund benchmark's payment-provider ledger; Residual Harm recording with mandatory human acknowledgment. V1 does not need to implement a learned Recoverability Model — a rule-based classification-to-ceiling mapping is sufficient, provided it is explicitly versioned (RCV-INV-012) and does not silently claim precision it doesn't have.

---

# 18. Newly Locked Decisions

```text
1. Recovery is a governed action subject to the full decision pipeline;
   there is no privileged recovery-only execution path.

2. Recoverability is computed per effect class, never as a single
   agent-wide score.

3. Idempotent compensation checking is mandatory before any
   Compensating Action is dispatched.

4. Recovery verification must use a source independent of the
   component that executed the compensation, above a configured
   consequence threshold.

5. Partial recovery and residual harm are first-class, permanently
   recorded outcomes — never silently rounded up to full recovery.
```

---

# 19. Unresolved Questions

```text
What is the exact mathematical relationship between Recoverability and
Monitorability in the autonomy ceiling function (additive, multiplicative,
threshold-gated)?

How is the dependency graph among Effect Records constructed
automatically for actions that were not explicitly modeled as
multi-step in their original CAM representation?

Should Residual Harm acknowledgment ever be automatable for
sufficiently small, well-understood harm classes, or must it always
require a human?
```
