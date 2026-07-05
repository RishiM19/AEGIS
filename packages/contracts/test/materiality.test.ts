import { test } from "node:test";
import assert from "node:assert/strict";
import { isParameterChangeMaterial, isParameterSetChangeMaterial } from "../src/materiality.js";
import type { CanonicalParameter } from "../src/cam-types.js";

test("THRESHOLD: change within tolerance is not material", () => {
  const rule = { parameterName: "amount", materiality: "THRESHOLD" as const, threshold: 100 };
  assert.equal(isParameterChangeMaterial(rule, 1840000, 1840050), false);
});

test("THRESHOLD: change beyond tolerance is material", () => {
  const rule = { parameterName: "amount", materiality: "THRESHOLD" as const, threshold: 100 };
  assert.equal(isParameterChangeMaterial(rule, 1840000, 1850000), true);
});

test("ALWAYS: any change is material", () => {
  const rule = { parameterName: "customerId", materiality: "ALWAYS" as const };
  assert.equal(isParameterChangeMaterial(rule, "cust_829", "cust_830"), true);
  assert.equal(isParameterChangeMaterial(rule, "cust_829", "cust_829"), false);
});

test("NEVER: no change is ever material", () => {
  const rule = { parameterName: "displayLabel", materiality: "NEVER" as const };
  assert.equal(isParameterChangeMaterial(rule, "Refund #1", "Refund (updated)"), false);
});

function param(overrides: Partial<CanonicalParameter>): CanonicalParameter {
  return {
    name: "p",
    semanticType: "string",
    value: "v",
    decisionRelevance: "MEDIUM",
    mutable: true,
    ...overrides,
  };
}

test("parameter set: refund amount changing beyond threshold is material (SPEC-001 SS27 example)", () => {
  const oldParams = [
    param({
      name: "amount",
      value: 1840000,
      decisionRelevance: "CRITICAL",
      materialityRule: { parameterName: "amount", materiality: "THRESHOLD", threshold: 100 },
    }),
  ];
  const newParams = [
    param({
      name: "amount",
      value: 1850000,
      decisionRelevance: "CRITICAL",
      materialityRule: { parameterName: "amount", materiality: "THRESHOLD", threshold: 100 },
    }),
  ];
  assert.equal(isParameterSetChangeMaterial(oldParams, newParams), true);
});

test("parameter set: adding a NONE-relevance parameter is not material", () => {
  const oldParams = [param({ name: "amount", decisionRelevance: "CRITICAL", materialityRule: { parameterName: "amount", materiality: "ALWAYS" } })];
  const newParams = [
    ...oldParams,
    param({ name: "internalNote", decisionRelevance: "NONE" }),
  ];
  assert.equal(isParameterSetChangeMaterial(oldParams, newParams), false);
});

test("parameter set: removing a decision-relevant parameter is material", () => {
  const oldParams = [param({ name: "amount", decisionRelevance: "CRITICAL", materialityRule: { parameterName: "amount", materiality: "ALWAYS" } })];
  assert.equal(isParameterSetChangeMaterial(oldParams, []), true);
});
