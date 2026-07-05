/**
 * CAM construction helpers: finalizing a normalized action with computed
 * integrity fields, and deriving a new version when a material mutation
 * occurs (CAM-INV-003, SPEC-001 SS7.2).
 */

import { computeCanonicalFingerprint, computeMaterialFingerprint, computeRawProposalHash } from "./fingerprint.js";
import { isParameterSetChangeMaterial } from "./materiality.js";
import { validateCanonicalAction } from "./cam-invariants.js";
import type { CanonicalAction, UnfingerprintedCanonicalAction } from "./cam-types.js";

/**
 * Computes integrity fields (both fingerprints) for a normalized action,
 * attaches the raw proposal hash, and validates all machine-checkable
 * CAM invariants before returning the finalized CanonicalAction.
 *
 * Throws CamInvariantViolation if the action is structurally invalid.
 */
export function finalizeCanonicalAction(
  draft: UnfingerprintedCanonicalAction,
  rawProposal: unknown,
): CanonicalAction {
  const canonicalFingerprint = computeCanonicalFingerprint(draft);
  const materialFingerprint = computeMaterialFingerprint(draft);
  const rawProposalHash = computeRawProposalHash(rawProposal);

  const action: CanonicalAction = {
    ...draft,
    integrity: {
      ...draft.integrity,
      canonicalFingerprint,
      materialFingerprint,
      rawProposalHash,
    },
  };

  validateCanonicalAction(action);
  return action;
}

export interface VersionDerivationResult {
  materialChange: boolean;
  nextAction: CanonicalAction;
}

/**
 * Given a previously finalized action and a new draft representing a
 * proposed mutation, determines whether the mutation is material
 * (CAM-INV-003) and, if so, produces a new action version bound to a new
 * canonical/material fingerprint. A non-material mutation still produces
 * a new canonical fingerprint (something changed) but is flagged so
 * callers know any existing Autonomy Grant / Approval Decision bound to
 * the previous materialFingerprint remains valid.
 */
export function deriveNextVersion(
  previous: CanonicalAction,
  nextDraft: UnfingerprintedCanonicalAction,
  rawProposal: unknown,
): VersionDerivationResult {
  const materialChange = isParameterSetChangeMaterial(
    previous.operation.parameters,
    nextDraft.operation.parameters,
  );

  const versionedDraft: UnfingerprintedCanonicalAction = {
    ...nextDraft,
    identity: {
      ...nextDraft.identity,
      actionId: previous.identity.actionId,
      parentActionId: previous.identity.actionId,
      actionVersion: materialChange ? previous.identity.actionVersion + 1 : previous.identity.actionVersion,
    },
  };

  const nextAction = finalizeCanonicalAction(versionedDraft, rawProposal);
  return { materialChange, nextAction };
}
