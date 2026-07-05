# AEGIS TECHNICAL SPECIFICATION 015

## Multi-Agent Delegation and Causal Responsibility

**Document ID:** AEGIS-SPEC-015
**Status:** Design Draft
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Specification Type:** Delegation Graph Architecture
**Depends On:** AEGIS-SPEC-000, AEGIS-SPEC-001, AEGIS-SPEC-002, AEGIS-SPEC-006, AEGIS-SPEC-007, AEGIS-SPEC-013
**Primary Owner:** Delegation Graph Service
**Primary Runtime Component:** Delegation Graph Service
**Consumers:** Autonomy Decision Engine, Consequence Engine, Attribution Engine, Event Ledger

---

# 0. Purpose of This Specification

SPEC-000 §29 explicitly defers this topic: "Multi-agent causal responsibility will be designed in later specifications." This is that specification.

An action may originate from a chain — Human → Coordinator Agent → Research Agent → Decision Agent → Execution Agent (`aegis-master-context.md` §29 restated). Every prior specification implicitly assumes a single acting agent per Canonical Action. This specification defines how AEGIS preserves the full chain when that assumption doesn't hold, without requiring any upstream specification to be rewritten.

---

# 1. Foundational Principle

```text
The final executing agent's competence does not erase weaknesses
earlier in the chain.
```
(SPEC-000 §29, verbatim.)

---

# 2. The Problem This Specification Solves

Without this specification:

```text
A highly competent Execution Agent faithfully executes a decision
that a much less reliable upstream Decision Agent produced, and the
system credits the outcome to the Execution Agent's competence
record, hiding the actual point of failure.

A Coordinator Agent orchestrates five sub-agents to jointly produce
one refund action; when it goes wrong, there is no structural way
to identify which sub-agent's contribution was actually at fault.

An originating human Principal's intent is lost by the third hop in
the chain, and by the time the action reaches the Execution Gateway,
there is no way to verify the action still serves the Principal's
actual original objective.
```

---

# 3. Position in the System

The Delegation Graph Service does not replace CAM's existing `actorIdentity` and lineage fields (SPEC-001 §8-11) — it extends them for the case where the immediate actor is not the only agent involved:

```text
CAM's existing single-actor lineage (SPEC-001 §9-11: Principal,
Intent/Objective References, Trigger Model)
          ↓  extended by, when a chain exists
DELEGATION CHAIN — ordered list of every agent hop between the
   originating Principal and the immediate actor
          ↓
CONSEQUENCE ASSESSMENT (SPEC-006) considers the weakest verified
   link in the chain, not only the immediate actor
          ↓
AUTONOMY DECISION (SPEC-007) applies the chain-aware ceiling (§6)
          ↓
ATTRIBUTION (SPEC-013) can attribute an outcome to a specific hop,
   not only to the immediate executing agent
```

---

# 4. Core Domain Objects

## 4.1 Delegation Chain

```text
delegationChainId
originatingPrincipalId       — the human or top-level Principal (SPEC-000 §8.1)
hops[]                          — ordered list of Delegation Hops
immediateActorAgentId              — the agent that actually produced the
                                      Canonical Action reaching the
                                      Execution Gateway
```

## 4.2 Delegation Hop

```text
hopIndex
fromPrincipalOrAgentId
toAgentId
delegatedIntent               — what was actually asked of this hop,
                                 which may narrow (never widen) the
                                 originating Principal's intent
delegatedAuthorityScope          — must be a subset of the authority
                                    received from the prior hop
                                    (structural analogue of EXE-INV-004,
                                    applied to delegation rather than
                                    grant scope)
agentVersionIdAtHop                 — which Agent Version (SPEC-002)
                                       performed this hop
```

## 4.3 Causal Responsibility Record

```text
causalResponsibilityId
delegationChainId
outcomeEvaluationId          — links to SPEC-013's outcome evaluation
responsibleHopIndex[]           — which hop(s) the Attribution Engine
                                   determined were causally responsible
                                   for the outcome
```

---

# 5. Invariants

## DEL-INV-001 — Authority Cannot Widen Across a Hop

Each Delegation Hop's `delegatedAuthorityScope` must be a subset of the authority the prior hop actually held. A sub-agent cannot receive broader authority than its coordinator possessed — this is EXE-INV-004's principle applied one layer upstream of execution.

## DEL-INV-002 — The Originating Principal Is Always Preserved

Regardless of chain depth, `originatingPrincipalId` is preserved unchanged through every hop. No intermediate agent may substitute itself as the originating Principal.

## DEL-INV-003 — Chain Depth Does Not Exempt Any Hop From Governance

Every hop that itself proposes or modifies an action is subject to the same CAM normalization, identity resolution, and (where it independently executes anything) the same Execution Gateway enforcement as a single-agent action. Depth in a chain is not a loophole.

## DEL-INV-004 — Consequence Assessment Uses the Weakest Verified Link

The Consequence Engine (SPEC-006), when assessing an action that arrived via a Delegation Chain, must consider the least reliable verified hop's competence/novelty/epistemic profile as a limiting input — a highly competent final Execution Agent cannot average out a poorly evidenced upstream Decision Agent (SPEC-000 §29 restated as an enforceable rule).

## DEL-INV-005 — Attribution May Resolve to a Specific Hop

The Causal Responsibility Record must be capable of identifying a single hop as responsible, rather than always spreading responsibility evenly across the whole chain — otherwise a genuinely faulty hop's poor evidence gets diluted across better-performing hops, defeating SPEC-013's per-region competence model.

## DEL-INV-006 — Delegation Chains Are Immutable Once Recorded

Once a Delegation Chain is attached to a Canonical Action and that action proceeds past CAM normalization, the recorded chain cannot be edited — only superseded by a new action version, following CAM-INV-003.

## DEL-INV-007 — Cross-Tenant Delegation Requires Explicit Cross-Tenant Authorization

A Delegation Hop that crosses a tenant boundary requires its own explicit authorization record, separate from same-tenant delegation, per the Multi-Tenant Principle.

---

# 6. Chain-Aware Autonomy Ceiling

This extends SPEC-007's autonomy ceiling model (`L_final = min(L_authority, L_competence, L_novelty, L_uncertainty, L_consequence, L_state)`, SPEC-000 §23) with one additional ceiling term when a Delegation Chain is present:

```text
L_final = min(
    L_authority, L_competence, L_novelty, L_uncertainty,
    L_consequence, L_state,
    L_chain
)

where L_chain = min( L_hop for every hop in the Delegation Chain )
```

`L_chain` is computed the same way as `L_competence` would be for a single agent, but evaluated independently per hop and reduced to its minimum — consistent with AUT-INV-013 (Critical Blockers Survive Aggregation): the chain's weakest hop is a hard limiting factor, not something a strong hop elsewhere can average away.

---

# 7. Failure Behavior

| Failure | Response |
|---|---|
| A hop's Agent Version cannot be resolved (SPEC-002 identity failure) | The entire Delegation Chain is treated as unverifiable; `L_chain` collapses to L0, per AGENT-INV-006's hard-block precedent. |
| Delegation Graph Service unavailable | Any action whose CAM lineage indicates a multi-hop chain cannot proceed past authority validation — this is a hard block, not a single-agent fallback, since treating a multi-agent action as single-agent would silently discard DEL-INV-004. |
| A hop's `delegatedAuthorityScope` cannot be verified as a subset of the prior hop | Reject the chain; do not silently clamp to the narrower scope without flagging the violation (this is itself a security-relevant event, not routine clamping). |

---

# 8. Security Boundaries

```text
BOUNDARY: Intermediate Agent → Delegation Graph Service
Threats: an intermediate agent forging a broader delegatedAuthorityScope
         than it actually received, or substituting a different
         originatingPrincipalId to launder authority.

BOUNDARY: Delegation Graph Service → Consequence Engine / Autonomy
          Decision Engine
Threats: a compromised or buggy chain-resolution step silently
         dropping a weak hop from L_chain's computation, effectively
         hiding a limiting factor.
```

---

# 9. Events

```text
DELEGATION_CHAIN_CREATED
DELEGATION_HOP_RECORDED
DELEGATION_AUTHORITY_WIDENING_REJECTED
DELEGATION_CHAIN_CEILING_COMPUTED
CAUSAL_RESPONSIBILITY_RECORD_CREATED
CROSS_TENANT_DELEGATION_AUTHORIZED
```

---

# 10. Testing Strategy

```text
A synthetic chain with one weak hop (low competence, high novelty)
and four strong hops must produce L_chain equal to the weak hop's
ceiling, not an averaged value, across randomized chain compositions.

An attempted authority-widening hop must be rejected in 100% of
fault-injected widening attempts.

Attribution on a chain with a single identifiably faulty hop must
resolve the Causal Responsibility Record to that hop specifically,
not spread evenly, in controlled scenario testing.
```

---

# 11. Adversarial Scenarios

```text
A Coordinator Agent attempts to present a five-hop chain as a
single-hop action to bypass the chain-aware ceiling. Expected:
CAM's lineage fields (SPEC-001 §9-12, Trigger Model) are required to
faithfully record actual causation; a Coordinator Agent that
fabricates a simplified lineage is a CAM integrity violation
(CAM-INV-008, No Silent Enrichment, applied to omission as well as
addition) which this specification's chain reconciliation should be
able to flag when hop-level Agent Version records exist but aren't
referenced in the lineage.

An intermediate agent attempts to claim origination from a
higher-trust Principal than the one that actually initiated the
chain. Expected: rejected by DEL-INV-002; originating Principal is
fixed at the first hop and cannot be reassigned downstream.
```

---

# 12. Research Questions

```text
Does chain-aware ceiling computation (min-of-hops) generalize well,
or do some chain topologies (e.g. parallel fan-out/fan-in rather than
strictly sequential hops) require a different aggregation function
than a simple minimum?
```

---

# 13. V1 Implementation Boundary

V1 must implement: sequential (non-branching) Delegation Chains, the chain-aware ceiling as a strict minimum, authority-widening rejection, and originating-Principal preservation. Fan-out/fan-in multi-agent topologies (parallel sub-agents jointly producing one action) are explicitly out of scope for V1 and flagged as an open research question.

---

# 14. Newly Locked Decisions

```text
1. Delegated authority scope must be a subset of the prior hop's
   scope at every hop; widening is rejected, not clamped silently.

2. The originating Principal is fixed at the first hop and cannot be
   reassigned by any downstream hop.

3. The chain-aware autonomy ceiling is the strict minimum across all
   hops' individual ceilings.

4. Attribution may resolve responsibility to a specific hop rather
   than always spreading it evenly across the chain.
```

---

# 15. Unresolved Questions

```text
What aggregation function should govern non-sequential (fan-out/
fan-in) multi-agent topologies?

How deep can a Delegation Chain go before its ceiling computation
becomes practically meaningless (i.e. is there a maximum useful
chain depth beyond which AEGIS should simply refuse to grant
autonomy above L1)?
```
