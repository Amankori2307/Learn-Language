import test from "node:test";
import assert from "node:assert/strict";
import { chooseDistractors } from "./distractors";

function makeWord(id: number, partOfSpeech: string, transliteration: string) {
  return {
    id,
    originalScript: `sample-word-${id}`,
    transliteration,
    english: `word-${id}`,
    partOfSpeech,
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

test("chooseDistractors prioritizes same-cluster and same-pos candidates", () => {
  const target = makeWord(1, "noun", "nenu") as any;
  const allWords = [
    target,
    makeWord(2, "noun", "nela"),
    makeWord(3, "verb", "nemo"),
    makeWord(4, "noun", "abcd"),
    makeWord(5, "verb", "xyzz"),
  ] as any;

  const clusterByWord = new Map<number, Set<number>>([
    [1, new Set([10])],
    [2, new Set([10])],
    [3, new Set([10])],
    [4, new Set([20])],
    [5, new Set([30])],
  ]);

  const out = chooseDistractors({
    word: target,
    allWords,
    clusterByWord,
    random: () => 0.5,
  });

  assert.equal(out.length, 3);
  assert.equal(out[0].id, 2);
});

test("chooseDistractors never returns duplicate IDs", () => {
  const target = makeWord(1, "noun", "nenu") as any;
  const allWords = [target, makeWord(2, "noun", "nenu"), makeWord(3, "noun", "nenu")] as any;
  const clusterByWord = new Map<number, Set<number>>();

  const out = chooseDistractors({
    word: target,
    allWords,
    clusterByWord,
    random: () => 0.1,
  });

  const unique = new Set(out.map((x) => x.id));
  assert.equal(unique.size, out.length);
  assert.ok(!unique.has(target.id));
});
