import { test } from "node:test";
import assert from "node:assert/strict";
import { requiresNewAgentVersion } from "../src/agent-types.js";

const base = {
  modelIdentifier: "anthropic",
  modelVersion: "claude-sonnet-5",
  systemPromptHash: "sha_prompt_v1",
  toolConfigurationHash: "sha_tools_v1",
};

test("identical configuration does not require a new version", () => {
  assert.equal(requiresNewAgentVersion(base, { ...base }), false);
});

test("model version change requires a new version (RefundAgent v3 vs v4, SPEC-002 SS5.3)", () => {
  assert.equal(requiresNewAgentVersion(base, { ...base, modelVersion: "claude-opus-5" }), true);
});

test("system prompt change requires a new version", () => {
  assert.equal(requiresNewAgentVersion(base, { ...base, systemPromptHash: "sha_prompt_v2" }), true);
});

test("tool configuration change requires a new version", () => {
  assert.equal(requiresNewAgentVersion(base, { ...base, toolConfigurationHash: "sha_tools_v2" }), true);
});
