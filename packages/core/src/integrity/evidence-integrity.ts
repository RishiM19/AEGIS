/**
 * Anti-Gaming and Evidence Integrity (SPEC-016).
 *
 * Determines whether the evidence feeding competence estimation can be
 * trusted at face value, and hunts for patterns suggesting the
 * evidence trail is being shaped rather than earned.
 *
 * Enforced invariants:
 *  - GAME-INV-001  evidence is never deleted, only discounted via
 *                  integrity scores applied at consumption time
 *  - GAME-INV-002  no signal from a single action; aggregate patterns only
 *  - GAME-INV-004  low action diversity widens uncertainty (standing)
 *  - GAME-INV-005  raw success rate is prohibited as the primary signal;
 *                  difficulty exposure is examined jointly
 *  - GAME-INV-006  reproducible and explainable per signal
 *  - GAME-INV-007  a signal never changes lifecycle state by itself
 */

import type { Clock, IdSource } from "../kernel/clock.js";
import type { CompetenceEvidenceInput } from "../assessment/competence.js";

export const INTEGRITY_ALGORITHM_VERSION = "integrity-v1";

export type GamingSignalType = "COMPETENCE_FARMING" | "DIFFICULTY_AVOIDANCE";

export interface GamingSignal {
  gamingSignalId: string;
  signalType: GamingSignalType;
  agentVersionId: string;
  affectedRegion: string | null;
  supportingEvidenceItemIds: string[];
  explanation: string;
  detectedAt: string;
  detectionVersion: string;
}

export interface EvidenceIntegrityScore {
  evidenceItemId: string;
  /** Discount multiplier applied at consumption; never a deletion. */
  score: number;
  rationale: string;
}

export interface IntegrityConfig {
  /** Minimum evidence volume before any signal may fire (GAME-INV-002). */
  minEvidenceForDetection: number;
  /** Region concentration above this fraction suggests farming. */
  farmingConcentrationThreshold: number;
  /** Declared capability regions with zero evidence, above this fraction, suggest avoidance. */
  avoidanceThreshold: number;
  /** Discount applied to items supporting a fired signal. */
  signalDiscount: number;
}

export const DEFAULT_INTEGRITY_CONFIG: IntegrityConfig = {
  minEvidenceForDetection: 10,
  farmingConcentrationThreshold: 0.9,
  avoidanceThreshold: 0.5,
  signalDiscount: 0.5,
};

export class EvidenceIntegrityEngine {
  constructor(
    private readonly clock: Clock,
    private readonly ids: IdSource,
    private readonly config: IntegrityConfig = DEFAULT_INTEGRITY_CONFIG,
  ) {}

  /**
   * One detection run over an agent version's accumulated evidence.
   * Deterministic given the same evidence set and config
   * (GAME-INV-006). Never mutates the evidence (GAME-INV-001).
   */
  detect(
    agentVersionId: string,
    declaredCapabilityRegions: string[],
    evidence: readonly CompetenceEvidenceInput[],
  ): { signals: GamingSignal[]; integrityScores: EvidenceIntegrityScore[] } {
    const own = evidence.filter((e) => e.agentVersionId === agentVersionId && !e.fromSimulation);
    const signals: GamingSignal[] = [];
    const integrityScores: EvidenceIntegrityScore[] = [];

    // GAME-INV-002: below the aggregate floor, nothing fires -- one
    // unlucky or unusual action can never trigger a signal.
    if (own.length < this.config.minEvidenceForDetection) {
      return { signals, integrityScores };
    }

    // COMPETENCE_FARMING: a statistically extreme concentration of
    // evidence in one region, given a broader declared capability set.
    const byRegion = new Map<string, CompetenceEvidenceInput[]>();
    for (const item of own) {
      const list = byRegion.get(item.actionRegion) ?? [];
      list.push(item);
      byRegion.set(item.actionRegion, list);
    }
    for (const [region, items] of byRegion) {
      const concentration = items.length / own.length;
      if (concentration >= this.config.farmingConcentrationThreshold && declaredCapabilityRegions.length > 1) {
        const signal: GamingSignal = {
          gamingSignalId: this.ids.next("game"),
          signalType: "COMPETENCE_FARMING",
          agentVersionId,
          affectedRegion: region,
          supportingEvidenceItemIds: items.map((i) => i.evidenceItemId),
          explanation: `${(concentration * 100).toFixed(0)}% of ${own.length} evidence items sit in one region ("${region}") while ${declaredCapabilityRegions.length} capability regions are declared`,
          detectedAt: this.clock.now(),
          detectionVersion: INTEGRITY_ALGORITHM_VERSION,
        };
        signals.push(signal);
        for (const item of items) {
          integrityScores.push({
            evidenceItemId: item.evidenceItemId,
            score: this.config.signalDiscount,
            rationale: `discounted by ${signal.gamingSignalId} (${signal.signalType})`,
          });
        }
      }
    }

    // DIFFICULTY_AVOIDANCE: declared capability regions with no
    // evidence at all, in aggregate, relative to declared breadth.
    const coveredRegions = new Set(own.map((e) => e.actionRegion));
    const avoided = declaredCapabilityRegions.filter((r) => !coveredRegions.has(r));
    if (declaredCapabilityRegions.length > 1 && avoided.length / declaredCapabilityRegions.length >= this.config.avoidanceThreshold) {
      signals.push({
        gamingSignalId: this.ids.next("game"),
        signalType: "DIFFICULTY_AVOIDANCE",
        agentVersionId,
        affectedRegion: null,
        supportingEvidenceItemIds: own.map((i) => i.evidenceItemId),
        explanation: `${avoided.length} of ${declaredCapabilityRegions.length} declared capability regions have zero demonstrated evidence: [${avoided.join(", ")}]`,
        detectedAt: this.clock.now(),
        detectionVersion: INTEGRITY_ALGORITHM_VERSION,
      });
      // Avoidance discounts nothing directly (the existing evidence is
      // genuine); it informs assessment breadth. GAME-INV-007: no
      // lifecycle change here either -- surfacing only.
    }

    return { signals, integrityScores };
  }

  /**
   * Standing consumption-time discount (GAME-INV-001): applies computed
   * integrity scores onto a copy of the evidence set for the Competence
   * Engine. Originals are untouched.
   */
  applyDiscounts(
    evidence: readonly CompetenceEvidenceInput[],
    scores: readonly EvidenceIntegrityScore[],
  ): CompetenceEvidenceInput[] {
    const byId = new Map(scores.map((s) => [s.evidenceItemId, s.score]));
    return evidence.map((item) => {
      const discount = byId.get(item.evidenceItemId);
      return discount === undefined ? { ...item } : { ...item, integrityScore: item.integrityScore * discount };
    });
  }
}
