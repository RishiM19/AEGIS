/**
 * Multi-Agent Delegation and Causal Responsibility (SPEC-015).
 *
 * Preserves the full chain from originating principal to immediate
 * actor, and computes the chain-aware autonomy ceiling: the final
 * executing agent's competence never erases a weak upstream hop.
 *
 * Enforced invariants:
 *  - DEL-INV-001  authority cannot widen across a hop
 *  - DEL-INV-002  the originating principal is fixed at hop zero
 *  - DEL-INV-004/SS6  L_chain = min over hops (strict minimum)
 *  - DEL-INV-005  responsibility may resolve to a specific hop
 *  - DEL-INV-006  chains are immutable once sealed
 */

import type { IdSource } from "../kernel/clock.js";
import type { AutonomyLevel } from "../assessment/levels.js";
import { minLevel } from "../assessment/levels.js";

export interface DelegatedScope {
  capability: string;
  maxAmountMinor: number | null;
  environmentTypes: string[];
}

export interface DelegationHop {
  hopIndex: number;
  fromId: string; // principal at hop 0, agent otherwise
  toAgentId: string;
  agentVersionIdAtHop: string;
  delegatedScope: DelegatedScope;
  /** Independently assessed ceiling for this hop's agent (SPEC-003..006). */
  hopCeiling: AutonomyLevel;
}

export interface CausalResponsibilityRecord {
  causalResponsibilityId: string;
  delegationChainId: string;
  outcomeSubjectId: string;
  responsibleHopIndexes: number[];
}

export class AuthorityWideningRejected extends Error {
  constructor(hopIndex: number, detail: string) {
    super(`hop ${hopIndex} attempts to widen delegated authority: ${detail} (DEL-INV-001)`);
    this.name = "AuthorityWideningRejected";
  }
}

export class DelegationChain {
  readonly delegationChainId: string;
  readonly originatingPrincipalId: string;
  private hops: DelegationHop[] = [];
  private sealed = false;

  constructor(ids: IdSource, originatingPrincipalId: string) {
    this.delegationChainId = ids.next("chain");
    this.originatingPrincipalId = originatingPrincipalId;
  }

  /**
   * Appends a hop, rejecting any scope wider than the previous hop's
   * (DEL-INV-001) -- rejected, never silently clamped, because a
   * widening attempt is itself a security-relevant event.
   */
  addHop(hop: Omit<DelegationHop, "hopIndex">): DelegationHop {
    if (this.sealed) throw new Error("chain is sealed; a changed chain requires a new action version (DEL-INV-006)");
    const prev = this.hops[this.hops.length - 1];
    if (prev) {
      const prevScope = prev.delegatedScope;
      const next = hop.delegatedScope;
      if (next.capability !== prevScope.capability) {
        throw new AuthorityWideningRejected(this.hops.length, `capability "${next.capability}" differs from delegated "${prevScope.capability}"`);
      }
      if (prevScope.maxAmountMinor !== null && (next.maxAmountMinor === null || next.maxAmountMinor > prevScope.maxAmountMinor)) {
        throw new AuthorityWideningRejected(this.hops.length, `amount cap ${next.maxAmountMinor ?? "unbounded"} exceeds ${prevScope.maxAmountMinor}`);
      }
      const widenedEnv = next.environmentTypes.filter((e) => !prevScope.environmentTypes.includes(e));
      if (widenedEnv.length > 0) {
        throw new AuthorityWideningRejected(this.hops.length, `environments [${widenedEnv.join(", ")}] not present upstream`);
      }
    }
    const complete: DelegationHop = { ...hop, hopIndex: this.hops.length };
    this.hops.push(complete);
    return complete;
  }

  seal(): void {
    this.sealed = true;
  }

  allHops(): readonly DelegationHop[] {
    return this.hops;
  }

  immediateActorAgentId(): string {
    const last = this.hops[this.hops.length - 1];
    if (!last) throw new Error("chain has no hops");
    return last.toAgentId;
  }

  /**
   * L_chain: the strict minimum across every hop's independently
   * assessed ceiling (SS6). A strong final hop cannot average away a
   * weak coordinator (DEL-INV-004, AUT-INV-013).
   */
  chainCeiling(): AutonomyLevel {
    if (this.hops.length === 0) return 0;
    return this.hops.reduce<AutonomyLevel>((acc, hop) => minLevel(acc, hop.hopCeiling), 5);
  }
}

/** Attribution across a chain may resolve to specific hops (DEL-INV-005). */
export function attributeToHops(
  ids: IdSource,
  chain: DelegationChain,
  outcomeSubjectId: string,
  faultyHopIndexes: number[],
): CausalResponsibilityRecord {
  const valid = faultyHopIndexes.every((i) => i >= 0 && i < chain.allHops().length);
  if (!valid) throw new Error("responsible hop index out of range");
  return {
    causalResponsibilityId: ids.next("causal"),
    delegationChainId: chain.delegationChainId,
    outcomeSubjectId,
    responsibleHopIndexes: [...faultyHopIndexes].sort((a, b) => a - b),
  };
}
