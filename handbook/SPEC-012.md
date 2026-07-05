# AEGIS TECHNICAL SPECIFICATION 012

## Execution Enablement: Simulation, Tool Adapters and Credential Leasing

**Document ID:** AEGIS-SPEC-012
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Execution Support Architecture
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-002, AEGIS-SPEC-007, AEGIS-SPEC-008
**Primary Owner:** Execution Enablement Plane
**Primary Runtime Component:** Simulation Runtime, Tool Adapter Layer, Credential Lease Manager
**Consumers:** Execution Gateway, Runtime Sentinel, Recovery Engine, Event Ledger, Research Harness

---

# 0. Purpose of This Specification

SPEC-008 defines the Execution Gateway as the enforcement boundary but treats "dispatch external execution" and "credentials leased only if permitted" as black boxes (SPEC-008 §Enforcement Model). SPEC-000's component list separately names a Simulation Runtime, a Tool Adapter Layer, and credential control as distinct responsibilities (§11), and L3 ("Agent Simulates," SPEC-007 §19) requires an actual simulation environment to exist.

This specification defines the three concrete mechanisms the Execution Gateway calls into once a grant has been verified: how an action is simulated instead of executed for L3, how a Tool Adapter actually calls an external system without being able to expand the grant it was given, and how credentials are leased for exactly the scope and duration a grant permits and never handed to the agent directly.

---

# 1. Foundational Principle

```text
Tool Adapters cannot increase authority.
```
(EXE-INV-023, restated as the organizing constraint for this entire specification.) Every mechanism here is a *conduit* for authority the Execution Gateway already verified — never a second place where authority can be decided or expanded.

---

# 2. The Problem This Specification Solves

Without this specification:

```text
L3 ("Agent Simulates") has no defined implementation, so it either
never actually gets built, or gets implemented as a real, unguarded
call to the same production tool the grant was trying to keep the
agent away from.

A Tool Adapter designed for one API accepts a broader parameter set
than the grant authorized, silently laundering excess authority
through the adapter's own defaults.

Credentials leased for an action are long-lived, over-scoped, or
returned to the agent process directly, contradicting EXE-INV-024
("Credentials Must Never Be Returned to the Agent") without a
concrete mechanism explaining how that's actually achieved.
```

---

# 3. Position in the System

```text
Execution Gateway completes grant verification, runtime precondition
verification, and monitoring readiness verification (SPEC-008)
          ↓
IF execution mode == SIMULATE  → Simulation Runtime
IF execution mode == EXECUTE    → Tool Adapter Layer + Credential Lease Manager
          ↓
Tool Adapter receives: the exact verified Canonical Action, the exact
grant scope, and a short-lived Credential Lease — never the agent's
own credentials, never a broader parameter set than the grant
          ↓
Tool Adapter calls the external system
          ↓
Response returned to Execution Gateway for reconciliation (SPEC-008)
```

This specification only activates after the Execution Gateway has already verified authority. It never receives a request the Gateway has not cleared.

---

# 4. Core Domain Objects

## 4.1 Simulation Session

```text
simulationSessionId
canonicalActionId
simulationEnvironmentRef      — which non-production/predictive
                                 environment was used
inputSnapshot                   — exact frozen action + context used
predictedEffects[]                — modeled outcome, explicitly labeled
                                     as predicted, never as observed
confidenceOrValidationStatus        — per SPEC-000 §12.3, AI-derived
                                       fields carry this
completedAt
```

## 4.2 Tool Adapter

```text
toolAdapterId
toolReference                — matches CAM Layer 3 toolReference (SPEC-001 §25)
adapterVersion
acceptedParameterSchema        — must be a subset of, never a superset of,
                                  what the grant scope allows
externalSystemDescriptor
```

## 4.3 Credential Lease

```text
leaseId
executionAttemptId           — bound to one specific execution attempt
scope                          — exact permissions, matching grant scope,
                                  never broader
issuedAt
expiresAt                       — short-lived, bounded to the execution
                                   window
revoked                           — boolean, settable by Runtime Sentinel
                                     (SPEC-009 I7/I8) or Execution Gateway
```

Credentials themselves (the secret material) are never a field visible to the agent's process; the Credential Lease record is metadata about a credential the Tool Adapter uses directly, on the agent's behalf, inside the governed execution path.

---

# 5. Simulation Runtime

## 5.1 Purpose

Simulation Runtime implements L3 (SPEC-007 §19): an agent may observe the predicted effect of an action without it reaching a real external effector. This requires an environment where CAM's `simulationSupport` metadata (SPEC-001 §50) is actually exercised.

## 5.2 Requirements

```text
A simulated action must never be dispatched to the same credential
scope or endpoint as a real execution — it must use a distinct,
non-production environment reference, or a provider-supported
dry-run/preview mode that is contractually guaranteed not to produce
a real side effect.

Predicted effects must be labeled as predictions, carrying the
AI/statistical provenance fields required by SPEC-000 §12.2/12.3
where the prediction involved a model.

A Simulation Session's predicted effects are never treated as
Outcome Evidence for competence purposes (COMP-INV-010, "Simulation
Is Not Equivalent to Production Success").
```

## 5.3 Escalation

If a tool has no available simulation or dry-run mode, L3 is not achievable for that tool — the Autonomy Decision Engine must not select L3 for an action whose tool has no verified simulation capability (this is a precondition the Autonomy Decision Engine checks against the Tool Adapter registry before deciding, closing a gap left open by SPEC-007).

---

# 6. Tool Adapter Layer

## 6.1 Purpose

The Tool Adapter Layer is the only component permitted to make an outbound call to an external effector on behalf of a governed action.

## 6.2 Scope Containment

```text
Every Tool Adapter's acceptedParameterSchema must be a strict subset
of the grant scope's allowed parameter space. This is checked at
adapter registration time, not only at call time — an adapter whose
schema could ever accept an out-of-scope value is rejected from
registration.

A Tool Adapter must reject, not silently clamp or coerce, any
parameter value outside what the specific grant for this execution
attempt allows. Silent coercion is a form of authority laundering.

A Tool Adapter must not apply its own default values for
grant-controlled fields (e.g. defaulting a missing "amount" field to
some adapter-internal maximum). Missing mandatory fields fail closed
(EXE-INV-007).
```

## 6.3 Response Handling

External responses must be preserved verbatim (EXE-INV-018) and passed back to the Execution Gateway for reconciliation — the Tool Adapter does not interpret success/failure on the Gateway's behalf; it reports what the external system actually said.

---

# 7. Credential Lease Manager

## 7.1 Purpose

Issues short-lived, narrowly scoped credentials to the Tool Adapter Layer, never to the agent's own process.

## 7.2 Leasing Rules

```text
A lease is issued only after the Execution Gateway has completed
grant verification (SPEC-008) for the specific execution attempt.

A lease's scope is derived mechanically from the grant's scope —
it is not independently configured, to prevent drift between "what
the grant allows" and "what the credential allows."

A lease expires at or before the execution attempt's completion,
whichever is sooner; leases are not pooled or reused across
execution attempts.

A lease may be revoked mid-flight by the Runtime Sentinel (I7
Isolate, I8 Revoke) or by the Execution Gateway; revocation must
take effect before the next Tool Adapter call, not retroactively.
```

## 7.3 Multi-Tenant Isolation

Credential Leases are tenant-scoped; a lease issued for one tenant's execution attempt must be structurally incapable of being used against another tenant's resources, consistent with the Multi-Tenant Principle.

---

# 8. Invariants

## ENA-INV-001 — No Execution Path Bypasses the Execution Gateway

Simulation Runtime, Tool Adapter Layer, and Credential Lease Manager may only be invoked by the Execution Gateway after grant verification; none of them accept a request directly from an agent.

## ENA-INV-002 — Adapter Schema Is a Subset, Never a Superset

An adapter's `acceptedParameterSchema` cannot express a value the grant scope forbids. This is validated at registration, not only at runtime.

## ENA-INV-003 — Simulated Effects Are Never Real Effects

A Simulation Session must not be capable of reaching the same credential scope or external endpoint used for real execution.

## ENA-INV-004 — Credentials Are Never Returned to the Agent

Restates EXE-INV-024 at the mechanism level: the Credential Lease Manager's output interface has no field or path that transmits secret material to the agent's own process; only the Tool Adapter holds it, internally, for the duration of one call.

## ENA-INV-005 — Lease Scope Is Derived, Not Independently Configured

Lease scope is computed from the grant, mechanically, to prevent silent drift between authority and credential capability.

## ENA-INV-006 — Revocation Takes Effect Before the Next Call

A revoked lease must block the next Tool Adapter invocation; it is not sufficient for revocation to merely be recorded if enforcement lags behind it.

## ENA-INV-007 — Adapter Response Integrity

A Tool Adapter must return the external system's response verbatim; it must not summarize, reinterpret, or suppress fields before they reach the Execution Gateway's reconciliation step.

---

# 9. Failure Behavior

| Failure | Response |
|---|---|
| Simulation environment unavailable for a tool selected at L3 | Execution does not proceed at L3; the Autonomy Decision Engine must be asked to re-decide, since the precondition for L3 is no longer met (fail closed, not silently downgrade to real execution). |
| Credential Lease Manager unavailable | No execution attempt may proceed; this is equivalent to a runtime precondition failure (SPEC-008 §Enforcement Model). |
| Tool Adapter receives an out-of-scope parameter | Reject at the adapter boundary; do not forward to the external system at all. |
| External system returns an ambiguous/partial response | Preserved verbatim and passed to the Execution Gateway as `UNKNOWN`-leaning per EXE-INV-019; the adapter does not guess. |

---

# 10. Security Boundaries

```text
BOUNDARY C (restated from SPEC-000 §26): Execution Plane → External Tool
Threats: credential misuse, unexpected side effects, tool compromise,
         response forgery — this specification is where those threats
         are structurally addressed via lease scoping, schema
         containment, and verbatim response preservation.
```

---

# 11. Events

```text
SIMULATION_SESSION_STARTED
SIMULATION_SESSION_COMPLETED
TOOL_ADAPTER_INVOKED
TOOL_ADAPTER_RESPONSE_RECEIVED
TOOL_ADAPTER_REJECTED_OUT_OF_SCOPE
CREDENTIAL_LEASE_ISSUED
CREDENTIAL_LEASE_EXPIRED
CREDENTIAL_LEASE_REVOKED
```

---

# 12. Testing Strategy

```text
An adapter whose schema could accept an out-of-scope value must fail
registration-time validation, not merely runtime validation.

A revoked lease must block the very next Tool Adapter call in
100% of fault-injected mid-flight revocation tests.

A Simulation Session must never be able to reach the production
credential scope, verified by attempting to route a simulated call
through the real Credential Lease Manager and confirming rejection.
```

---

# 13. Adversarial Scenarios

```text
A Tool Adapter is updated by a third-party integration and begins
accepting a new parameter outside the originally registered schema.
Expected: registration-time schema validation catches this on
redeployment; if it is not re-validated, this is a gap this
specification requires closing via mandatory schema re-validation on
every adapter version change.

An agent attempts to request a Credential Lease directly, bypassing
the Execution Gateway. Expected: the Credential Lease Manager has no
externally reachable interface for direct agent requests — it only
accepts calls originating from the Execution Gateway's internal
invocation path.
```

---

# 14. Research Questions

```text
How much of the gap between "agent simulates successfully" and
"agent executes successfully" is explained by simulation fidelity
versus genuine situational difference, and does that gap predict
real-world failure rate? (Feeds SPEC-003 competence modeling.)
```

---

# 15. V1 Implementation Boundary

V1 must implement: schema-subset validation at adapter registration, verbatim response preservation, short-lived scoped credential leases bound to one execution attempt, and at least one working Simulation Runtime environment for the flagship refund benchmark (a payment-provider sandbox/dry-run mode is sufficient). Cross-provider simulation fidelity scoring is out of scope for V1.

---

# 16. Newly Locked Decisions

```text
1. Tool Adapters, Simulation Runtime, and Credential Lease Manager
   are only reachable through the Execution Gateway's internal
   invocation path — never directly by an agent.

2. Adapter parameter schemas are validated as subsets of grant scope
   at registration time, not only at call time.

3. Credential Lease scope is mechanically derived from the grant;
   it is never independently configured.

4. Simulated effects are never eligible as competence evidence.
```

---

# 17. Unresolved Questions

```text
What is the minimum bar for a "verified simulation capability" per
tool, below which the Autonomy Decision Engine must refuse to
select L3?

How should the platform handle tools with no vendor-supported dry-run
mode at all — is a locally modeled simulation ever an acceptable
substitute, and under what evidentiary conditions?
```
