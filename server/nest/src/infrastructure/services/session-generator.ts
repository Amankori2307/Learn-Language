import type { UserWordProgress, Word } from "@shared/schema";
import { QuizModeEnum } from "@shared/domain/enums";
import { rankQuizCandidates } from "./quiz-candidate-scoring";

export type QuizMode = QuizModeEnum;

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
  recentAccuracy?: number;
  now?: Date;
}): Word[] {
  const now = params.now ?? new Date();
  const ranked = rankQuizCandidates(params.words, params.progressMap, now);

  const due = ranked.filter((word) => isDue(params.progressMap.get(word.id), now));
  const weak = ranked.filter((word) => isWeak(params.progressMap.get(word.id), now));
  const fresh = ranked.filter((word) => !params.progressMap.has(word.id));

  if (params.mode === QuizModeEnum.NEW_WORDS) {
    return uniqueById([...take(fresh, params.count), ...ranked]).slice(0, params.count);
  }

  if (params.mode === QuizModeEnum.WEAK_WORDS) {
    return uniqueById([...take(weak, params.count), ...ranked]).slice(0, params.count);
  }

  if (params.mode === QuizModeEnum.CLUSTER) {
    return ranked.slice(0, params.count);
  }

  if (params.mode === QuizModeEnum.LISTEN_IDENTIFY) {
    return ranked.filter((word) => Boolean(word.audioUrl)).slice(0, params.count);
  }

  if (params.mode === QuizModeEnum.COMPLEX_WORKOUT) {
    const hardFirst = ranked
      .filter((word) => (word.difficulty ?? 1) >= 2)
      .concat(ranked.filter((word) => (word.difficulty ?? 1) < 2));
    return uniqueById([...weak, ...hardFirst]).slice(0, params.count);
  }

  let reviewTarget = Math.round(params.count * 0.3);
  let newTarget = Math.round(params.count * 0.5);

  // Adaptive v2: throttle new content when learner is overloaded.
  if (typeof params.recentAccuracy === "number") {
    if (params.recentAccuracy < 0.6) {
      newTarget = Math.round(params.count * 0.2);
      reviewTarget = Math.round(params.count * 0.4);
    } else if (params.recentAccuracy > 0.85) {
      newTarget = Math.round(params.count * 0.6);
      reviewTarget = Math.round(params.count * 0.25);
    }
  }

  const weakTarget = Math.max(0, params.count - reviewTarget - newTarget);

  const mixed = uniqueById([
    ...take(due, reviewTarget),
    ...take(fresh, newTarget),
    ...take(weak, weakTarget),
    ...ranked,
  ]);

  return mixed.slice(0, params.count);
}
