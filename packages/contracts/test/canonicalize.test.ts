import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalStringify, canonicalHash } from "../src/canonicalize.js";

test("canonicalStringify: key order does not affect output", () => {
  const a = canonicalStringify({ b: 1, a: 2 });
  const b = canonicalStringify({ a: 2, b: 1 });
  assert.equal(a, b);
});

test("canonicalStringify: array order is preserved (not sorted)", () => {
  const a = canonicalStringify([1, 2, 3]);
  const b = canonicalStringify([3, 2, 1]);
  assert.notEqual(a, b);
});

test("canonicalStringify: rejects undefined (CAM-INV-005)", () => {
  assert.throws(() => canonicalStringify({ a: undefined }), /CAM-INV-005|undefined/);
});

test("canonicalStringify: rejects non-finite numbers", () => {
  assert.throws(() => canonicalStringify(Number.POSITIVE_INFINITY));
  assert.throws(() => canonicalStringify(Number.NaN));
});

test("canonicalHash: identical structures hash identically regardless of key order", () => {
  const h1 = canonicalHash({ x: 1, y: { c: 3, d: 4 } });
  const h2 = canonicalHash({ y: { d: 4, c: 3 }, x: 1 });
  assert.equal(h1, h2);
});

test("canonicalHash: different values hash differently", () => {
  const h1 = canonicalHash({ amount: 100 });
  const h2 = canonicalHash({ amount: 101 });
  assert.notEqual(h1, h2);
});
