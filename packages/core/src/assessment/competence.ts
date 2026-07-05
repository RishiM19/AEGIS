/**
 * Competence Topology Engine (SPEC-003).
 *
 * Estimates evidence-backed competence per action region -- never a
 * universal trust score (SPEC-000 INV-012, COMP-INV-001/002).
 *
 * Enforced invariants:
 *  - COMP-INV-003  version-sensitive: only same-agent-version evidence
 *                  counts (transfer policy NONE is the default upstream)
 *  - COMP-INV-004  competence requires outcomes; no evidence -> UNKNOWN
 *  - COMP-INV-005  unknown outcome contributes nothing
 *  - COMP-INV-008  sparse regions stay uncertain (interval widens)
 *  - COMP-INV-009  recent degradation detectable (recency weighting)
 *  - COMP-INV-010  simulation evidence is excluded
 *  - COMP-INV-013  reproducible from frozen evidence + version
 */

import type { AutonomyLevel } from "./levels.js";

export const COMPETENCE_ALGORITHM_VERSION = "competence-v1";

/** The evidence shape written by the Learning Plane (SPEC-013). */
export interface CompetenceEvidenceInput {
  evidenceItemId: string;
  agentVersionId: string;
  actionRegion: string; // e.g. "finance.refunds.customer/ISSUE_CUSTOMER_REFUND"
  /** 0..1 success contribution after attribution weighting (SPEC-013). */
  outcomeScore: number;
  /** 0..1 attribution weight -- human rescue / interventions reduce this. */
  evidenceWeight: number;
  fromSimulation: boolean;
  /** 0..1 integrity discount from SPEC-016; 1 = fully trusted. */
  integrityScore: number;
  recordedAt: string;
}

export interface CompetenceAssessment {
  algorithmVersion: string;
  actionRegion: string;
  agentVersionId: string;
  status: "ESTIMATED" | "UNKNOWN_NO_EVIDENCE";
  estimate: number; // 0..1 smoothed mean
  intervalWidth: number; // wider = less certain
  effectiveSampleSize: number;
  ceiling: AutonomyLevel;
}

export interface CompetenceConfig {
  /** Evidence older than this many days is down-weighted by half. */
  recencyHalfLifeDays: number;
  /** Effective sample size required before the interval narrows meaningfully. */
  minSamplesForNarrowInterval: number;
}

export const DEFAULT_COMPETENCE_CONFIG: CompetenceConfig = {
  recencyHalfLifeDays: 90,
  minSamplesForNarrowInterval: 10,
};

export function assessCompetence(
  agentVersionId: string,
  actionRegion: string,
  evidence: readonly CompetenceEvidenceInput[],
  asOf: string,
  config: CompetenceConfig = DEFAULT_COMPETENCE_CONFIG,
): CompetenceAssessment {
  const relevant = evidence.filter(
    (e) =>
      e.agentVersionId === agentVersionId && // COMP-INV-003
      e.actionRegion === actionRegion && // COMP-INV-001
      !e.fromSimulation && // COMP-INV-010
      e.recordedAt <= asOf, // no future evidence leakage
  );

  if (relevant.length === 0) {
    // COMP-INV-004: no outcomes means UNKNOWN, and unknown is not
    // treated as either competent or incompetent -- the ceiling is the
    // most restrictive non-blocking level, leaving room for supervised
    // evidence accumulation (L2) rather than a permanent block.
    return {
      algorithmVersion: COMPETENCE_ALGORITHM_VERSION,
      actionRegion,
      agentVersionId,
      status: "UNKNOWN_NO_EVIDENCE",
      estimate: 0.5,
      intervalWidth: 1,
      effectiveSampleSize: 0,
      ceiling: 2,
    };
  }

  const asOfMs = Date.parse(asOf);
  const halfLifeMs = config.recencyHalfLifeDays * 24 * 60 * 60 * 1000;

  let weightedSuccess = 0;
  let totalWeight = 0;
  for (const e of relevant) {
    const ageMs = Math.max(0, asOfMs - Date.parse(e.recordedAt));
    const recency = Math.pow(0.5, ageMs / halfLifeMs); // COMP-INV-009
    const w = e.evidenceWeight * e.integrityScore * recency;
    weightedSuccess += e.outcomeScore * w;
    totalWeight += w;
  }

  // Laplace smoothing: sparse evidence pulls toward 0.5 with a wide
  // interval instead of overcommitting (COMP-INV-008).
  const estimate = (weightedSuccess + 1) / (totalWeight + 2);
  const intervalWidth = 1 / Math.sqrt(totalWeight + 2);

  const ceiling = competenceCeiling(estimate, intervalWidth, totalWeight, config);

  return {
    algorithmVersion: COMPETENCE_ALGORITHM_VERSION,
    actionRegion,
    agentVersionId,
    status: "ESTIMATED",
    estimate,
    intervalWidth,
    effectiveSampleSize: totalWeight,
    ceiling,
  };
}

function competenceCeiling(
  estimate: number,
  intervalWidth: number,
  effectiveSampleSize: number,
  config: CompetenceConfig,
): AutonomyLevel {
  // The pessimistic (lower-bound) view drives the ceiling: high mean
  // with huge uncertainty must not unlock high autonomy (COMP-INV-008).
  const lowerBound = Math.max(0, estimate - intervalWidth);
  if (effectiveSampleSize < config.minSamplesForNarrowInterval / 2) {
    return lowerBound >= 0.6 ? 3 : 2;
  }
  if (lowerBound >= 0.8) return 5;
  if (lowerBound >= 0.65) return 4;
  if (lowerBound >= 0.5) return 3;
  if (lowerBound >= 0.3) return 2;
  return 1;
}
