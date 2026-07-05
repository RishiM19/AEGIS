/**
 * Epistemic (Uncertainty) Engine (SPEC-005).
 *
 * How uncertain is the system about the basis for this decision --
 * independent of anyone's self-reported confidence.
 *
 * Enforced invariants:
 *  - EPI-INV-001/002  unknown is not false; missing is not negative
 *  - EPI-INV-003      repetition is not independence (unique sources)
 *  - EPI-INV-004      model confidence is not ground truth
 *  - EPI-INV-008      contradiction stays visible, never averaged away
 *  - EPI-INV-010      critical missingness is explicit
 *  - EPI-INV-014      reproducible
 */

import type { CanonicalAction } from "@aegis/contracts";
import type { AutonomyLevel } from "./levels.js";

export const EPISTEMIC_ALGORITHM_VERSION = "epistemic-v1";

export type UncertaintyLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL_UNKNOWN";

export interface EpistemicFinding {
  kind:
    | "UNSUPPORTED_CRITICAL_CLAIM"
    | "CONTRADICTED_FIELD"
    | "STALE_EVIDENCE"
    | "EXPIRED_EVIDENCE"
    | "LOW_SOURCE_DIVERSITY"
    | "UNVALIDATED_AI_INFERENCE";
  detail: string;
}

export interface EpistemicAssessment {
  algorithmVersion: string;
  uncertaintyLevel: UncertaintyLevel;
  findings: EpistemicFinding[];
  independentSourceCount: number;
  ceiling: AutonomyLevel;
}

export function assessEpistemic(action: CanonicalAction): EpistemicAssessment {
  const findings: EpistemicFinding[] = [];

  // Critical claims must be supported by at least one evidence
  // reference (EPI-INV-010). A claim with zero refs is explicit
  // missingness, not silently fine.
  for (const claim of action.claims ?? []) {
    if (claim.importance === "CRITICAL" && claim.evidenceRefs.length === 0) {
      findings.push({
        kind: "UNSUPPORTED_CRITICAL_CLAIM",
        detail: `critical claim "${claim.statement}" has no supporting evidence`,
      });
    }
  }

  // Contradicted provenance stays visible (EPI-INV-008).
  for (const [path, prov] of Object.entries(action.provenance)) {
    if (prov.validationStatus === "CONTRADICTED") {
      findings.push({ kind: "CONTRADICTED_FIELD", detail: `field "${path}" has contradicted provenance` });
    }
    // A confident-but-unvalidated AI inference on a decision-relevant
    // field is a finding regardless of its confidence value
    // (EPI-INV-004: confidence is not ground truth).
    if (prov.origin === "AI_INFERENCE" && prov.validationStatus === "UNVALIDATED") {
      findings.push({ kind: "UNVALIDATED_AI_INFERENCE", detail: `field "${path}" is an unvalidated AI inference` });
    }
  }

  // Evidence freshness (EPI-INV-007).
  for (const ev of action.evidence) {
    if (ev.freshnessStatus === "STALE") findings.push({ kind: "STALE_EVIDENCE", detail: `evidence ${ev.evidenceId} is stale` });
    if (ev.freshnessStatus === "EXPIRED") findings.push({ kind: "EXPIRED_EVIDENCE", detail: `evidence ${ev.evidenceId} is expired` });
  }

  // Source diversity: distinct sourceIds, because volume from one
  // source is repetition, not independence (EPI-INV-003/009).
  const independentSourceCount = new Set(action.evidence.map((e) => e.sourceId)).size;
  if (action.evidence.length > 0 && independentSourceCount === 1) {
    findings.push({ kind: "LOW_SOURCE_DIVERSITY", detail: "all evidence originates from a single source" });
  }

  const uncertaintyLevel = classify(findings, action);

  return {
    algorithmVersion: EPISTEMIC_ALGORITHM_VERSION,
    uncertaintyLevel,
    findings,
    independentSourceCount,
    ceiling: epistemicCeiling(uncertaintyLevel),
  };
}

function classify(findings: EpistemicFinding[], action: CanonicalAction): UncertaintyLevel {
  const hasCriticalGap = findings.some((f) => f.kind === "UNSUPPORTED_CRITICAL_CLAIM" || f.kind === "CONTRADICTED_FIELD");
  const criticalClaims = (action.claims ?? []).filter((c) => c.importance === "CRITICAL");
  // An action asserting critical claims with no evidence at all is in a
  // critically unknown state, distinct from merely-high uncertainty.
  if (criticalClaims.length > 0 && action.evidence.length === 0) return "CRITICAL_UNKNOWN";
  if (hasCriticalGap) return "HIGH";
  if (findings.length >= 2) return "HIGH";
  if (findings.length === 1) return "MODERATE";
  return "LOW";
}

function epistemicCeiling(level: UncertaintyLevel): AutonomyLevel {
  switch (level) {
    case "LOW":
      return 5;
    case "MODERATE":
      return 4;
    case "HIGH":
      return 2;
    case "CRITICAL_UNKNOWN":
      return 1;
  }
}
