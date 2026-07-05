/**
 * Novelty Engine (SPEC-004).
 *
 * Measures distance from the agent's own demonstrated experience --
 * distinct from consequence and from uncertainty.
 *
 * Enforced invariants:
 *  - NOV-INV-002  agent-relative: history is the acting agent's history
 *  - NOV-INV-005  one nearby observation does not establish familiarity
 *  - NOV-INV-007  novel combinations of familiar values matter
 *  - NOV-INV-008  unknown values are never treated as familiar
 *  - NOV-INV-011  explicit historical reference window
 *  - NOV-INV-012  explainable: every component carries its reason
 *  - NOV-INV-013  no future data leakage
 */

import type { CanonicalAction } from "@aegis/contracts";
import type { AutonomyLevel } from "./levels.js";

export const NOVELTY_ALGORITHM_VERSION = "novelty-v1";

/** Historical action summary the engine compares against. */
export interface HistoricalActionRecord {
  agentId: string;
  actionRegion: string;
  contextValues: Record<string, string | number | boolean | null>;
  monetaryMinor: number | null;
  occurredAt: string;
}

export interface NoveltyComponent {
  name: string;
  score: number; // 0 familiar .. 1 maximally novel
  reason: string;
}

export interface NoveltyAssessment {
  algorithmVersion: string;
  noveltyScore: number; // max of components: local novelty survives volume (NOV-INV-006)
  components: NoveltyComponent[];
  referenceWindowDays: number;
  ceiling: AutonomyLevel;
}

export interface NoveltyConfig {
  referenceWindowDays: number;
  /** Observations needed in-region before region familiarity is earned (NOV-INV-005). */
  minRegionObservations: number;
}

export const DEFAULT_NOVELTY_CONFIG: NoveltyConfig = {
  referenceWindowDays: 180,
  minRegionObservations: 5,
};

export function actionRegionOf(action: CanonicalAction): string {
  return `${action.operation.domain}/${action.operation.actionType}`;
}

export function assessNovelty(
  action: CanonicalAction,
  history: readonly HistoricalActionRecord[],
  asOf: string,
  config: NoveltyConfig = DEFAULT_NOVELTY_CONFIG,
): NoveltyAssessment {
  const windowStartMs = Date.parse(asOf) - config.referenceWindowDays * 24 * 60 * 60 * 1000;
  const agentId = action.lineage.actor.agentId;
  const region = actionRegionOf(action);

  const inWindow = history.filter(
    (h) =>
      h.agentId === agentId && // NOV-INV-002
      Date.parse(h.occurredAt) >= windowStartMs &&
      h.occurredAt <= asOf, // NOV-INV-013
  );
  const inRegion = inWindow.filter((h) => h.actionRegion === region);

  const components: NoveltyComponent[] = [];

  // 1. Region familiarity: how often has this agent performed this
  //    action family at all? (NOV-INV-005: a single observation is not
  //    familiarity.)
  const regionScore = Math.max(0, 1 - inRegion.length / config.minRegionObservations);
  components.push({
    name: "region_familiarity",
    score: regionScore,
    reason: `${inRegion.length} prior action(s) in region "${region}" within ${config.referenceWindowDays}d (needs ${config.minRegionObservations} for full familiarity)`,
  });

  // 2. Magnitude familiarity: is the monetary magnitude inside the
  //    historically observed range? Outside-range = locally novel even
  //    with large volume (NOV-INV-006).
  const monetary = monetaryMinorOf(action);
  if (monetary !== null) {
    const observed = inRegion.map((h) => h.monetaryMinor).filter((v): v is number => v !== null);
    if (observed.length === 0) {
      components.push({ name: "magnitude_familiarity", score: 1, reason: "no historical monetary observations in region" });
    } else {
      const max = Math.max(...observed);
      const min = Math.min(...observed);
      const inside = monetary >= min && monetary <= max;
      const overshoot = monetary > max ? (monetary - max) / Math.max(max, 1) : 0;
      components.push({
        name: "magnitude_familiarity",
        score: inside ? 0 : Math.min(1, 0.5 + overshoot),
        reason: inside
          ? `amount ${monetary} inside observed range [${min}, ${max}]`
          : `amount ${monetary} outside observed range [${min}, ${max}]`,
      });
    }
  }

  // 3. Context-combination familiarity: has this exact combination of
  //    structured context values been seen together? (NOV-INV-007)
  //    Unknown (null) context values are never familiar (NOV-INV-008).
  const contextEntries = Object.entries(action.context.structured);
  const hasUnknown = contextEntries.some(([, v]) => v === null);
  if (hasUnknown) {
    components.push({ name: "context_combination", score: 1, reason: "one or more context values are unknown (NOV-INV-008)" });
  } else if (contextEntries.length > 0) {
    const combinationSeen = inRegion.some((h) =>
      contextEntries.every(([k, v]) => h.contextValues[k] === v),
    );
    components.push({
      name: "context_combination",
      score: combinationSeen ? 0 : 0.7,
      reason: combinationSeen ? "exact context combination previously observed" : "context combination never observed together (NOV-INV-007)",
    });
  }

  // Max, not average: local novelty is not washed out by familiar
  // components (NOV-INV-006).
  const noveltyScore = Math.max(...components.map((c) => c.score));

  return {
    algorithmVersion: NOVELTY_ALGORITHM_VERSION,
    noveltyScore,
    components,
    referenceWindowDays: config.referenceWindowDays,
    ceiling: noveltyCeiling(noveltyScore),
  };
}

function noveltyCeiling(score: number): AutonomyLevel {
  // Novel is not automatically dangerous (NOV-INV-003): high novelty
  // constrains autonomy, it does not block it outright.
  if (score >= 0.9) return 2;
  if (score >= 0.6) return 3;
  if (score >= 0.3) return 4;
  return 5;
}

function monetaryMinorOf(action: CanonicalAction): number | null {
  for (const effect of action.effects) {
    if (effect.magnitude?.type === "MONETARY") return effect.magnitude.amountMinor;
  }
  return null;
}
