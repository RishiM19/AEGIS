import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCanonicalFingerprint, computeMaterialFingerprint } from "../src/fingerprint.js";
import { buildRefundDraft } from "./fixtures.js";

test("canonical fingerprint changes when a non-material field (rationale) changes", () => {
  const draft1 = buildRefundDraft();
  const draft2 = buildRefundDraft();
  draft2.purpose = { ...draft2.purpose, rationale: "Customer called twice to confirm" };

  const fp1 = computeCanonicalFingerprint(draft1);
  const fp2 = computeCanonicalFingerprint(draft2);
  assert.notEqual(fp1, fp2, "canonical fingerprint should reflect any field change");
});

test("material fingerprint does NOT change when only a non-material field changes (SPEC-001 SS57)", () => {
  const draft1 = buildRefundDraft();
  const draft2 = buildRefundDraft();
  draft2.purpose = { ...draft2.purpose, rationale: "Customer called twice to confirm" };

  const mfp1 = computeMaterialFingerprint(draft1);
  const mfp2 = computeMaterialFingerprint(draft2);
  assert.equal(mfp1, mfp2, "changing a UI/rationale-only field must not change the material fingerprint");
});

test("material fingerprint DOES change when refund amount changes beyond threshold (SPEC-001 SS57 example)", () => {
  const draft1 = buildRefundDraft({ amountMinor: 1840000 });
  const draft2 = buildRefundDraft({ amountMinor: 2000000 });

  const mfp1 = computeMaterialFingerprint(draft1);
  const mfp2 = computeMaterialFingerprint(draft2);
  assert.notEqual(mfp1, mfp2);
});

test("material fingerprint is stable for within-threshold amount drift", () => {
  const draft1 = buildRefundDraft({ amountMinor: 1840000 });
  const draft2 = buildRefundDraft({ amountMinor: 1840050 }); // within 100-minor-unit threshold

  const mfp1 = computeMaterialFingerprint(draft1);
  const mfp2 = computeMaterialFingerprint(draft2);
  assert.equal(mfp1, mfp2);
});
