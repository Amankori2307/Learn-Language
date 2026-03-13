import { QuizConfidenceSourceEnum, QuizDirectionEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import type { UserWordProgress } from "../schema";

const CONFIDENCE_RULES = {
  MIN: 1,
  MAX: 3,
  BASELINE: 2,
  FAST_RESPONSE_MS: 2800,
  STEADY_RESPONSE_MS: 5200,
  SLOW_RESPONSE_MS: 9000,
  VERY_SLOW_RESPONSE_MS: 14000,
  STRONG_DIRECTION_THRESHOLD: 0.72,
  WEAK_DIRECTION_THRESHOLD: 0.38,
  STRONG_STREAK_THRESHOLD: 4,
  WEAK_STREAK_THRESHOLD: 1,
  HIGH_WRONG_COUNT_THRESHOLD: 4,
  MEDIUM_WRONG_COUNT_THRESHOLD: 2,
} as const;

function clamp(value: number) {
  return Math.min(CONFIDENCE_RULES.MAX, Math.max(CONFIDENCE_RULES.MIN, value));
}

function getDirectionalStrength(
  progress: UserWordProgress,
  direction?: QuizDirectionEnum,
  questionType?: QuizQuestionTypeEnum,
) {
  if (
    direction === QuizDirectionEnum.TARGET_TO_SOURCE ||
    questionType === QuizQuestionTypeEnum.TARGET_TO_SOURCE
  ) {
    return progress.targetToSourceStrength ?? 0.5;
  }

  if (
    direction === QuizDirectionEnum.SOURCE_TO_TARGET ||
    questionType === QuizQuestionTypeEnum.SOURCE_TO_TARGET
  ) {
    return progress.sourceToTargetStrength ?? 0.5;
  }

  return (
    ((progress.sourceToTargetStrength ?? 0.5) + (progress.targetToSourceStrength ?? 0.5)) / 2
  );
}

export function inferQuizConfidence(input: {
  isCorrect: boolean;
  progress: UserWordProgress;
  responseTimeMs?: number;
  direction?: QuizDirectionEnum;
  questionType?: QuizQuestionTypeEnum;
}) {
  if (!input.isCorrect) {
    return {
      inferredConfidenceLevel: CONFIDENCE_RULES.MIN,
      effectiveConfidenceLevel: CONFIDENCE_RULES.MIN,
      confidenceSource: QuizConfidenceSourceEnum.INFERRED,
    } as const;
  }

  let score = CONFIDENCE_RULES.BASELINE;
  const responseTimeMs = input.responseTimeMs;

  if (typeof responseTimeMs === "number") {
    if (responseTimeMs <= CONFIDENCE_RULES.FAST_RESPONSE_MS) {
      score += 0.8;
    } else if (responseTimeMs <= CONFIDENCE_RULES.STEADY_RESPONSE_MS) {
      score += 0.3;
    } else if (responseTimeMs >= CONFIDENCE_RULES.VERY_SLOW_RESPONSE_MS) {
      score -= 0.9;
    } else if (responseTimeMs >= CONFIDENCE_RULES.SLOW_RESPONSE_MS) {
      score -= 0.45;
    }
  }

  const directionalStrength = getDirectionalStrength(
    input.progress,
    input.direction,
    input.questionType,
  );
  if (directionalStrength >= CONFIDENCE_RULES.STRONG_DIRECTION_THRESHOLD) {
    score += 0.35;
  } else if (directionalStrength <= CONFIDENCE_RULES.WEAK_DIRECTION_THRESHOLD) {
    score -= 0.35;
  }

  const correctStreak = input.progress.correctStreak ?? 0;
  const wrongCount = input.progress.wrongCount ?? 0;

  if (correctStreak >= CONFIDENCE_RULES.STRONG_STREAK_THRESHOLD) {
    score += 0.25;
  } else if (
    correctStreak <= CONFIDENCE_RULES.WEAK_STREAK_THRESHOLD &&
    wrongCount >= CONFIDENCE_RULES.MEDIUM_WRONG_COUNT_THRESHOLD
  ) {
    score -= 0.25;
  }

  if (wrongCount >= CONFIDENCE_RULES.HIGH_WRONG_COUNT_THRESHOLD) {
    score -= 0.3;
  }

  const inferredConfidenceLevel = clamp(Math.round(score));
  return {
    inferredConfidenceLevel,
    effectiveConfidenceLevel: inferredConfidenceLevel,
    confidenceSource: QuizConfidenceSourceEnum.INFERRED,
  } as const;
}
