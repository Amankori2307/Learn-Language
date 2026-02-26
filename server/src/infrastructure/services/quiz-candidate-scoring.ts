import type { UserWordProgress, Word } from "../schema";
import { QUIZ_CANDIDATE_SCORING } from "./quiz-candidate-scoring.constants";
import { runWithLifecycle } from "../../common/logger/logger";

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
  return runWithLifecycle("computeCandidateScore", () => {
    const now = input.now ?? new Date();
    const difficultyWeight = input.word.difficulty ?? QUIZ_CANDIDATE_SCORING.DEFAULT_WORD_DIFFICULTY;

  if (!input.progress) {
    const total =
      difficultyWeight * QUIZ_CANDIDATE_SCORING.NEW_WORD_DIFFICULTY_MULTIPLIER +
      QUIZ_CANDIDATE_SCORING.NEW_WORD_BASE_BOOST;
    return {
      difficultyWeight,
      daysSinceLastSeen: 0,
      wrongPenaltyBonus: 0,
      streakPenalty: 0,
      directionWeaknessBonus: 0,
      newWordBoost: QUIZ_CANDIDATE_SCORING.NEW_WORD_BASE_BOOST,
      masteredPenalty: 0,
      total,
    };
  }

  const lastSeenDate = input.progress.lastSeen ? new Date(input.progress.lastSeen) : new Date(0);
  const daysSinceLastSeen = Math.max(
    0,
    Math.floor(
      (now.getTime() - lastSeenDate.getTime()) /
        QUIZ_CANDIDATE_SCORING.DAYS_SINCE_LAST_SEEN_DIVISOR_MS,
    ),
  );
  const wrongPenaltyBonus = (input.progress.wrongCount ?? 0) * QUIZ_CANDIDATE_SCORING.WRONG_COUNT_WEIGHT;
  const streakPenalty = input.progress.correctStreak ?? 0;
  const weakestDirection = Math.min(
    input.progress.sourceToTargetStrength ?? QUIZ_CANDIDATE_SCORING.DEFAULT_DIRECTION_STRENGTH,
    input.progress.targetToSourceStrength ?? QUIZ_CANDIDATE_SCORING.DEFAULT_DIRECTION_STRENGTH,
  );
  const directionWeaknessBonus = Math.round(
    (1 - weakestDirection) * QUIZ_CANDIDATE_SCORING.DIRECTION_WEAKNESS_SCALE,
  );

  let masteredPenalty = 0;
  if ((input.progress.masteryLevel ?? 0) >= QUIZ_CANDIDATE_SCORING.MASTERED_MIN_LEVEL) {
    const due = input.progress.nextReview && new Date(input.progress.nextReview) <= now;
    masteredPenalty = due ? 0 : QUIZ_CANDIDATE_SCORING.MASTERED_NOT_DUE_PENALTY;
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
  });
}

export function rankQuizCandidates(
  words: Word[],
  progressMap: Map<number, UserWordProgress>,
  now = new Date(),
): Word[] {
  return runWithLifecycle("rankQuizCandidates", () =>
    words
      .map((word) => ({
        word,
        score: computeCandidateScore({ word, progress: progressMap.get(word.id), now }),
      }))
      .sort((a, b) => {
        if (b.score.total !== a.score.total) {
          return b.score.total - a.score.total;
        }

        const leftDifficulty = a.word.difficulty ?? QUIZ_CANDIDATE_SCORING.DEFAULT_WORD_DIFFICULTY;
        const rightDifficulty = b.word.difficulty ?? QUIZ_CANDIDATE_SCORING.DEFAULT_WORD_DIFFICULTY;
        if (rightDifficulty !== leftDifficulty) {
          return rightDifficulty - leftDifficulty;
        }

        return a.word.id - b.word.id;
      })
      .map((item) => item.word),
  );
}
