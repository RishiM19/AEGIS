# AEGIS TECHNICAL SPECIFICATION 014

## Event Ledger, Audit and Reproducibility System

**Document ID:** AEGIS-SPEC-014
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Cross-Cutting Infrastructure Architecture
**Depends On:** AEGIS-SPEC-000 through AEGIS-SPEC-013 (cross-cutting; consumes events already defined by each)
**Primary Owner:** Event Ledger
**Primary Runtime Component:** Event Ledger
**Consumers:** Every prior specification's own audit needs; Research Harness; Dashboard; Incident Response

---

# 0. Purpose of This Specification

Every specification from SPEC-000 through SPEC-013 defines its own `# Events` section — `ACTION_PROPOSED`, `AGENT_REGISTERED`, `AUTONOMY_DECIDED`, `RECOVERY_VERIFIED`, `APPROVAL_DECISION_RECORDED`, and so on. None of them defines where those events actually live, how they're queried, how long they're retained, or how a specific historical decision gets reconstructed from them. This specification is that system.

It formalizes the Event-Sourced Audit Principle (SPEC-000 §17) and the Reproducibility Principle (`aegis-master-context.md` §52) into one owned component, rather than leaving every other specification to informally assume "there's a ledger somewhere."

---

# 1. Foundational Principle

```text
The event ledger is not the same thing as application logs.

Logs answer: What did the software process do?
The event ledger answers: What happened in the AEGIS domain?
```
(SPEC-000 §17, verbatim.)

---

# 2. The Problem This Specification Solves

Without a single owned Event Ledger:

```text
Each specification's events end up scattered across whatever
logging/observability stack each component happens to use, with
no consistent schema, making cross-component incident reconstruction
(SPEC-009's containment verification, SPEC-010's recovery accounting)
effectively impossible.

A historical Autonomy Decision cannot actually be reconstructed
"from its frozen evidence and versions" (a stated SPEC-000 §30
success criterion) because the versions referenced in the decision
were never durably linked to the events that produced them.

Retention policy is decided ad hoc per component, so some safety-
critical events (grant verification, containment) are purged before
an incident review needs them.
```

---

# 3. Position in the System

The Event Ledger does not sit in the request path of any decision. It is a durable, append-only sink that every other component writes to as a side effect of its own processing, and that reconstruction queries read from after the fact:

```text
Every component (SPEC-001 through SPEC-013)
          ↓  writes domain events, per its own already-defined event list
EVENT LEDGER (append-only)
          ↓  read by
Reconstruction Queries (incident review, research, dashboard, audit)
```

---

# 4. Core Domain Objects

## 4.1 Domain Event

```text
eventId
eventType                — must be one of the event names already
                            declared by the owning specification's
                            own §Events section; the Event Ledger does
                            not invent new event types, it is the sink
                            for the types every other spec defines
owningSpec                 — which specification's domain this event
                              belongs to
subjectIds[]                  — references to the domain objects involved
                                 (actionId, agentId, grantId, etc.)
payload                          — structured, versioned per SPEC-000 INV-006
occurredAt
recordedAt                        — may differ from occurredAt under
                                     delayed/batched ingestion; both are
                                     preserved
tenantId
versionsInEffect[]                  — the exact algorithm/config/schema
                                       versions active when this event
                                       was produced (SPEC-000 §13
                                       Decision Snapshot linkage)
```

## 4.2 Reconstruction Query

```text
reconstructionQueryId
subjectId                — e.g. a specific autonomyGrantId or incidentId
requestedAt
resultEventChain[]           — ordered events forming the full causal
                                chain for that subject
completenessStatus              — COMPLETE | PARTIAL_GAPS_DETECTED
```

## 4.3 Retention Policy

```text
policyId
eventTypeClass            — SAFETY_CRITICAL | STANDARD | RESEARCH_ONLY
minimumRetentionPeriod
tenantOverridesAllowed        — boolean, bounded by a platform-wide floor
                                 for SAFETY_CRITICAL classes
```

---

# 5. Invariants

## LEDGER-INV-001 — The Ledger Is Append-Only

No Domain Event, once recorded, may be edited or deleted before its retention period expires. This is the same rule MON-INV-025 states for runtime evidence specifically, generalized to every event in the system.

## LEDGER-INV-002 — Every Significant State Transition Produces an Event

Any transition already declared in a §Events section of SPEC-000 through SPEC-013 must actually reach the ledger; a component that makes a governed decision without emitting its declared event is non-compliant with its own specification, not merely with this one.

## LEDGER-INV-003 — Events Carry Version Context

Every event records the `versionsInEffect` active at the time, satisfying SPEC-000 INV-006 (Every Significant Decision Must Be Versioned) at the storage layer, not just at the decision layer.

## LEDGER-INV-004 — Reconstruction Must Detect Its Own Gaps

A Reconstruction Query that cannot find an expected causal link (e.g. a grant with no corresponding decision event) must report `PARTIAL_GAPS_DETECTED` explicitly rather than silently returning an incomplete chain as if it were complete. This is the ledger-level instance of the Explicit Unknown-State Principle.

## LEDGER-INV-005 — Safety-Critical Retention Has a Platform-Wide Floor

`SAFETY_CRITICAL` event classes (grant issuance/verification, containment, recovery verification, identity lifecycle transitions) have a minimum retention period no tenant configuration may shorten, regardless of storage cost pressure.

## LEDGER-INV-006 — The Ledger Is Multi-Tenant Isolated

Reconstruction Queries are scoped to the requesting principal's tenant; cross-tenant event visibility requires explicit, separately audited elevated access (Multi-Tenant Principle).

## LEDGER-INV-007 — The Ledger Does Not Interpret, Only Preserves

The Event Ledger stores what other components report; it does not itself judge correctness, compute derived risk, or re-attribute outcomes. Interpretation belongs to the specification that owns the domain (e.g. SPEC-013 for attribution).

---

# 6. Reconstruction

A Reconstruction Query for a given subject (e.g. an Autonomy Grant that was later involved in a Runtime Sentinel incident and a Recovery Plan) must be able to produce the full ordered causal chain:

```text
ACTION_PROPOSED → ACTION_NORMALIZED → AUTHORITY_EVALUATED →
COMPETENCE_ESTIMATED → NOVELTY_ESTIMATED → UNCERTAINTY_ESTIMATED →
CONSEQUENCE_ESTIMATED → AUTONOMY_DECIDED → CONTRACT_CREATED →
CONTRACT_ENFORCED → EXECUTION_STARTED → TOOL_ADAPTER_INVOKED →
SIDE_EFFECT_OBSERVED → RUNTIME_FINDING_RAISED → INTERVENTION_ISSUED →
CONTAINMENT_VERIFIED → RECOVERY_TRIGGER_RECEIVED → ... →
RECOVERY_VERIFIED → OUTCOME_EVALUATED → ATTRIBUTION_COMPLETED →
COMPETENCE_EVIDENCE_ITEM_WRITTEN
```

This is the concrete implementation of `aegis-master-context.md` §22's canonical system chain — the chain is not just a conceptual diagram, it is a queryable structure once this specification exists.

---

# 7. Failure Behavior

| Failure | Response |
|---|---|
| Event Ledger write path unavailable | The originating component must not silently proceed as if the event were recorded; per the Fail-Safe Principle, a safety-critical decision (grant issuance, containment, recovery) whose event cannot be durably recorded should itself be treated as a degraded-autonomy condition upstream, not swallowed. |
| Reconstruction Query finds a gap | Report `PARTIAL_GAPS_DETECTED` with the specific missing link identified, never silently interpolate. |
| Retention policy conflict (tenant override below platform floor for SAFETY_CRITICAL) | Platform floor wins; the override request is rejected, not silently honored. |

---

# 8. Security Boundaries

```text
BOUNDARY: Any Component → Event Ledger
Threats: event forgery/injection by a compromised component, event
         flooding as a denial-of-service against reconstruction
         query performance, tenant-boundary violation in query access.
```

---

# 9. Events

This specification's own events describe the ledger's operation on events, not domain events themselves:

```text
RECONSTRUCTION_QUERY_EXECUTED
RECONSTRUCTION_GAP_DETECTED
RETENTION_POLICY_APPLIED
RETENTION_OVERRIDE_REJECTED
```

---

# 10. Testing Strategy

```text
Every declared event type across SPEC-000 through SPEC-013 must have
at least one integration test confirming it actually reaches the
ledger under normal operation.

A deliberately dropped event in a causal chain must cause the
reconstruction query to report PARTIAL_GAPS_DETECTED, not a
falsely-complete chain.

An attempted tenant retention override below the SAFETY_CRITICAL
floor must be rejected in all configuration-fuzzing tests.
```

---

# 11. Adversarial Scenarios

```text
A compromised component attempts to inject a forged
CONTAINMENT_VERIFIED event without a corresponding real intervention
having occurred. Expected: events must be attributable to an
authenticated source component, and the reconstruction chain would
show the forged event has no preceding INTERVENTION_ISSUED event
from a legitimate source, which LEDGER-INV-004 flags as a gap/
inconsistency worth surfacing, not silently accepting.

An operator under storage-cost pressure attempts to reduce retention
for SAFETY_CRITICAL events at the tenant configuration layer.
Expected: rejected by the platform-wide floor (LEDGER-INV-005).
```

---

# 12. Research Questions

```text
Can reconstruction completeness itself become a measured platform
metric (what fraction of incidents have a fully gap-free causal
chain), and does it correlate with governance quality?
```

---

# 13. V1 Implementation Boundary

V1 must implement: append-only event storage with version-context tagging, tenant-scoped reconstruction queries, gap detection, and the SAFETY_CRITICAL retention floor. Full cross-component reconstruction UI/visualization is Dashboard scope (referenced but not owned here); this specification only guarantees the query capability exists.

---

# 14. Newly Locked Decisions

```text
1. The Event Ledger is append-only; no event is ever edited or
   deleted before its retention period expires.

2. Every event carries the exact versions in effect at the time it
   was produced.

3. Reconstruction queries must explicitly report detected gaps
   rather than silently returning an incomplete chain.

4. SAFETY_CRITICAL retention has a platform-wide floor no tenant
   configuration may lower.
```

---

# 15. Unresolved Questions

```text
What is the exact set of event types classified SAFETY_CRITICAL
versus STANDARD versus RESEARCH_ONLY, and who has authority to
reclassify an event type after the fact?

How does the ledger scale reconstruction queries for very long-lived
delegation chains (SPEC-015) without degrading query latency?
```
