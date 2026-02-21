import test from "node:test";
import assert from "node:assert/strict";
import { generateSessionWords } from "./session-generator";
import { QuizModeEnum } from "@shared/domain/enums";

const now = new Date("2026-02-20T00:00:00.000Z");

function makeWord(id: number) {
  return {
    id,
    originalScript: `sample-word-${id}`,
    transliteration: `padam${id}`,
    english: `word-${id}`,
    partOfSpeech: "noun",
    difficulty: 1,
    difficultyLevel: "beginner",
    frequencyScore: 0.5,
    cefrLevel: null,
    audioUrl: null,
    exampleSentences: [],
    tags: [],
    createdAt: null,
  };
}

function makeProgress(wordId: number, nextReview: Date | null, wrongCount = 0) {
  return {
    userId: "u1",
    wordId,
    correctStreak: 0,
    wrongCount,
    easeFactor: 2.5,
    interval: 1,
    lastSeen: now,
    nextReview,
    masteryLevel: 1,
  };
}

test("daily_review prioritizes due/new/weak mix", () => {
  const words = Array.from({ length: 10 }, (_, i) => makeWord(i + 1)) as any;
  const progressMap = new Map<number, any>([
    [1, makeProgress(1, new Date("2026-02-19T00:00:00.000Z"), 2)],
    [2, makeProgress(2, new Date("2026-02-18T00:00:00.000Z"), 0)],
    [3, makeProgress(3, new Date("2026-03-01T00:00:00.000Z"), 3)],
    [4, makeProgress(4, new Date("2026-02-17T00:00:00.000Z"), 1)],
  ]);

  const result = generateSessionWords({
    mode: QuizModeEnum.DAILY_REVIEW,
    count: 6,
    words,
    progressMap,
    now,
  });

  assert.equal(result.length, 6);
  assert.ok(result.some((w: any) => [1, 2, 4].includes(w.id)), "expected at least one due review item");
  assert.ok(result.some((w: any) => [1, 3, 4].includes(w.id)), "expected at least one weak item");
  assert.ok(result.some((w: any) => w.id >= 5), "expected at least one new item");
});

test("weak_words mode prioritizes weak items first", () => {
  const words = [makeWord(1), makeWord(2), makeWord(3), makeWord(4)] as any;
  const progressMap = new Map<number, any>([
    [1, makeProgress(1, new Date("2026-03-01T00:00:00.000Z"), 4)],
    [2, makeProgress(2, new Date("2026-03-01T00:00:00.000Z"), 3)],
  ]);

  const result = generateSessionWords({ mode: QuizModeEnum.WEAK_WORDS, count: 3, words, progressMap, now });

  assert.equal(result.length, 3);
  assert.deepEqual(
    result.slice(0, 2).map((w: any) => w.id),
    [1, 2],
  );
});

test("daily_review handles empty candidate pool", () => {
  const result = generateSessionWords({
    mode: QuizModeEnum.DAILY_REVIEW,
    count: 10,
    words: [] as any,
    progressMap: new Map(),
    now,
  });

  assert.equal(result.length, 0);
});

test("daily_review falls back to ranked words when no due items exist", () => {
  const words = [makeWord(1), makeWord(2), makeWord(3), makeWord(4)] as any;
  const progressMap = new Map<number, any>([
    [1, makeProgress(1, new Date("2026-03-20T00:00:00.000Z"), 0)],
    [2, makeProgress(2, new Date("2026-03-21T00:00:00.000Z"), 0)],
  ]);

  const result = generateSessionWords({
    mode: QuizModeEnum.DAILY_REVIEW,
    count: 3,
    words,
    progressMap,
    now,
  });

  assert.equal(result.length, 3);
  assert.ok(result.every((word: any) => [1, 2, 3, 4].includes(word.id)));
});

test("daily_review throttles new content when recent accuracy is low", () => {
  const words = Array.from({ length: 12 }, (_, i) => makeWord(i + 1)) as any;
  const progressMap = new Map<number, any>([
    [1, makeProgress(1, new Date("2026-02-18T00:00:00.000Z"), 3)],
    [2, makeProgress(2, new Date("2026-02-19T00:00:00.000Z"), 2)],
    [3, makeProgress(3, new Date("2026-03-10T00:00:00.000Z"), 4)],
    [4, makeProgress(4, new Date("2026-03-10T00:00:00.000Z"), 3)],
  ]);

  const lowAccuracyResult = generateSessionWords({
    mode: QuizModeEnum.DAILY_REVIEW,
    count: 10,
    words,
    progressMap,
    recentAccuracy: 0.4,
    now,
  });

  const baselineResult = generateSessionWords({
    mode: QuizModeEnum.DAILY_REVIEW,
    count: 10,
    words,
    progressMap,
    recentAccuracy: 0.9,
    now,
  });

  const lowAccuracyNewCount = lowAccuracyResult.filter((w: any) => !progressMap.has(w.id)).length;
  const baselineNewCount = baselineResult.filter((w: any) => !progressMap.has(w.id)).length;
  assert.ok(lowAccuracyNewCount <= baselineNewCount);
});

test("complex_workout prioritizes weak/harder candidates", () => {
  const words = [
    { ...makeWord(1), difficulty: 1 },
    { ...makeWord(2), difficulty: 3 },
    { ...makeWord(3), difficulty: 4 },
    { ...makeWord(4), difficulty: 1 },
  ] as any;

  const progressMap = new Map<number, any>([
    [1, makeProgress(1, new Date("2026-03-20T00:00:00.000Z"), 0)],
    [2, makeProgress(2, new Date("2026-03-20T00:00:00.000Z"), 3)],
  ]);

  const result = generateSessionWords({
    mode: QuizModeEnum.COMPLEX_WORKOUT,
    count: 3,
    words,
    progressMap,
    now,
  });

  assert.equal(result.length, 3);
  assert.equal(result[0].id, 2);
});

test("listen_identify returns only words with audio", () => {
  const words = [
    { ...makeWord(1), audioUrl: "https://cdn.example.com/1.mp3" },
    { ...makeWord(2), audioUrl: null },
    { ...makeWord(3), audioUrl: "https://cdn.example.com/3.mp3" },
  ] as any;

  const result = generateSessionWords({
    mode: QuizModeEnum.LISTEN_IDENTIFY,
    count: 5,
    words,
    progressMap: new Map(),
    now,
  });

  assert.deepEqual(result.map((word: any) => word.id), [1, 3]);
});
