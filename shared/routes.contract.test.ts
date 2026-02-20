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
