import type { UserWordProgress, Word } from "@shared/schema";

export type CandidateScoreBreakdown = {
  difficultyWeight: number;
  daysSinceLastSeen: number;
  wrongPenaltyBonus: number;
  streakPenalty: number;
  directionWeaknessBonus: number;
  newWordBoost: number;
  masteredPenalty: number;
  total: number;
};

export type ScoreCandidateInput = {
  word: Word;
  progress?: UserWordProgress;
  now?: Date;
};

export function computeCandidateScore(input: ScoreCandidateInput): CandidateScoreBreakdown {
  const now = input.now ?? new Date();
  const difficultyWeight = input.word.difficulty ?? 1;

  if (!input.progress) {
    const total = difficultyWeight * 2 + 50;
    return {
      difficultyWeight,
      daysSinceLastSeen: 0,
      wrongPenaltyBonus: 0,
      streakPenalty: 0,
      directionWeaknessBonus: 0,
      newWordBoost: 50,
      masteredPenalty: 0,
      total,
    };
  }

  const lastSeenDate = input.progress.lastSeen ? new Date(input.progress.lastSeen) : new Date(0);
  const daysSinceLastSeen = Math.max(
    0,
    Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const wrongPenaltyBonus = (input.progress.wrongCount ?? 0) * 2;
  const streakPenalty = input.progress.correctStreak ?? 0;
  const weakestDirection = Math.min(
    input.progress.sourceToTargetStrength ?? 0.5,
    input.progress.targetToSourceStrength ?? 0.5,
  );
  const directionWeaknessBonus = Math.round((1 - weakestDirection) * 8);

  let masteredPenalty = 0;
  if ((input.progress.masteryLevel ?? 0) >= 4) {
    const due = input.progress.nextReview && new Date(input.progress.nextReview) <= now;
    masteredPenalty = due ? 0 : -1000;
  }

  const total =
    difficultyWeight +
    daysSinceLastSeen +
    wrongPenaltyBonus -
    streakPenalty +
    directionWeaknessBonus +
    masteredPenalty;

  return {
    difficultyWeight,
    daysSinceLastSeen,
    wrongPenaltyBonus,
    streakPenalty,
    directionWeaknessBonus,
    newWordBoost: 0,
    masteredPenalty,
    total,
  };
}

export function rankQuizCandidates(
  words: Word[],
  progressMap: Map<number, UserWordProgress>,
  now = new Date(),
): Word[] {
  return words
    .map((word) => ({
      word,
      score: computeCandidateScore({ word, progress: progressMap.get(word.id), now }),
    }))
    .sort((a, b) => {
      if (b.score.total !== a.score.total) {
        return b.score.total - a.score.total;
      }

      if ((b.word.difficulty ?? 1) !== (a.word.difficulty ?? 1)) {
        return (b.word.difficulty ?? 1) - (a.word.difficulty ?? 1);
      }

      return a.word.id - b.word.id;
    })
    .map((item) => item.word);
}
