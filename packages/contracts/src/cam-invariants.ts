/**
 * Machine-checkable CAM invariants (SPEC-001 SS4, AEGIS-ARCHITECTURE-DECISIONS.md SS3).
 *
 * Not every CAM-INV is machine-checkable in V1 (CAM-INV-006, semantic
 * equivalence, and CAM-INV-010, which is a usage discipline rather than a
 * structural property, are noted but not enforced here). This module
 * enforces the ones that can be verified purely from the action's own
 * structure.
 */

import type { CanonicalAction } from "./cam-types.js";

export class CamInvariantViolation extends Error {
  constructor(
    public readonly invariant: string,
    message: string,
  ) {
    super(`[${invariant}] ${message}`);
    this.name = "CamInvariantViolation";
  }
}

/**
 * Validates the invariants that can be checked from a single, already
 * -constructed CanonicalAction. Throws CamInvariantViolation on the first
 * violation found.
 */
export function validateCanonicalAction(action: CanonicalAction): void {
  checkRawInputPreserved(action);
  checkDecisionRelevantFieldsHaveProvenance(action);
  checkNoUndefinedCriticalValues(action);
  checkVersioningPresent(action);
}

/** CAM-INV-002 -- Raw Input Is Never Destroyed. */
function checkRawInputPreserved(action: CanonicalAction): void {
  if (!action.integrity.rawProposalHash) {
    throw new CamInvariantViolation(
      "CAM-INV-002",
      "rawProposalHash is missing; the original proposal payload must always be hashed and traceable",
    );
  }
}

/** CAM-INV-004 -- Provenance Must Be Preserved Per Field. */
function checkDecisionRelevantFieldsHaveProvenance(action: CanonicalAction): void {
  for (const param of action.operation.parameters) {
    if (param.decisionRelevance === "NONE") continue;
    const fieldPath = `operation.parameters.${param.name}`;
    if (!action.provenance[fieldPath]) {
      throw new CamInvariantViolation(
        "CAM-INV-004",
        `decision-relevant parameter "${param.name}" (relevance=${param.decisionRelevance}) has no provenance entry at "${fieldPath}"`,
      );
    }
  }
}

/** CAM-INV-005 -- Unknown Is Not Zero. */
function checkNoUndefinedCriticalValues(action: CanonicalAction): void {
  for (const param of action.operation.parameters) {
    if (param.decisionRelevance === "CRITICAL" && param.value === undefined) {
      throw new CamInvariantViolation(
        "CAM-INV-005",
        `critical parameter "${param.name}" has value=undefined; an explicit unknown must be represented as null with UNVALIDATED/CONTRADICTED provenance, never as undefined`,
      );
    }
  }
}

/** CAM-INV-009 -- Canonicalization Must Be Versioned. */
function checkVersioningPresent(action: CanonicalAction): void {
  const required: Array<[string, string]> = [
    ["schemaVersion", action.integrity.schemaVersion],
    ["taxonomyVersion", action.integrity.taxonomyVersion],
    ["adapterVersion", action.integrity.adapterVersion],
    ["normalizerVersion", action.integrity.normalizerVersion],
  ];
  for (const [field, value] of required) {
    if (!value) {
      throw new CamInvariantViolation("CAM-INV-009", `integrity.${field} is missing; every canonicalization must be versioned`);
    }
  }
}
