import test from "node:test";
import assert from "node:assert/strict";
import { applySrsUpdate } from "./srs";

const baseProgress = {
  userId: "u1",
  wordId: 10,
  correctStreak: 0,
  wrongCount: 0,
  easeFactor: 2.5,
  interval: 1,
  lastSeen: null,
  nextReview: null,
  masteryLevel: 0,
};

test("applySrsUpdate handles incorrect answer reset", () => {
  const now = new Date("2026-02-20T00:00:00.000Z");
  const updated = applySrsUpdate({
    progress: { ...baseProgress } as any,
    isCorrect: false,
    confidenceLevel: 2,
    now,
  });

  assert.equal(updated.correctStreak, 0);
  assert.equal(updated.interval, 1);
  assert.equal(updated.wrongCount, 1);
  assert.equal(updated.masteryLevel, 0);
});

test("applySrsUpdate increases streak and interval on correct answers", () => {
  const now = new Date("2026-02-20T00:00:00.000Z");
  const updated = applySrsUpdate({
    progress: { ...baseProgress, correctStreak: 2, interval: 6 } as any,
    isCorrect: true,
    confidenceLevel: 3,
    responseTimeMs: 2000,
    now,
  });

  assert.equal(updated.correctStreak, 3);
  assert.ok((updated.interval ?? 0) > 6);
  assert.equal(updated.masteryLevel, 2);
});
