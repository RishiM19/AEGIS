# AEGIS TECHNICAL SPECIFICATION 002

## Agent Identity, Registration and Lifecycle

**Document ID:** AEGIS-SPEC-002
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Core Domain Model
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001
**Primary Owner:** Agent Registry
**Primary Runtime Component:** Agent Registry
**Consumers:** Competence Engine, Novelty Engine, Epistemic Engine, Consequence Engine, Autonomy Decision Engine, Execution Gateway, Runtime Sentinel, Recovery Engine, Event Ledger, Research Harness

---

# 0. Purpose of This Specification

This specification defines the governed agent as a first-class system identity.

Every Canonical Action (SPEC-001) carries an `actorIdentity` reference. This document defines what that reference actually resolves to: a persistent, versioned, owned entity with a lifecycle — not a display name, not a bearer token, not a prompt string.

Without a stable governed identity, none of the downstream engines have a stable subject to attach evidence, competence, risk history, or authority to. Identity is the foundation the rest of the architecture is built on.

This document answers:

```text
What exactly is a governed agent?

What distinguishes an agent from an agent version from a runtime instance?

Who owns an agent?

What lifecycle states can an agent occupy?

What triggers a lifecycle transition?

What happens to in-flight authority when an agent is suspended or retired?

How does AEGIS verify that the entity claiming an identity actually is that identity?

What must never be inferred from identity alone?
```

---

# 1. Foundational Principle

```text
No autonomous action exists without a governed acting identity.
```

An agent is not merely a prompt or a model configuration. It is a persistent governed entity with identity, version, ownership, capabilities, runtime instances, evidence, history, and current state (`aegis-master-context.md` §12).

Identity is not competence, and identity is not authority (`aegis-master-context.md` §46). This specification establishes only the first of those: *who is acting*. SPEC-003 (competence) and SPEC-007 (authority via delegation and policy) build on top of this identity, they do not define it.

---

# 2. The Problem This Specification Solves

Without a governed identity model, the following failures become possible:

```text
An agent's model is silently upgraded and its accumulated competence
evidence is assumed to transfer unchanged.

A suspended agent continues to execute because "the agent" was never
a concrete, checkable entity — only a name in a config file.

Two different deployments of "the same" agent accumulate evidence
into one shared bucket, even though one has a materially different
system prompt and tool configuration.

An agent claims to be an identity it is not, and downstream systems
have no verification boundary to catch it.
```

Two agents may possess the same formal permission (`refund_customer`) while having wildly different track records and configurations. AEGIS must be able to tell them apart precisely and durably.

---

# 3. Position in the System

The Agent Registry is consulted immediately after CAM normalization and before any assessment engine runs:

```text
Proposed Action
      ↓
CAM Normalization (SPEC-001)
      ↓
Agent Identity Resolution (this specification)
      ↓
Authority / Delegation Validation
      ↓
Competence / Novelty / Epistemic / Consequence Assessment
      ↓
Autonomy Decision
```

If identity resolution fails, no assessment engine may proceed. This is a hard gate, not a soft input.

---

# 4. System Invariants

## AGENT-INV-001 — No Anonymous Autonomy

Every governed action must resolve to a known, registered, non-expired agent identity before any assessment may begin. This is `aegis-master-context.md` Guarantee 1, and this specification is where it is enforced.

## AGENT-INV-002 — Agent, Version and Runtime Instance Are Distinct

```text
Agent           — the durable identity across its entire lifetime
Agent Version   — a specific configuration snapshot of that agent
Runtime Instance — a specific running process/session executing a version
```

An `agentId` never changes. An `agentVersionId` changes whenever the model, system prompt, tool configuration, or critical instructions change. A `runtimeInstanceId` is created per deployment/session and is always short-lived relative to the version.

## AGENT-INV-003 — Competence Does Not Silently Transfer Across Versions

`RefundAgent v3` and `RefundAgent v4` are not automatically treated as identical performers (`SPEC-000` §8.2). A version transition may carry forward competence evidence only through an explicit, versioned competence-transfer policy — never by default equivalence.

## AGENT-INV-004 — Lifecycle State Is Authoritative and Externally Enforced

An agent's lifecycle state is not something the agent reports about itself (`aegis-master-context.md` §48, No Self-Governance Principle). It is set by the Agent Registry and checked by the Execution Gateway (SPEC-008) on every request.

## AGENT-INV-005 — Suspension and Retirement Do Not Retroactively Alter History

Suspending or retiring an agent changes what it may do going forward. It must never alter, hide, or reinterpret already-recorded historical decisions, contracts, or evidence (consistent with SPEC-000 INV-007).

## AGENT-INV-006 — Identity Verification Precedes Everything

The claimed identity of the calling entity must be cryptographically or structurally verified before the Agent Registry resolves any record. An unverifiable claim resolves to `AGENT_UNKNOWN`, which is a hard block, not a low-autonomy default.

## AGENT-INV-007 — Capability Declarations Are Descriptive, Not Grants

An agent's declared capabilities (which tools/domains it is built to use) describe what it *might* attempt. They are not authority. Authority is established later, per SPEC-007. A capability declaration with no matching delegation produces `NOT_AUTHORIZED`, not `AUTONOMOUS`.

---

# 5. Core Domain Objects

## 5.1 Principal

The entity — human, organization, or authorized service — from which an agent's existence and ownership derive. Defined fully in SPEC-000 §8.1; referenced here as the owner of an Agent record.

## 5.2 Agent

```text
agentId                 — durable, immutable identifier
displayName              — human-readable label (non-authoritative)
ownerPrincipalId          — the Principal that registered this agent
organizationId            — owning organization
tenantId                  — owning tenant
declaredCapabilities[]    — descriptive domain/action-type tags
currentVersionId          — pointer to the active Agent Version
lifecycleState            — see §6
registeredAt              — timestamp
retiredAt                 — timestamp or null
```

## 5.3 Agent Version

```text
agentVersionId            — durable, immutable identifier
agentId                   — parent agent
modelIdentifier            — exact model/provider identifier
modelVersion                — exact model version string
systemPromptHash             — content-hash of the operative system prompt
toolConfigurationHash        — content-hash of the bound tool/adapter set
runtimeConfigurationHash      — content-hash of relevant runtime configuration
createdAt                    — timestamp
supersededAt                 — timestamp or null
competenceTransferPolicy      — reference to how evidence carries forward from
                                 the prior version, or NONE
```

Any change to `modelIdentifier`, `modelVersion`, `systemPromptHash`, or `toolConfigurationHash` mandates a new Agent Version. This is deterministic content-hash comparison, not judgment.

## 5.4 Agent Runtime Instance

```text
runtimeInstanceId          — identifier for one running deployment/session
agentVersionId              — version this instance is executing
startedAt                    — timestamp
endedAt                       — timestamp or null
hostEnvironmentDescriptor      — deployment/environment metadata
```

## 5.5 Identity Verification Record

```text
verificationId
runtimeInstanceId
verificationMethod         — e.g. signed token, mTLS identity, workload identity
verificationResult          — VERIFIED | FAILED | UNKNOWN
verifiedAt
```

---

# 6. Lifecycle State Machine

```text
REGISTERED
    ↓
ACTIVE
    ↓  (policy violation, incident, manual action, evidence-driven concern)
CONSTRAINED
    ↓  (further escalation)
SUSPENDED
    ↓  (resolution, or permanent decision)
ACTIVE (restored)      or      RETIRED
```

## 6.1 REGISTERED

The agent exists as a record. It has not yet been granted any delegation and may not execute.

## 6.2 ACTIVE

The agent may be considered for autonomy decisions, subject to all other assessment engines and policy.

## 6.3 CONSTRAINED

The agent remains active but the Agent Registry publishes a state modifier that downstream engines (chiefly SPEC-007's Autonomy Ceiling and SPEC-009's Runtime Sentinel) must treat as a hard reduction, never an increase, in maximum permitted autonomy. Entering this state does not require deleting or reassessing prior evidence.

## 6.4 SUSPENDED

No new Autonomy Grant may be issued to this agent identity. Any in-flight grants are subject to SPEC-008/SPEC-009 revocation procedures — suspension of identity does not by itself revoke an already-issued grant; it prevents new ones and triggers the runtime intervention pathway for existing ones.

## 6.5 RETIRED

Terminal state. No further grants, no further runtime instances. Historical records remain immutable and queryable per AGENT-INV-005.

## 6.6 State Transition Authority

```text
REGISTERED → ACTIVE           requires an explicit delegation (SPEC-007) to exist
ACTIVE → CONSTRAINED           may be automatic (evidence/policy triggered) or manual
CONSTRAINED → SUSPENDED         may be automatic (Runtime Sentinel escalation) or manual
* → RETIRED                    requires Principal-level or organization-admin authority
SUSPENDED → ACTIVE              requires explicit human review; never automatic
```

No lifecycle transition may be initiated by the agent itself (AGENT-INV-004).

---

# 7. Identity Verification

Before the Agent Registry resolves any record, the calling runtime instance must present a verifiable identity claim. Acceptable verification methods include signed workload identity tokens, mTLS client certificates bound to a registered instance, or an equivalent structural proof — never a self-asserted string in the request body.

```text
Claim presented
      ↓
Verification method checked against registered instance credentials
      ↓
VERIFIED  → proceed to record resolution
FAILED    → AGENT_UNKNOWN, hard block
UNKNOWN/missing → AGENT_UNKNOWN, hard block (never defaults to VERIFIED)
```

This satisfies the Fail-Safe Principle (`aegis-master-context.md` §51): a broken verification path must not silently become "trust the claim."

---

# 8. Failure Behavior

| Failure | Response |
|---|---|
| Agent Registry unavailable | Deny all new autonomy decisions requiring identity resolution; do not fall back to a cached "last known good" state older than a configured freshness bound. |
| Identity verification service unavailable | `AGENT_UNKNOWN`; hard block, not degraded autonomy. |
| Agent Version record missing for a claimed `agentVersionId` | Treat as unregistered; hard block. |
| Competence-transfer policy missing after a version change | Treat the new version as having zero prior evidence, not full inherited evidence. |
| Lifecycle state read is stale beyond the configured freshness bound | Treat as `CONSTRAINED` at minimum, per Safe Degradation (SPEC-000 INV-010). |

---

# 9. Security Boundaries

```text
BOUNDARY: External Runtime Instance → Agent Registry
Threats: forged identity claims, replayed verification tokens,
         stale credential reuse after suspension.

BOUNDARY: Agent Registry → Downstream Engines
Threats: a compromised registry entry silently escalating lifecycle
         state or capability declarations.
```

Suspension and retirement events must propagate to the Execution Gateway and Runtime Sentinel with bounded latency; the maximum acceptable propagation delay is a configured parameter, and exceeding it is itself a monitoring finding (feeds SPEC-009).

---

# 10. Events

```text
AGENT_REGISTERED
AGENT_VERSION_CREATED
AGENT_VERSION_SUPERSEDED
AGENT_RUNTIME_INSTANCE_STARTED
AGENT_RUNTIME_INSTANCE_ENDED
AGENT_IDENTITY_VERIFIED
AGENT_IDENTITY_VERIFICATION_FAILED
AGENT_LIFECYCLE_TRANSITIONED
AGENT_SUSPENDED
AGENT_RETIRED
AGENT_COMPETENCE_TRANSFER_POLICY_APPLIED
```

---

# 11. Testing Strategy

```text
Two Agent Versions of the same Agent must not share competence evidence
without an explicit transfer policy under test.

A suspended agent must be rejected at the Execution Gateway even if a
still-valid Autonomy Grant exists, pending SPEC-008/009 revocation flow.

Identity verification failure must produce AGENT_UNKNOWN in 100% of
fault-injected cases, never a default ACTIVE resolution.

Lifecycle transition authority must be tested against attempted
self-transition by the agent's own runtime instance (must be rejected).
```

---

# 12. Adversarial Scenarios

```text
An agent runtime instance replays an old verification token after
its Agent Version was superseded. Expected: rejected, stale binding.

An operator attempts to reactivate a RETIRED agent by re-registering
the same declared capabilities under a new agentId to "launder" a bad
track record. Expected: this is a new agent with no inherited
competence evidence — the architecture does not prevent re-registration,
but it does prevent evidence inheritance without explicit transfer.

A compromised runtime instance attempts to self-transition its own
lifecycle state from CONSTRAINED back to ACTIVE. Expected: rejected;
only Principal/organization-admin authority may perform that transition.
```

---

# 13. Research Questions

```text
Can a formal competence-transfer policy be learned rather than
manually authored, while still requiring explicit human promotion
before it affects production autonomy?

How much does agent-version churn (frequent prompt/model changes)
degrade achievable autonomy, and is that degradation justified?
```

---

# 14. V1 Implementation Boundary

V1 must implement: Agent, Agent Version, Agent Runtime Instance records; the five-state lifecycle machine; identity verification via at least one structural method; and propagation of lifecycle state to the Execution Gateway within a bounded latency. Automated competence-transfer inference is explicitly out of scope for V1 — V1 competence-transfer policy is NONE by default and must be manually authored per version transition.

---

# 15. Newly Locked Decisions

```text
1. Agent, Agent Version, and Agent Runtime Instance are three distinct,
   separately identified domain objects.

2. Competence evidence never transfers across Agent Versions by default.

3. Lifecycle state is set only by the Agent Registry, never by agent
   self-report.

4. Identity verification failure is always a hard block, never a
   degraded-autonomy default.
```

---

# 16. Unresolved Questions

```text
What is the precise shape of a competence-transfer policy language?

How are multi-tenant agent identities shared (or explicitly
prevented from being shared) across tenants operated by the same
organization?
```
