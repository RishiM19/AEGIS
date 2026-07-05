/**
 * Autonomy levels (SPEC-000 SS22, SPEC-007 SS15-21).
 *
 * L0 DENY .. L5 AUTONOMOUS. Levels are execution semantics, not labels.
 * Assessment engines each produce a ceiling: the maximum level that
 * engine's evidence can justify. The decision engine takes the strict
 * minimum (SPEC-000 SS23).
 */

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const LEVEL_NAMES: Record<AutonomyLevel, string> = {
  0: "L0_BLOCKED",
  1: "L1_HUMAN_EXECUTION_ONLY",
  2: "L2_HUMAN_APPROVAL_REQUIRED",
  3: "L3_CONSTRAINED_AUTONOMY",
  4: "L4_MONITORED_AUTONOMY",
  5: "L5_FULL_AUTONOMY",
};

export function minLevel(...levels: AutonomyLevel[]): AutonomyLevel {
  return Math.min(...levels) as AutonomyLevel;
}
