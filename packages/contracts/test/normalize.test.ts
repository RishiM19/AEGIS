import { test } from "node:test";
import assert from "node:assert/strict";
import { finalizeCanonicalAction, deriveNextVersion } from "../src/normalize.js";
import { CamInvariantViolation } from "../src/cam-invariants.js";
import { buildRefundDraft } from "./fixtures.js";

test("finalizeCanonicalAction produces a valid action with both fingerprints set", () => {
  const draft = buildRefundDraft();
  const action = finalizeCanonicalAction(draft, { raw: "proposal" });
  assert.ok(action.integrity.canonicalFingerprint.length === 64); // sha256 hex
  assert.ok(action.integrity.materialFingerprint.length === 64);
  assert.ok(action.integrity.rawProposalHash.length === 64);
});

test("finalizeCanonicalAction throws CamInvariantViolation when a critical parameter lacks provenance", () => {
  const draft = buildRefundDraft();
  delete (draft.provenance as Record<string, unknown>)["operation.parameters.amount"];
  assert.throws(() => finalizeCanonicalAction(draft, {}), CamInvariantViolation);
});

test("deriveNextVersion: material change (refund amount) increments actionVersion (CAM-INV-003)", () => {
  const previous = finalizeCanonicalAction(buildRefundDraft({ amountMinor: 1840000 }), {});
  const nextDraft = buildRefundDraft({ amountMinor: 2200000 });

  const { materialChange, nextAction } = deriveNextVersion(previous, nextDraft, {});

  assert.equal(materialChange, true);
  assert.equal(nextAction.identity.actionVersion, previous.identity.actionVersion + 1);
  assert.equal(nextAction.identity.actionId, previous.identity.actionId, "actionId is stable across versions");
  assert.equal(nextAction.identity.parentActionId, previous.identity.actionId);
  assert.notEqual(
    nextAction.integrity.materialFingerprint,
    previous.integrity.materialFingerprint,
    "material fingerprint must differ after a material change",
  );
});

test("deriveNextVersion: non-material change (rationale only) does not increment actionVersion", () => {
  const previous = finalizeCanonicalAction(buildRefundDraft(), {});
  const nextDraft = buildRefundDraft();
  nextDraft.purpose = { ...nextDraft.purpose, rationale: "Additional context from support agent" };

  const { materialChange, nextAction } = deriveNextVersion(previous, nextDraft, {});

  assert.equal(materialChange, false);
  assert.equal(nextAction.identity.actionVersion, previous.identity.actionVersion);
  assert.equal(
    nextAction.integrity.materialFingerprint,
    previous.integrity.materialFingerprint,
    "material fingerprint must be unchanged when nothing material changed",
  );
});

test("a materially mutated action invalidates the previous material fingerprint binding (SPEC-000 SS15)", () => {
  const previous = finalizeCanonicalAction(buildRefundDraft({ amountMinor: 1840000 }), {});
  const grantBoundFingerprint = previous.integrity.materialFingerprint;

  const { nextAction } = deriveNextVersion(previous, buildRefundDraft({ amountMinor: 2500000 }), {});

  assert.notEqual(
    nextAction.integrity.materialFingerprint,
    grantBoundFingerprint,
    "an authority grant bound to the old material fingerprint must not authorize the mutated action",
  );
});
