/**
 * Agent lifecycle state machine (SPEC-002 SS6).
 *
 * AGENT-INV-004: lifecycle state is authoritative and externally enforced.
 * No transition may be initiated by the agent itself -- every transition
 * here requires an explicit `authority` argument identifying who is
 * allowed to perform it, and the function rejects transitions that
 * violate SPEC-002 SS6.6's authority table.
 */

import type { AgentLifecycleState } from "./agent-types.js";

export type TransitionAuthority = "DELEGATION_ISSUED" | "AUTOMATIC" | "MANUAL_OPERATOR" | "PRINCIPAL_OR_ORG_ADMIN" | "HUMAN_REVIEW";

export class InvalidLifecycleTransition extends Error {
  constructor(from: AgentLifecycleState, to: AgentLifecycleState, reason: string) {
    super(`Invalid agent lifecycle transition ${from} -> ${to}: ${reason}`);
    this.name = "InvalidLifecycleTransition";
  }
}

interface TransitionRule {
  to: AgentLifecycleState;
  allowedAuthorities: TransitionAuthority[];
}

const TRANSITIONS: Record<AgentLifecycleState, TransitionRule[]> = {
  REGISTERED: [{ to: "ACTIVE", allowedAuthorities: ["DELEGATION_ISSUED"] }],
  ACTIVE: [
    { to: "CONSTRAINED", allowedAuthorities: ["AUTOMATIC", "MANUAL_OPERATOR"] },
    { to: "RETIRED", allowedAuthorities: ["PRINCIPAL_OR_ORG_ADMIN"] },
  ],
  CONSTRAINED: [
    { to: "SUSPENDED", allowedAuthorities: ["AUTOMATIC", "MANUAL_OPERATOR"] },
    { to: "ACTIVE", allowedAuthorities: ["MANUAL_OPERATOR"] },
    { to: "RETIRED", allowedAuthorities: ["PRINCIPAL_OR_ORG_ADMIN"] },
  ],
  SUSPENDED: [
    { to: "ACTIVE", allowedAuthorities: ["HUMAN_REVIEW"] },
    { to: "RETIRED", allowedAuthorities: ["PRINCIPAL_OR_ORG_ADMIN"] },
  ],
  RETIRED: [],
};

/**
 * Validates a proposed lifecycle transition. Throws
 * InvalidLifecycleTransition if the transition is not in the allowed
 * table, or if the given authority is not permitted to perform it.
 */
export function assertValidTransition(
  from: AgentLifecycleState,
  to: AgentLifecycleState,
  authority: TransitionAuthority,
): void {
  if (authority === "AUTOMATIC" && (to === "ACTIVE" && from === "SUSPENDED")) {
    // SPEC-002 SS6.6: SUSPENDED -> ACTIVE requires explicit human review;
    // never automatic. Rejected explicitly rather than falling through to
    // the generic "not in table" message, since this is a specifically
    // named restriction agents may attempt to bypass.
    throw new InvalidLifecycleTransition(from, to, "SUSPENDED -> ACTIVE requires HUMAN_REVIEW, never AUTOMATIC");
  }

  const rules = TRANSITIONS[from];
  const rule = rules.find((r) => r.to === to);
  if (!rule) {
    throw new InvalidLifecycleTransition(from, to, `no such transition is defined from ${from}`);
  }
  if (!rule.allowedAuthorities.includes(authority)) {
    throw new InvalidLifecycleTransition(
      from,
      to,
      `authority "${authority}" may not perform this transition (allowed: ${rule.allowedAuthorities.join(", ")})`,
    );
  }
}

export function canTransition(from: AgentLifecycleState, to: AgentLifecycleState, authority: TransitionAuthority): boolean {
  try {
    assertValidTransition(from, to, authority);
    return true;
  } catch {
    return false;
  }
}
