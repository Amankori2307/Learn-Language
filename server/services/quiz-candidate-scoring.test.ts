import test from "node:test";
import assert from "node:assert/strict";
import { computeCandidateScore, rankQuizCandidates } from "./quiz-candidate-scoring";

const makeWord = (id: number, difficulty: number) => ({
  id,
  originalScript: `sample-word-${id}`,
  transliteration: `padam${id}`,
  english: `word-${id}`,
  partOfSpeech: "noun",
  difficulty,
  difficultyLevel: "beginner",
  frequencyScore: 0.5,
  cefrLevel: null,
  audioUrl: null,
  exampleSentences: [],
  tags: [],
  createdAt: null,
});

test("computeCandidateScore boosts new words", () => {
  const score = computeCandidateScore({ word: makeWord(1, 2) as any });
  assert.equal(score.total, 54);
  assert.equal(score.newWordBoost, 50);
});

test("computeCandidateScore penalizes mastered words not due", () => {
  const now = new Date("2026-02-20T00:00:00.000Z");
  const score = computeCandidateScore({
    word: makeWord(1, 1) as any,
    now,
    progress: {
      userId: "u1",
      wordId: 1,
      correctStreak: 7,
      wrongCount: 0,
      easeFactor: 2.5,
      interval: 10,
      lastSeen: new Date("2026-02-19T00:00:00.000Z"),
      nextReview: new Date("2026-03-01T00:00:00.000Z"),
      masteryLevel: 4,
    } as any,
  });

  assert.equal(score.masteredPenalty, -1000);
});

test("rankQuizCandidates is deterministic for ties", () => {
  const words = [makeWord(2, 1), makeWord(1, 1), makeWord(3, 1)] as any;
  const ranked = rankQuizCandidates(words, new Map(), new Date("2026-02-20T00:00:00.000Z"));

  assert.deepEqual(
    ranked.map((w: any) => w.id),
    [1, 2, 3],
  );
});

test("rankQuizCandidates deprioritizes mastered words that are not due", () => {
  const now = new Date("2026-02-20T00:00:00.000Z");
  const words = [makeWord(1, 2), makeWord(2, 2)] as any;
  const progressMap = new Map<number, any>([
    [1, {
      userId: "u1",
      wordId: 1,
      correctStreak: 8,
      wrongCount: 0,
      easeFactor: 2.5,
      interval: 10,
      lastSeen: new Date("2026-02-19T00:00:00.000Z"),
      nextReview: new Date("2026-03-10T00:00:00.000Z"),
      masteryLevel: 4,
    }],
  ]);

  const ranked = rankQuizCandidates(words, progressMap, now);
  assert.deepEqual(ranked.map((w: any) => w.id), [2, 1]);
});
