# AEGIS TECHNICAL SPECIFICATION 011

## Approval Coordination and Human-in-the-Loop System

**Document ID:** AEGIS-SPEC-011
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Human Coordination Architecture
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-002, AEGIS-SPEC-006, AEGIS-SPEC-007, AEGIS-SPEC-008, AEGIS-SPEC-010
**Primary Owner:** Approval Coordinator
**Primary Runtime Component:** Approval Coordinator
**Consumers:** Autonomy Decision Engine, Execution Gateway, Recovery Engine, Event Ledger, Attribution Engine, Dashboard

---

# 0. Purpose of This Specification

Autonomy levels L1 (Human Executes) and L2 (Human Approval Required), the approval preconditions referenced throughout SPEC-007 and SPEC-008 (EXE-INV-013), and the human intervention types listed in `aegis-master-context.md` §25 all assume a coordination system exists to route work to humans, capture their decisions precisely, and feed those decisions back into the platform. No prior specification defines that system. This one does.

This specification does not decide *when* human involvement is required — that is SPEC-007's Autonomy Decision. It defines *what happens once that decision has been made*: how the request reaches a human, what that human is shown, what decision types exist, how the decision binds back to the exact action it was made on, and how it re-enters the Execution Gateway or Recovery Engine.

---

# 1. Foundational Principle

```text
Human approval does not remove execution constraints.
```
(AUT-INV-012, restated as the organizing principle of this specification.)

A human is not a generic override switch. An approval decision binds to the exact Canonical Action fingerprint (SPEC-001 §57) it was shown. If the action changes after approval, the approval does not carry forward (this mirrors EXE-INV-005 exactly, applied to human approval rather than machine grants).

---

# 2. The Problem This Specification Solves

Without a formal Approval Coordinator:

```text
A human approves "refund up to ₹20,000" in a chat message, and the
agent later executes ₹25,000 against a materially different action,
with no structural check that the approval and the execution match.

Two different reviewers approve the same request independently because
there is no single queue of record, producing ambiguous accountability.

"Approved" and "approved with the amount reduced" are recorded
identically, destroying the distinction SPEC-000 needs for learning
(APPROVED_WITHOUT_CHANGE vs APPROVED_WITH_MODIFICATION carry different
evidentiary weight).

An approval request sits unanswered indefinitely, and the underlying
Autonomy Grant silently expires or silently stays open past its
intended decision freshness window (SPEC-000 §14).
```

---

# 3. Position in the System

```text
Autonomy Decision Engine selects L1 or L2, or Recovery Engine's
DEFER_TO_HUMAN strategy (SPEC-010 §6) is chosen
          ↓
APPROVAL REQUEST CREATED (bound to exact action/plan fingerprint)
          ↓
ROUTING (which human/role/queue)
          ↓
PRESENTATION (what the human sees)
          ↓
HUMAN DECISION CAPTURED (typed, not free text alone)
          ↓
DECISION BOUND BACK TO ORIGINAL FINGERPRINT — verified unchanged
          ↓
Execution Gateway (SPEC-008) or Recovery Engine (SPEC-010) proceeds,
   using the approval as a satisfied precondition, not as a new grant
          ↓
Decision becomes Outcome Evidence input (SPEC-013)
```

The Approval Coordinator produces a *precondition satisfaction record*, not authority. Authority still comes only from SPEC-007's Autonomy Grant; the Approval Coordinator confirms one of that grant's stated conditions has been met.

---

# 4. Core Domain Objects

## 4.1 Approval Request

```text
approvalRequestId
subjectType                — ACTION | RECOVERY_PLAN
subjectId                    — the exact Canonical Action or Recovery Plan
subjectFingerprint             — CAM fingerprint or Recovery Plan hash, frozen
                                  at request time
requiredAutonomyLevel            — L1 or L2, from SPEC-007
routingTarget                     — role, queue, or specific principal
createdAt
expiresAt                          — bounded, per Decision Freshness (SPEC-000 §14)
status                               — PENDING | DECIDED | EXPIRED | WITHDRAWN
```

## 4.2 Approval Decision

```text
approvalDecisionId
approvalRequestId
decisionType               — see §5
decidingPrincipalId
modifiedFields[]             — if APPROVED_WITH_MODIFICATION, exact diff
decidedAt
rationale                      — optional free text, never the sole record
                                  of what was decided
```

## 4.3 Approval Queue

```text
queueId
routingRule                — which requests land here (by risk tier,
                              domain, tenant, on-call role)
principalsWithAccess[]
```

---

# 5. Human Decision Types

Restated from `aegis-master-context.md` §25 as the canonical, closed enumeration — no free-form decision types are permitted, because Attribution (SPEC-013) depends on this being a closed set:

```text
APPROVED_WITHOUT_CHANGE     — action proceeds exactly as proposed
APPROVED_WITH_MODIFICATION   — action proceeds with recorded field changes;
                               this creates a new Canonical Action version
                               (CAM-INV-003) and a new fingerprint, and
                               therefore requires re-verification, not
                               reuse of the original risk assessment,
                               if the modification is material
REJECTED                      — action does not proceed
REQUESTED_MORE_EVIDENCE          — action is paused, returned upstream for
                                    additional context (SPEC-001 Layer 4)
EXECUTED_MANUALLY                  — human performs the action outside
                                     AEGIS's automated execution path;
                                     still requires an Execution Attempt
                                     record for audit parity (EXE-INV-020)
CORRECTED_AGENT_DECISION             — human's decision differs from what
                                       the agent would have produced,
                                       recorded specifically for
                                       competence learning (feeds
                                       SPEC-013 Attribution)
OVERRULED_AEGIS                       — human proceeds against an AEGIS
                                        recommendation; requires elevated
                                        authorization and always produces
                                        a distinct audit event
EMERGENCY_STOP                         — immediate halt, routed with the
                                        same urgency as a Runtime Sentinel
                                        I6/I7 (SPEC-009), regardless of
                                        approval queue state
```

---

# 6. Approval Coordination Invariants

## APR-INV-001 — Approval Binds to an Exact Fingerprint

An Approval Decision is valid only for the exact `subjectFingerprint` recorded on its Approval Request. Any material change invalidates it, exactly as EXE-INV-005 invalidates a grant after material action mutation.

## APR-INV-002 — Approval Is Not Authority

An Approval Decision satisfies a precondition on an existing Autonomy Grant (SPEC-007) or Recovery Plan (SPEC-010). It does not itself create executable authority. The Execution Gateway still performs full grant verification (SPEC-008) after approval.

## APR-INV-003 — Decision Type Is a Closed Enumeration

Only the eight decision types in §5 are valid. A human-facing UI may collect free-text rationale, but the structured `decisionType` field must be one of the eight; it is not inferred from the free text.

## APR-INV-004 — Modification Creates a New Action Version

`APPROVED_WITH_MODIFICATION` always produces a new CAM version (CAM-INV-003). If the modification is material (per CAM's materiality rules, §27 of SPEC-001), the modified action must be re-risk-assessed before execution, not executed under the original assessment.

## APR-INV-005 — Expiry Is Enforced, Not Advisory

An Approval Request past its `expiresAt` transitions to `EXPIRED` and can no longer produce a valid decision. A late-arriving decision on an expired request is recorded for audit but does not satisfy the precondition; the action must be re-submitted.

## APR-INV-006 — Single Decision of Record

Once an Approval Request transitions to `DECIDED`, it cannot be decided again. A second reviewer's attempted decision on an already-decided request is rejected structurally, preventing the ambiguous-accountability failure in §2.

## APR-INV-007 — Emergency Stop Bypasses Queue Ordering, Never Bypasses Recording

`EMERGENCY_STOP` is processed with priority ahead of any queue backlog, and is always fully recorded — urgency is never a reason to skip the audit event (consistent with MON-INV-006).

## APR-INV-008 — Approval Outcome Feeds Learning Only Through Attribution

An approval decision does not directly modify agent competence. It becomes an input to SPEC-013's Attribution Engine, which determines what the decision actually implies about agent decision quality versus other factors (SPEC-000 INV-008).

---

# 7. Routing

Routing rules are deterministic given the Autonomy Decision's stated required level, the Canonical Action's domain (CAM Layer 3), and tenant/organization configuration:

```text
requiredAutonomyLevel = L1  → routed to a queue whose principals are
                                authorized to EXECUTE, not merely approve
requiredAutonomyLevel = L2  → routed to a queue whose principals are
                                authorized to APPROVE

High consequence tier (per SPEC-006) → routed to an elevated-authority
                                         queue, never the default queue,
                                         regardless of tenant configuration
```

A routing failure (no eligible queue found) is a hard block on execution, not a fallback to a default queue — this satisfies Safe Degradation (SPEC-000 INV-010).

---

# 8. Failure Behavior

| Failure | Response |
|---|---|
| Approval Coordinator unavailable | The autonomy decision requiring L1/L2 cannot be satisfied; execution does not proceed. This is not equivalent to denial — the action remains pending, not rejected. |
| Routing target has no reachable principal (e.g. on-call gap) | Request remains `PENDING`; escalation policy (configured per tenant) may re-route, but no default-approve path exists. |
| Decision arrives referencing a subject fingerprint that no longer matches | Rejected; treated as a decision on a stale request (APR-INV-001). |
| Duplicate decisions submitted concurrently on the same request | First decision recorded atomically wins; the second is rejected with a conflict, not silently overwritten (mirrors EXE-INV-011 grant-consumption atomicity). |

---

# 9. Security Boundaries

```text
BOUNDARY: Human Principal → Approval Coordinator
Threats: a principal without the required role/authority level
         attempting to record a decision on a queue they cannot access;
         session/credential compromise producing a forged decision.

BOUNDARY: Approval Coordinator → Execution Gateway / Recovery Engine
Threats: a forged "APPROVED_WITHOUT_CHANGE" decision injected without
         a corresponding, authenticated Approval Decision record.
```

---

# 10. Events

```text
APPROVAL_REQUEST_CREATED
APPROVAL_REQUEST_ROUTED
APPROVAL_REQUEST_EXPIRED
APPROVAL_DECISION_RECORDED
APPROVAL_DECISION_REJECTED_STALE_FINGERPRINT
APPROVAL_DECISION_REJECTED_ALREADY_DECIDED
EMERGENCY_STOP_INVOKED
```

---

# 11. Testing Strategy

```text
A modified approval must always produce a new CAM version and,
where material, a new risk assessment, verified across fault-injected
modification scenarios.

Two concurrent decisions on the same Approval Request must resolve
to exactly one recorded decision, with the second rejected as
a conflict, under concurrency testing.

An expired request must reject a late decision in 100% of
fault-injected late-arrival cases.
```

---

# 12. Adversarial Scenarios

```text
An agent attempts to resubmit a rejected action with cosmetic
parameter changes to obtain a different reviewer's approval on what
is materially the same request. Expected: fingerprinting (CAM §56-57)
detects material equivalence and the new request is linked to the
rejection history for reviewer visibility, not presented as unrelated.

A principal without approval authority for a given risk tier attempts
to approve a high-consequence action routed to an elevated queue.
Expected: rejected at the routing/authorization boundary, not merely
flagged after the fact.
```

---

# 13. Research Questions

```text
How much does human approval latency erode the usefulness of an
otherwise-justified L2 decision, and does that argue for a wider L3/L4
envelope in well-monitored, well-recoverable domains? (Connects to
AEGIS-RESEARCH-THESIS.md Q1, Q4.)

Does CORRECTED_AGENT_DECISION carry more learning signal than
REJECTED, and if so how should Attribution weight it differently?
```

---

# 14. V1 Implementation Boundary

V1 must implement: the Approval Request/Decision domain objects, the eight closed decision types, fingerprint binding and invalidation, single-decision-of-record enforcement, and deterministic routing for at least the flagship refund benchmark's two queues (standard approval, elevated approval). Escalation-policy automation for on-call gaps is out of scope for V1; an unstaffed queue in V1 simply remains `PENDING` and is surfaced on the Dashboard.

---

# 15. Newly Locked Decisions

```text
1. Approval Decisions are drawn from a closed, eight-value enumeration;
   no free-form decision type is valid for structured processing.

2. Approval satisfies a precondition on an existing grant; it never
   itself constitutes authority.

3. A material modification during approval always produces a new CAM
   version and, where material, a new risk assessment.

4. Exactly one decision of record is permitted per Approval Request.
```

---

# 16. Unresolved Questions

```text
What is the precise materiality threshold that forces re-assessment
after APPROVED_WITH_MODIFICATION, versus modifications small enough to
proceed under the original assessment?

Should EMERGENCY_STOP be invocable by any authenticated human principal
regardless of role, given its safety-critical nature, or must it still
respect role-based authorization?
```
