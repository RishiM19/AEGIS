# AEGIS SPECIFICATION ROADMAP

**Document ID:** AEGIS-SPEC-ROADMAP
**Status:** Canonical
**System:** AEGIS — Adaptive Autonomy Infrastructure for AI Agents
**Document Type:** Canonical Index of All Specifications
**Depends On:** AEGIS-MASTER-CONTEXT

---

# 0. Purpose

This document is the single authoritative index of every AEGIS specification, from SPEC-000 through SPEC-018 (the range governed by SPEC-000's header: "Governs: SPEC-001 through SPEC-018").

It exists because the narrative descriptions embedded in `aegis-master-context.md` §24–31 were written aspirationally, before several specifications were actually authored, and drifted out of sync with the real file contents. This roadmap is now the source of truth for **which file covers which topic**. Where this document and any narrative prose elsewhere disagree, this document wins for topic assignment; `aegis-master-context.md` remains authoritative for the *conceptual* orientation (planes, control loop, guarantees).

---

# 1. Canonical Sequence Table

| Spec | Title | Primary Runtime Component | Status | Depends On |
|---|---|---|---|---|
| SPEC-000 | System Architecture and Engineering Constitution | — (constitutional) | Complete | None |
| SPEC-001 | Canonical Action Model (CAM) | Action Normalizer | Complete | SPEC-000 |
| SPEC-002 | Agent Identity, Registration and Lifecycle | Agent Registry | Complete | SPEC-000, SPEC-001 |
| SPEC-003 | Competence Topology Engine | Competence Engine | Complete | SPEC-000, SPEC-001, SPEC-002 |
| SPEC-004 | Novelty Engine | Novelty Engine | Complete | SPEC-000, SPEC-001, SPEC-003 |
| SPEC-005 | Epistemic (Uncertainty) Engine | Epistemic Engine | Complete | SPEC-000–004 |
| SPEC-006 | Consequence (Risk) Engine | Consequence Engine | Complete | SPEC-000–005 |
| SPEC-007 | Adaptive Autonomy Decision and Granting System | Autonomy Decision Engine | Complete | SPEC-000–006 |
| SPEC-008 | Execution Gateway and Authority Enforcement | Execution Gateway | Complete | SPEC-000–007 |
| SPEC-009 | Runtime Observation, Detection, Intervention and Containment | Runtime Sentinel | Complete | SPEC-000–008 |
| SPEC-010 | Recovery, Rollback, Compensation and Post-Incident Restoration | Recovery Engine | Complete | SPEC-000–009 |
| SPEC-011 | Approval Coordination and Human-in-the-Loop System | Approval Coordinator | Complete | SPEC-000–002, 006, 007, 008, 010 |
| SPEC-012 | Execution Enablement: Simulation, Tool Adapters and Credential Leasing | Simulation Runtime, Tool Adapter Layer | Complete | SPEC-000–002, 007, 008 |
| SPEC-013 | Outcome Evaluation, Attribution and Evidence Feedback | Outcome Evaluation Engine, Attribution Engine | Complete | SPEC-000–003, 007, 008, 009, 010, 011, 012 |
| SPEC-014 | Event Ledger, Audit and Reproducibility System | Event Ledger | Complete | SPEC-000–013 (cross-cutting) |
| SPEC-015 | Multi-Agent Delegation and Causal Responsibility | Delegation Graph Service | Complete | SPEC-000–002, 006, 007, 013 |
| SPEC-016 | Anti-Gaming and Evidence Integrity System | Evidence Integrity Engine | Complete | SPEC-000–003, 013, 014, 015 |
| SPEC-017 | Configuration, Algorithm Registry and Experimentation Governance | Configuration Registry, Algorithm Registry | Complete | SPEC-000–014 (cross-cutting) |
| SPEC-018 | Research, Benchmark and Metrics System | Research and Benchmark Harness | Complete | SPEC-000–017 (cross-cutting) |

---

# 2. Why the Sequence Is Ordered This Way

The sequence follows the canonical system chain from `aegis-master-context.md` §22, extended past runtime safety into recovery and learning:

```text
IDENTIFY (001-CAM normalizes the action, 002 identifies the agent)
    ↓
ASSESS (003 competence, 004 novelty, 005 uncertainty, 006 consequence)
    ↓
DECIDE (007 autonomy decision + policy)
    ↓
GRANT + VERIFY + EXECUTE (008 execution gateway, 012 simulation/tools/credentials)
    ↓
OBSERVE + DETECT + INTERVENE (009 runtime sentinel)
    ↓
RECOVER (010)
    ↓
Human-in-the-loop threads through the whole chain (011)
    ↓
LEARN (013 outcome/attribution feeds 003's competence evidence)
    ↓
Cross-cutting infrastructure that every prior plane depends on
(014 audit, 015 multi-agent, 016 anti-gaming, 017 config/experimentation, 018 research)
```

001 and 002 are listed as CAM-then-Identity rather than Identity-then-CAM (the original master-context intent) because CAM was the spec actually authored first and is stable; see §3 below for why this was preserved rather than renumbered.

---

# 3. The SPEC-001/002 Correction

Prior to this roadmap, `handbook/SPEC-002.md` was a byte-identical duplicate of `handbook/SPEC-001.md` (both contained the CAM spec), and no Agent Identity/Registration/Lifecycle spec existed anywhere in the repository, despite `aegis-master-context.md` describing SPEC-001 as that topic.

**Resolution (approved 2026-07-05):** file content is authoritative over the master-context narrative. CAM keeps its existing slot at SPEC-001. The duplicate at SPEC-002 was replaced with newly authored Agent Identity, Registration and Lifecycle content. `aegis-master-context.md` §24–31 has been corrected to match. No existing spec body (003–009) was rewritten or renumbered; the master-context's inaccurate descriptions of what those specs covered ("Context and Evidence Architecture," "Risk Assessment System," "Agent Competence and Reliability System," "Policy and Governance Evaluation Layer") were corrected to match what the files actually contain. The two topics implied by those inaccurate titles were confirmed already covered elsewhere: Context/Evidence lives inside CAM's Layer 3–4, and Policy/Governance lives inside SPEC-007 §26–29.

---

# 4. Not-Yet-Written Specs at Time of This Roadmap's Creation

At the point this roadmap was authored, SPEC-010 through SPEC-018 did not yet exist. They are defined here for the first time, derived from:

```text
The 26-component list in SPEC-000 §11 not yet covered by SPEC-001–009.

The Learning Plane described in aegis-master-context.md §58 (Evidence Feedback Loop).

The explicit forward references already embedded in earlier specs:
  - SPEC-000 §26/27 names "SPEC-016" as the anti-gaming/evidence-independence spec.
  - aegis-master-context.md §20/76 names SPEC-010 as Recovery.
  - SPEC-000 §29 defers multi-agent causal responsibility to "later specifications."
  - SPEC-000 §21 requires OFF/SHADOW/CANARY/ACTIVE experimentation governance.
```

Per `AGENTS.md` and master-context §71–73, each of these was designed as a full specification (purpose, responsibilities, non-responsibilities, domain objects, state, invariants, critical flows, failure behavior, security boundaries, events, testing, adversarial scenarios, research questions, V1 boundary) rather than left as a stub, since the user directed that all planned documents be produced now.

---

# 5. Post-SPEC-018 Boundary

SPEC-000's header governs only through SPEC-018. No SPEC-019+ is implied by any existing document. Any future specification beyond SPEC-018 requires amending SPEC-000's "Governs" header first, per the versioning and no-silent-drift principles.
