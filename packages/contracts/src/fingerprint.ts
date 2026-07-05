/**
 * Canonical and material fingerprinting (SPEC-001 SS56-58).
 *
 * canonicalFingerprint hashes the complete normalized representation.
 * materialFingerprint hashes only the fields that affect authority,
 * assessment, and execution semantics -- this is what SPEC-008's grant
 * scope checks and SPEC-011's approval binding actually compare against,
 * since a non-material metadata change (e.g. a UI display label) must not
 * invalidate an existing Autonomy Grant or Approval Decision.
 */

import { canonicalHash } from "./canonicalize.js";
import type { CanonicalParameter, EffectMagnitude, UnfingerprintedCanonicalAction } from "./cam-types.js";

function magnitudeUnit(magnitude: EffectMagnitude | undefined): string | null {
  if (!magnitude) return null;
  switch (magnitude.type) {
    case "MONETARY":
      return magnitude.currency;
    case "DATA_VOLUME":
    case "DURATION":
    case "RESOURCE":
      return magnitude.unit;
    case "ENTITY_COUNT":
      return null;
  }
}

export function computeRawProposalHash(rawProposal: unknown): string {
  return canonicalHash(rawProposal);
}

/**
 * Hashes the complete normalized action (minus the fingerprint fields
 * themselves, which don't exist yet at computation time).
 */
export function computeCanonicalFingerprint(action: UnfingerprintedCanonicalAction): string {
  return canonicalHash(action);
}

/**
 * Hashes only the material projection: operation semantics, materially
 * relevant parameters, targets, effects, and execution semantics.
 * Non-material fields (purpose.rationale, metadata, non-critical
 * parameters) are intentionally excluded so that changing them does not
 * change this hash.
 */
export function computeMaterialFingerprint(action: UnfingerprintedCanonicalAction): string {
  const materialParams = materialParameterProjection(action.operation.parameters);

  const projection = {
    domain: action.operation.domain,
    capability: action.operation.capability,
    actionType: action.operation.actionType,
    operationClass: action.operation.operationClass,
    tool: {
      toolId: action.operation.tool.toolId,
      adapterId: action.operation.tool.adapterId,
    },
    parameters: materialParams,
    targets: action.targets.map((t) => ({
      targetType: t.targetType,
      role: t.role,
      scope: t.scope,
      // attributes are descriptive metadata, not material by default;
      // a schema that needs a specific attribute to be material should
      // promote it to a CanonicalParameter instead.
    })),
    // Effects capture qualitative real-world consequence type/direction,
    // not exact magnitude -- exact numeric magnitude is already governed
    // by the corresponding CanonicalParameter's materiality rule (e.g. a
    // refund's amount), which applies threshold bucketing. Duplicating
    // the raw magnitude here would bypass that bucketing and make the
    // material fingerprint change on immaterial drift.
    effects: action.effects.map((e) => ({
      effectType: e.effectType,
      direction: e.direction ?? null,
      magnitudeType: e.magnitude?.type ?? null,
      magnitudeUnit: magnitudeUnit(e.magnitude),
    })),
    execution: {
      executionType: action.execution.executionType,
      effectorId: action.execution.effectorId,
    },
  };

  return canonicalHash(projection);
}

/**
 * Projects each parameter to a materially comparable value: THRESHOLD
 * parameters are bucketed by their tolerance so that within-tolerance
 * changes hash identically (a THRESHOLD rule exists precisely so that
 * small, immaterial numeric drift doesn't force reassessment); NEVER
 * parameters are dropped entirely.
 */
function materialParameterProjection(
  parameters: readonly CanonicalParameter[],
): Array<{ name: string; value: unknown }> {
  return parameters
    .filter((p) => (p.materialityRule?.materiality ?? defaultMateriality(p)) !== "NEVER")
    .map((p) => {
      const rule = p.materialityRule;
      if (rule?.materiality === "THRESHOLD" && typeof p.value === "number") {
        const threshold = rule.threshold ?? 0;
        const bucket = threshold > 0 ? Math.floor(p.value / threshold) : p.value;
        return { name: p.name, value: bucket };
      }
      return { name: p.name, value: p.value };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function defaultMateriality(param: CanonicalParameter): "ALWAYS" | "NEVER" {
  return param.decisionRelevance === "CRITICAL" || param.decisionRelevance === "HIGH" ? "ALWAYS" : "NEVER";
}
