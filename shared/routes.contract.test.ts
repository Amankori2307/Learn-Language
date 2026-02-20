import test from "node:test";
import assert from "node:assert/strict";
import { api } from "./routes";

test("quiz generate contract accepts expected payload", () => {
  const payload = [
    {
      wordId: 1,
      type: "telugu_to_english",
      questionText: "నేను",
      audioUrl: null,
      options: [
        { id: 1, text: "I" },
        { id: 2, text: "You" },
      ],
    },
  ];

  const parsed = api.quiz.generate.responses[200].parse(payload);
  assert.equal(parsed[0].wordId, 1);
});

test("quiz submit contract rejects out-of-range confidence", () => {
  assert.throws(() => {
    api.quiz.submit.input.parse({
      wordId: 1,
      selectedOptionId: 2,
      confidenceLevel: 7,
    });
  });
});

test("stats contract accepts direction metrics", () => {
  const payload = {
    totalWords: 300,
    mastered: 10,
    learning: 200,
    weak: 50,
    streak: 4,
    xp: 120,
    recognitionAccuracy: 72.5,
    recallAccuracy: 61.2,
    recommendedDirection: "telugu_to_english",
  };

  const parsed = api.stats.get.responses[200].parse(payload);
  assert.equal(parsed.recommendedDirection, "telugu_to_english");
});

test("leaderboard contract accepts ranked entries", () => {
  const payload = [
    {
      rank: 1,
      userId: "u-1",
      firstName: "Aman",
      lastName: "K",
      email: "a@example.com",
      profileImageUrl: null,
      xp: 180,
      streak: 5,
      attempts: 24,
      accuracy: 83.3,
    },
  ];

  const parsed = api.leaderboard.list.responses[200].parse(payload);
  assert.equal(parsed[0].rank, 1);
});

test("profile update contract rejects invalid avatar URL", () => {
  assert.throws(() => {
    api.profile.update.input.parse({
      firstName: "Aman",
      profileImageUrl: "not-a-url",
    });
  });
});

test("review queue contract accepts pending review payload", () => {
  const payload = [
    {
      id: 10,
      telugu: "నమస్తే",
      transliteration: "namaste",
      english: "hello",
      partOfSpeech: "phrase",
      reviewStatus: "pending_review",
      sourceUrl: null,
      sourceCapturedAt: null,
      submittedBy: null,
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
    },
  ];

  const parsed = api.review.queue.responses[200].parse(payload);
  assert.equal(parsed[0].reviewStatus, "pending_review");
});

test("review transition contract rejects invalid status", () => {
  assert.throws(() => {
    api.review.transition.input.parse({
      toStatus: "published",
    });
  });
});
