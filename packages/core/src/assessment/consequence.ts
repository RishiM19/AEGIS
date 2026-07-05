/**
 * Consequence (Risk) Engine (SPEC-006).
 *
 * How dangerous is this action, and how completely can it be undone --
 * independent of anyone's confidence that it will go well (CON-INV-001).
 *
 * Enforced invariants:
 *  - CON-INV-002/003  reversible is not harmless; rollback is not recovery
 *  - CON-INV-004      external disclosure is never fully reversible
 *  - CON-INV-005/006  blast radius explicit; potential scope matters
 *                     (unbounded targets assessed at potential scope)
 *  - CON-INV-012      context-specific (environment raises severity)
 *  - CON-INV-013      unknown consequence is not low consequence
 *  - CON-INV-014      reproducible
 */

import type { CanonicalAction, ProposedEffect } from "@aegis/contracts";
import type { AutonomyLevel } from "./levels.js";

export const CONSEQUENCE_ALGORITHM_VERSION = "consequence-v1";

export type SeverityTier = "MINIMAL" | "LOW" | "MODERATE" | "HIGH" | "SEVERE" | "UNKNOWN";

/** The reversibility spectrum SPEC-010's Recovery Engine consumes (SPEC-010 SS5). */
export type ReversibilityClass =
  | "FULLY_REVERSIBLE"
  | "OPERATIONALLY_REVERSIBLE"
  | "COMPENSATABLE"
  | "PARTIALLY_REVERSIBLE"
  | "PRACTICALLY_IRREVERSIBLE"
  | "FUNDAMENTALLY_IRREVERSIBLE"
  | "UNKNOWN";

export interface ConsequenceAssessment {
  algorithmVersion: string;
  severity: SeverityTier;
  reversibility: ReversibilityClass;
  monetaryExposureMinor: number;
  unboundedTargets: boolean;
  reasons: string[];
  ceiling: AutonomyLevel;
}

export interface ConsequenceConfig {
  /** Minor-unit thresholds for monetary severity tiers. */
  moderateMinor: number;
  highMinor: number;
  severeMinor: number;
}

export const DEFAULT_CONSEQUENCE_CONFIG: ConsequenceConfig = {
  moderateMinor: 500000, // 5,000.00
  highMinor: 2500000, // 25,000.00
  severeMinor: 10000000, // 100,000.00
};

export function assessConsequence(
  action: CanonicalAction,
  config: ConsequenceConfig = DEFAULT_CONSEQUENCE_CONFIG,
): ConsequenceAssessment {
  const reasons: string[] = [];

  const monetaryExposureMinor = action.effects.reduce(
    (sum, e) => sum + (e.magnitude?.type === "MONETARY" ? e.magnitude.amountMinor : 0),
    0,
  );

  // Blast radius: unbounded target selectors are assessed at potential
  // scope, not the optimistic known count (CON-INV-005/006).
  const unboundedTargets = action.targets.some((t) => !t.scope.bounded);
  if (unboundedTargets) reasons.push("at least one target scope is unbounded; assessed at potential scope");

  const reversibility = classifyReversibility(action, reasons);
  let severity = monetarySeverity(monetaryExposureMinor, config, reasons);

  // Effects declared UNKNOWN certainty from an unknown-side-effect tool
  // must not read as low consequence (CON-INV-013).
  const hasUnknownEffects = action.effects.some((e) => e.certainty === "UNKNOWN");
  if (action.effects.length === 0 || hasUnknownEffects) {
    severity = "UNKNOWN";
    reasons.push("effects are missing or of unknown certainty; unknown consequence is not low consequence (CON-INV-013)");
  }

  if (unboundedTargets && severity !== "UNKNOWN") {
    severity = raise(severity, "SEVERE");
  }

  // Context-specific: production raises stakes relative to sandbox
  // (CON-INV-012).
  if (action.context.environment.environmentType !== "PRODUCTION" && severity !== "UNKNOWN") {
    severity = lower(severity);
    reasons.push(`non-production environment (${action.context.environment.environmentType}) lowers severity one tier`);
  }

  return {
    algorithmVersion: CONSEQUENCE_ALGORITHM_VERSION,
    severity,
    reversibility,
    monetaryExposureMinor,
    unboundedTargets,
    reasons,
    ceiling: consequenceCeiling(severity, reversibility),
  };
}

function classifyReversibility(action: CanonicalAction, reasons: string[]): ReversibilityClass {
  const effects = action.effects;
  if (effects.length === 0) {
    reasons.push("no declared effects; reversibility unknown");
    return "UNKNOWN";
  }

  // External disclosure can never be fully undone (CON-INV-004),
  // regardless of what the tool's compensation metadata claims.
  const disclosure = effects.some(
    (e: ProposedEffect) => e.effectType === "DATA_DISCLOSURE" || (e.effectType === "COMMUNICATION" && e.direction === "OUTBOUND"),
  );
  if (disclosure) {
    reasons.push("outbound disclosure/communication effect: fundamentally irreversible (CON-INV-004)");
    return "FUNDAMENTALLY_IRREVERSIBLE";
  }

  switch (action.execution.compensationSupport) {
    case "FULL":
      // Compensation exists for every declared effect: compensatable,
      // which is still not the same as harmless (CON-INV-002).
      reasons.push("full compensation support declared by effector");
      return "COMPENSATABLE";
    case "PARTIAL":
      reasons.push("partial compensation support: some effects will remain");
      return "PARTIALLY_REVERSIBLE";
    case "NONE":
      reasons.push("no compensation path exists");
      return "PRACTICALLY_IRREVERSIBLE";
    case "UNKNOWN":
      // Unknown reversibility degrades safely toward the conservative
      // classification (SPEC-010 SS11 failure behavior).
      reasons.push("compensation support unknown: treated as practically irreversible until proven otherwise");
      return "PRACTICALLY_IRREVERSIBLE";
  }
}

const TIERS: SeverityTier[] = ["MINIMAL", "LOW", "MODERATE", "HIGH", "SEVERE"];

function monetarySeverity(minor: number, config: ConsequenceConfig, reasons: string[]): SeverityTier {
  let tier: SeverityTier;
  if (minor >= config.severeMinor) tier = "SEVERE";
  else if (minor >= config.highMinor) tier = "HIGH";
  else if (minor >= config.moderateMinor) tier = "MODERATE";
  else if (minor > 0) tier = "LOW";
  else tier = "MINIMAL";
  if (minor > 0) reasons.push(`monetary exposure ${minor} minor units -> ${tier}`);
  return tier;
}

function raise(tier: SeverityTier, to: SeverityTier): SeverityTier {
  return TIERS.indexOf(to) > TIERS.indexOf(tier) ? to : tier;
}

function lower(tier: SeverityTier): SeverityTier {
  const idx = TIERS.indexOf(tier);
  return TIERS[Math.max(0, idx - 1)] ?? tier;
}

function consequenceCeiling(severity: SeverityTier, reversibility: ReversibilityClass): AutonomyLevel {
  // Unknown consequence caps hard (CON-INV-013).
  if (severity === "UNKNOWN") return 1;

  let ceiling: AutonomyLevel;
  switch (severity) {
    case "MINIMAL":
      ceiling = 5;
      break;
    case "LOW":
      ceiling = 5;
      break;
    case "MODERATE":
      ceiling = 4;
      break;
    case "HIGH":
      ceiling = 3;
      break;
    case "SEVERE":
      ceiling = 2;
      break;
  }

  // Irreversibility is a hard limiting factor high competence cannot
  // cancel (SPEC-000 SS23): fundamentally irreversible actions never
  // exceed L2; practically irreversible never exceed L3.
  if (reversibility === "FUNDAMENTALLY_IRREVERSIBLE") return Math.min(ceiling, 2) as AutonomyLevel;
  if (reversibility === "PRACTICALLY_IRREVERSIBLE" || reversibility === "UNKNOWN") return Math.min(ceiling, 3) as AutonomyLevel;
  return ceiling;
}
