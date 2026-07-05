import { test } from "node:test";
import assert from "node:assert/strict";
import { assertValidTransition, canTransition, InvalidLifecycleTransition } from "../src/agent-lifecycle.js";

test("REGISTERED -> ACTIVE requires a delegation", () => {
  assert.doesNotThrow(() => assertValidTransition("REGISTERED", "ACTIVE", "DELEGATION_ISSUED"));
  assert.throws(() => assertValidTransition("REGISTERED", "ACTIVE", "AUTOMATIC"), InvalidLifecycleTransition);
});

test("SUSPENDED -> ACTIVE requires HUMAN_REVIEW, never AUTOMATIC (SPEC-002 SS6.6)", () => {
  assert.throws(() => assertValidTransition("SUSPENDED", "ACTIVE", "AUTOMATIC"), InvalidLifecycleTransition);
  assert.doesNotThrow(() => assertValidTransition("SUSPENDED", "ACTIVE", "HUMAN_REVIEW"));
});

test("no transition may be self-initiated by the agent (no AGENT_SELF authority exists at all)", () => {
  // @ts-expect-error -- intentionally passing an authority value outside the type to prove it's rejected
  assert.equal(canTransition("ACTIVE", "ACTIVE", "AGENT_SELF"), false);
});

test("RETIRED is terminal: no transitions are defined out of it", () => {
  assert.throws(() => assertValidTransition("RETIRED", "ACTIVE", "PRINCIPAL_OR_ORG_ADMIN"), InvalidLifecycleTransition);
});

test("only PRINCIPAL_OR_ORG_ADMIN may retire an agent", () => {
  assert.throws(() => assertValidTransition("ACTIVE", "RETIRED", "MANUAL_OPERATOR"), InvalidLifecycleTransition);
  assert.doesNotThrow(() => assertValidTransition("ACTIVE", "RETIRED", "PRINCIPAL_OR_ORG_ADMIN"));
});

test("canTransition mirrors assertValidTransition without throwing", () => {
  assert.equal(canTransition("ACTIVE", "CONSTRAINED", "AUTOMATIC"), true);
  assert.equal(canTransition("CONSTRAINED", "ACTIVE", "AUTOMATIC"), false);
  assert.equal(canTransition("CONSTRAINED", "ACTIVE", "MANUAL_OPERATOR"), true);
});
