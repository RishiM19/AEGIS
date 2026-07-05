# AGENTS.md

**Document ID:** AEGIS-AGENTS
**Status:** Canonical
**Audience:** Any AI coding agent (Claude Code, Codex, or otherwise) operating in this repository
**Depends On:** None — this is the entry point

---

# 0. What This File Is

This file is the operating contract for any AI coding agent working in the AEGIS repository. It is read first, before `handbook/aegis-master-context.md`, before any specification, before writing any code or document.

It is not a style guide. It is a set of hard behavioral rules derived from how this project has already been burned by unstructured agent behavior — most notably, `handbook/SPEC-001.md` and `handbook/SPEC-002.md` existing as byte-identical duplicates for an unknown period, silently masking a missing Agent Identity specification until a later pass caught it (see `handbook/AEGIS-SPEC-ROADMAP.md` §3).

---

# 1. Required Reading Order

Before creating, editing, or reasoning conclusively about any AEGIS specification:

```text
1. Read this file (AGENTS.md).

2. Read handbook/aegis-master-context.md.

3. Read handbook/AEGIS-ARCHITECTURE-DECISIONS.md.

4. Read handbook/AEGIS-RESEARCH-THESIS.md.

5. Read handbook/AEGIS-SPEC-ROADMAP.md.

6. Read the specifications directly upstream of whatever you are
   about to touch, per the Depends On field of that specification.

7. Build a dependency map before writing anything.

8. Identify inherited contracts and unresolved boundaries.

9. Only then act.
```

This mirrors `aegis-master-context.md` §70 exactly; that section exists for humans reading the master context, this file exists so an agent encounters the same rule before it has read anything else.

---

# 2. The Repository Is the Source of Truth

```text
Existing specifications are cumulative contracts.

You are not the independent architect of this system.

You may identify gaps.

You may identify contradictions.

You may identify security weaknesses.

You may propose improvements.

You may not silently redesign the system.
```

Concretely: do not rename a canonical term because you think a different word is clearer. Do not "clean up" a spec's structure to match your own preferred format. Do not merge two domain objects because they look similar. Do not delete an invariant because it seems redundant. Every one of those actions is a silent redesign.

---

# 3. Required Behavior When You Find a Contradiction

This is not optional, and it is not satisfied by picking the interpretation that seems more plausible and moving on.

```text
1. Identify the contradiction precisely — cite file and section on both sides.

2. Explain the architectural impact: what breaks, what depends on
   the ambiguous piece, what downstream specs assume.

3. Propose one or more concrete resolutions.

4. Mark the issue as requiring a canonical decision.

5. Surface it to the user/principal and wait for explicit approval
   before changing any locked document.
```

Only after approval may you edit the affected canonical documents, and when you do, you must record the resolution in-place (see the correction record pattern in `aegis-master-context.md` §24 and `handbook/AEGIS-SPEC-ROADMAP.md` §3) rather than silently rewriting history.

The one exception: you may fix a **verified, mechanical** defect without asking — e.g. a byte-identical duplicate file where the correct content is unambiguous from context — but you must still surface what you found and why you judged it mechanical rather than a design contradiction. When genuinely unsure whether something is a contradiction requiring a decision versus a typo, treat it as a contradiction.

---

# 4. Required Behavior When Creating a New Specification

Every new SPEC-NNN must define all of the following before it is considered complete:

```text
Purpose
Dependencies (exact upstream SPEC numbers)
Responsibilities
Non-responsibilities
Domain objects
State / lifecycle (if applicable)
Invariants (SPEC-NNN-INV-XXX numbered)
Critical flows
Failure behavior
Security boundaries
Events
Testing strategy
Adversarial scenarios
Research questions (where relevant)
V1 implementation boundary
Newly locked decisions
Unresolved questions
```

A specification missing several of these sections is a draft, not a contract, and must not be treated as governing implementation.

Canonical terminology (`aegis-master-context.md` §45) must not be silently replaced with synonyms. If a new specification needs a new canonical term, it must introduce it explicitly and add it to that terminology list.

---

# 5. Required Behavior When Implementing Code

```text
Implementation must trace back to a specification, an architecture
decision, or an approved amendment.

Code must not introduce hidden architecture — if an implementation
detail requires a decision the specs don't make, surface it, don't
silently encode it as if it were already settled.

Critical safety paths (grant verification, authority scope checks,
kill-switch/containment, hard runtime invariants) must not depend
solely on an LLM call. See handbook/AEGIS-ARCHITECTURE-DECISIONS.md
§ LLM Boundary.
```

---

# 6. Numbering and File Integrity

```text
Never leave two specification files with identical content. If you
must scaffold a placeholder, mark it explicitly as
"STATUS: PLACEHOLDER — NOT YET AUTHORED" rather than duplicating a
neighboring file.

Never renumber an existing, already-referenced specification without
explicit approval — other specs' Depends On fields point to exact
numbers.

SPEC-000's "Governs: SPEC-001 through SPEC-018" header is a hard
boundary. A SPEC-019 or beyond requires amending that header first.
```

---

# 7. When You Are Told to "Keep Going" on a Large Set of Documents

When explicitly instructed to produce a full batch of planned documents in one continuous effort:

```text
Track the full list with the task tool before starting.

Surface any contradiction you hit along the way immediately — do not
silently work around it and keep going, and do not stop and wait
unless the contradiction genuinely requires a subjective call the
user must make (numbering/scope decisions, tradeoffs with no
objectively correct answer).

Keep documents internally consistent with each other as you go —
a later document must not contradict an earlier one you just wrote
in the same batch.

At the end, do a final consistency pass: update any "status: next"
or "not yet written" markers in earlier documents that are now stale
because you completed the work.
```

---

# 8. Summary

Read first. Trust the repository over your own instincts about better naming or structure. Surface contradictions instead of resolving them silently. Write specifications completely or not at all. Never let numbering drift silently.
