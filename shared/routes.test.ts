import test from "node:test";
import assert from "node:assert/strict";
import { buildUrl } from "./routes";

test("buildUrl replaces path params", () => {
  const url = buildUrl("/api/words/:id", { id: 42 });
  assert.equal(url, "/api/words/42");
});

test("buildUrl leaves path unchanged when params are missing", () => {
  const url = buildUrl("/api/clusters/:id");
  assert.equal(url, "/api/clusters/:id");
});

