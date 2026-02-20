import fs from "fs/promises";
import path from "path";
import { chooseDistractors } from "../server/services/distractors";
import { rankQuizCandidates } from "../server/services/quiz-candidate-scoring";
import { generateSessionWords } from "../server/services/session-generator";

type Word = {
  id: number;
  telugu: string;
  transliteration: string;
  english: string;
  partOfSpeech: string;
  difficulty: number;
  difficultyLevel: string;
  frequencyScore: number;
  cefrLevel: string | null;
  audioUrl: string | null;
  exampleSentences: string[];
  tags: string[];
  createdAt: Date | null;
};

type Progress = {
  userId: string;
  wordId: number;
  correctStreak: number;
  wrongCount: number;
  easeFactor: number;
  interval: number;
  lastSeen: Date;
  nextReview: Date;
  masteryLevel: number;
};

function hrMs(start: bigint, end: bigint) {
  return Number(end - start) / 1_000_000;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function sample<T>(arr: T[]): T {
  return arr[randomInt(arr.length)];
}

async function loadWords(): Promise<Word[]> {
  const raw = await fs.readFile(path.resolve("assets/processed/seed.json"), "utf-8");
  const rows = JSON.parse(raw);
  return rows.map((row: any, idx: number) => ({
    id: idx + 1,
    telugu: row.telugu,
    transliteration: row.transliteration,
    english: row.english,
    partOfSpeech: row.partOfSpeech,
    difficulty: row.difficulty,
    difficultyLevel: row.difficultyLevel,
    frequencyScore: row.frequencyScore,
    cefrLevel: row.cefrLevel ?? null,
    audioUrl: null,
    exampleSentences: row.examples?.map((e: any) => e.telugu) ?? [],
    tags: row.tags ?? [],
    createdAt: null,
  }));
}

function makeProgress(words: Word[]): Map<number, Progress> {
  const map = new Map<number, Progress>();
  const now = new Date();
  for (const word of words.slice(0, 220)) {
    const lastSeen = new Date(now);
    lastSeen.setDate(lastSeen.getDate() - randomInt(10));
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + randomInt(8) - 3);

    map.set(word.id, {
      userId: "benchmark",
      wordId: word.id,
      correctStreak: randomInt(7),
      wrongCount: randomInt(4),
      easeFactor: 1.8 + Math.random() * 1.1,
      interval: 1 + randomInt(10),
      lastSeen,
      nextReview,
      masteryLevel: randomInt(5),
    });
  }
  return map;
}

async function main() {
  const words = await loadWords();
  const progressMap = makeProgress(words);

  const clusterByWord = new Map<number, Set<number>>();
  for (const word of words) {
    clusterByWord.set(word.id, new Set([1 + (word.id % 20), 1 + ((word.id + 7) % 20)]));
  }

  const rounds = 200;
  let scoreTotal = 0;
  let sessionTotal = 0;
  let distractorTotal = 0;

  for (let i = 0; i < rounds; i += 1) {
    const t1 = process.hrtime.bigint();
    const ranked = rankQuizCandidates(words as any, progressMap as any);
    const t2 = process.hrtime.bigint();
    scoreTotal += hrMs(t1, t2);

    const t3 = process.hrtime.bigint();
    const session = generateSessionWords({
      mode: "daily_review",
      count: 10,
      words: ranked.slice(0, 300) as any,
      progressMap: progressMap as any,
      recentAccuracy: 0.74,
    });
    const t4 = process.hrtime.bigint();
    sessionTotal += hrMs(t3, t4);

    const t5 = process.hrtime.bigint();
    for (const word of session) {
      chooseDistractors({
        word: word as any,
        allWords: words as any,
        clusterByWord,
        count: 3,
      });
    }
    const t6 = process.hrtime.bigint();
    distractorTotal += hrMs(t5, t6);
  }

  const avgScore = scoreTotal / rounds;
  const avgSession = sessionTotal / rounds;
  const avgDistractors = distractorTotal / rounds;
  const avgTotal = avgScore + avgSession + avgDistractors;

  const report = [
    `# Quiz Engine Benchmark`,
    ``,
    `Date: ${new Date().toISOString()}`,
    `Rounds: ${rounds}`,
    `Word pool: ${words.length}`,
    ``,
    `Average candidate ranking: ${avgScore.toFixed(3)} ms`,
    `Average session generation: ${avgSession.toFixed(3)} ms`,
    `Average distractor generation (10 questions): ${avgDistractors.toFixed(3)} ms`,
    `Average combined quiz generation path: ${avgTotal.toFixed(3)} ms`,
    ``,
    `Target: < 200ms`,
    `Result: ${avgTotal < 200 ? "PASS" : "FAIL"}`,
    ``,
  ].join("\n");

  await fs.writeFile(path.resolve("context/plan/perf-report.md"), report, "utf-8");
  console.log(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
