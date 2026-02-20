import type { UserWordProgress, Word } from "@shared/schema";
import { rankQuizCandidates } from "./quiz-candidate-scoring";

export type QuizMode = "daily_review" | "new_words" | "cluster" | "weak_words";

function isDue(progress?: UserWordProgress, now = new Date()): boolean {
  if (!progress?.nextReview) return false;
  return new Date(progress.nextReview) <= now;
}

function isWeak(progress?: UserWordProgress, now = new Date()): boolean {
  if (!progress) return false;
  const overdue = progress.nextReview ? new Date(progress.nextReview) < now : false;
  return (progress.wrongCount ?? 0) >= 2 || overdue;
}

function uniqueById(words: Word[]): Word[] {
  const seen = new Set<number>();
  const out: Word[] = [];
  for (const word of words) {
    if (!seen.has(word.id)) {
      seen.add(word.id);
      out.push(word);
    }
  }
  return out;
}

function take(words: Word[], n: number): Word[] {
  if (n <= 0) return [];
  return words.slice(0, n);
}

export function generateSessionWords(params: {
  mode: QuizMode;
  count: number;
  words: Word[];
  progressMap: Map<number, UserWordProgress>;
  now?: Date;
}): Word[] {
  const now = params.now ?? new Date();
  const ranked = rankQuizCandidates(params.words, params.progressMap, now);

  const due = ranked.filter((word) => isDue(params.progressMap.get(word.id), now));
  const weak = ranked.filter((word) => isWeak(params.progressMap.get(word.id), now));
  const fresh = ranked.filter((word) => !params.progressMap.has(word.id));

  if (params.mode === "new_words") {
    return uniqueById([...take(fresh, params.count), ...ranked]).slice(0, params.count);
  }

  if (params.mode === "weak_words") {
    return uniqueById([...take(weak, params.count), ...ranked]).slice(0, params.count);
  }

  if (params.mode === "cluster") {
    return ranked.slice(0, params.count);
  }

  const reviewTarget = Math.round(params.count * 0.3);
  const newTarget = Math.round(params.count * 0.5);
  const weakTarget = Math.max(0, params.count - reviewTarget - newTarget);

  const mixed = uniqueById([
    ...take(due, reviewTarget),
    ...take(fresh, newTarget),
    ...take(weak, weakTarget),
    ...ranked,
  ]);

  return mixed.slice(0, params.count);
}

