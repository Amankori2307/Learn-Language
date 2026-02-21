import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SRS_CONFIG, resolveSrsConfig } from "./srs-config";

test("resolveSrsConfig falls back to default when config row is missing", () => {
  const result = resolveSrsConfig(undefined);
  assert.deepEqual(result, DEFAULT_SRS_CONFIG);
});

test("resolveSrsConfig returns provided valid config", () => {
  const result = resolveSrsConfig({
    version: "v2",
    config: {
      easeMin: 1.5,
      easeMax: 3.2,
      incorrectEasePenalty: 0.3,
    },
  } as any);
  assert.equal(result.version, "v2");
  assert.equal(result.easeMin, 1.5);
  assert.equal(result.easeMax, 3.2);
  assert.equal(result.incorrectEasePenalty, 0.3);
});
