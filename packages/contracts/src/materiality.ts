/**
 * Parameter materiality evaluation (SPEC-001 SS27).
 *
 * "A materially changed action invalidates the existing contract."
 * This module is the single place that decides whether a change between
 * two versions of the same logical action counts as material -- every
 * downstream specification that depends on CAM-INV-003 (grant scope
 * checks in SPEC-008, approval fingerprint binding in SPEC-011, etc.)
 * must agree on the same answer, so this logic must not be duplicated.
 */

import type { CanonicalParameter, ParameterMaterialityRule } from "./cam-types.js";

/**
 * Default materiality: a parameter with no explicit rule and
 * decisionRelevance CRITICAL or HIGH is treated as ALWAYS material;
 * MEDIUM/LOW/NONE default to NEVER. This mirrors the intent of SPEC-001
 * SS26-27 (decision relevance already signals how much a parameter
 * matters) when a schema hasn't defined an explicit rule yet.
 */
function defaultRuleFor(param: CanonicalParameter): ParameterMaterialityRule {
  const materiality: ParameterMaterialityRule["materiality"] =
    param.decisionRelevance === "CRITICAL" || param.decisionRelevance === "HIGH" ? "ALWAYS" : "NEVER";
  return { parameterName: param.name, materiality };
}

export function isParameterChangeMaterial(
  rule: ParameterMaterialityRule | undefined,
  oldValue: unknown,
  newValue: unknown,
): boolean {
  const materiality = rule?.materiality ?? "NEVER";

  switch (materiality) {
    case "NEVER":
      return false;
    case "ALWAYS":
      return !deepEqual(oldValue, newValue);
    case "SEMANTIC":
      // V1 has no semantic-equivalence model (CAM-INV-006 is a design-level
      // goal, not yet machine-checkable); treat any literal difference as
      // material until a semantic comparator is registered. This is the
      // safe-degradation direction: an unproven "these are equivalent"
      // claim must not suppress reassessment.
      return !deepEqual(oldValue, newValue);
    case "THRESHOLD": {
      if (typeof oldValue !== "number" || typeof newValue !== "number") {
        // Non-numeric values under a THRESHOLD rule can't be bucketed;
        // fall back to exact comparison rather than guessing.
        return !deepEqual(oldValue, newValue);
      }
      const threshold = rule?.threshold ?? 0;
      return Math.abs(newValue - oldValue) > threshold;
    }
    default:
      return !deepEqual(oldValue, newValue);
  }
}

/**
 * Determines whether moving from `oldParams` to `newParams` constitutes a
 * material mutation of the action (CAM-INV-003). Adding or removing a
 * decision-relevant parameter is always material; a parameter appearing
 * with the same value is never material regardless of its rule.
 */
export function isParameterSetChangeMaterial(
  oldParams: readonly CanonicalParameter[],
  newParams: readonly CanonicalParameter[],
): boolean {
  const oldByName = new Map(oldParams.map((p) => [p.name, p]));
  const newByName = new Map(newParams.map((p) => [p.name, p]));

  for (const [name, newParam] of newByName) {
    const oldParam = oldByName.get(name);
    if (!oldParam) {
      // A newly appearing decision-relevant parameter is material; a
      // newly appearing NONE-relevance parameter is not.
      if (newParam.decisionRelevance !== "NONE") return true;
      continue;
    }
    const rule = newParam.materialityRule ?? oldParam.materialityRule ?? defaultRuleFor(newParam);
    if (isParameterChangeMaterial(rule, oldParam.value, newParam.value)) return true;
  }

  for (const [name, oldParam] of oldByName) {
    if (!newByName.has(name) && oldParam.decisionRelevance !== "NONE") return true;
  }

  return false;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => deepEqual(v, b[i]));
    }
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj).sort();
    const bKeys = Object.keys(bObj).sort();
    if (aKeys.length !== bKeys.length || aKeys.some((k, i) => k !== bKeys[i])) return false;
    return aKeys.every((k) => deepEqual(aObj[k], bObj[k]));
  }
  return false;
}
