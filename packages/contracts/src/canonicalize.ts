/**
 * Deterministic canonical serialization and hashing (SPEC-001 SS56-59).
 *
 * "Canonical Fingerprint" and "Material Fingerprint" both depend on a
 * serialization that is stable across runs, processes, and machines:
 * stable key ordering, no floating point for money, explicit null handling.
 */

import { createHash } from "node:crypto";

/**
 * Recursively sorts object keys and produces a JSON string with no
 * whitespace variance. Arrays preserve their given order (order is
 * semantically meaningful for CAM arrays, e.g. targets, effects).
 *
 * Numbers are required to be finite integers or exact decimal strings by
 * convention elsewhere in this package -- see cam-types.ts EffectMagnitude,
 * which uses `amountMinor` integers instead of floating point currency
 * (SPEC-001 SS60, CAM money-representation rule).
 */
export function canonicalStringify(value: unknown): string {
  return serialize(value);
}

function serialize(value: unknown): string {
  if (value === undefined) {
    // CAM-INV-005: Unknown Is Not Zero -- `undefined` must never silently
    // collapse into the serialized form. Callers must use `null` to
    // represent an explicit, deliberate absence of a value.
    throw new Error(
      "canonicalStringify: `undefined` is not a valid canonical value; use `null` to represent an explicit unknown (CAM-INV-005)",
    );
  }
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("canonicalStringify: non-finite numbers are not canonical");
    }
    // Integers serialize without a decimal point; this package never
    // represents money as a JS float (SPEC-001 SS60).
    return String(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value.normalize("NFC"));
  }
  if (Array.isArray(value)) {
    return `[${value.map(serialize).join(",")}]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const entries = keys.map((k) => `${JSON.stringify(k)}:${serialize(obj[k])}`);
    return `{${entries.join(",")}}`;
  }
  throw new Error(`canonicalStringify: unsupported value type ${typeof value}`);
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function canonicalHash(value: unknown): string {
  return sha256Hex(canonicalStringify(value));
}
