import test from "node:test";
import assert from "node:assert/strict";
import { computeStreak, computeXp } from "./stats";

test("computeStreak returns consecutive-day streak from latest attempt day", () => {
  const streak = computeStreak([
    new Date("2026-02-20T10:00:00.000Z"),
    new Date("2026-02-19T10:00:00.000Z"),
    new Date("2026-02-18T10:00:00.000Z"),
    new Date("2026-02-16T10:00:00.000Z"),
  ]);

  assert.equal(streak, 3);
});

test("computeStreak handles no attempts", () => {
  assert.equal(computeStreak([]), 0);
});

test("computeXp includes hard-word bonus", () => {
  assert.equal(computeXp({ correctAttempts: 10, hardCorrectAttempts: 4 }), 120);
});
