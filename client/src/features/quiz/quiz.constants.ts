import { QuizModeEnum } from "@shared/domain/enums";

export const QUIZ_DEFAULT_CONFIDENCE_LEVEL = 2 as const;
export const QUIZ_RESPONSE_TIME_MIN_MS = 1;
export const QUIZ_WEAK_WORDS_THRESHOLD_PERCENT = 70;

export const QUIZ_NEXT_RECOMMENDATION_MODE = {
  LOW_ACCURACY: QuizModeEnum.WEAK_WORDS,
  DAILY_REVIEW_COMPLETE: QuizModeEnum.NEW_WORDS,
  DEFAULT: QuizModeEnum.DAILY_REVIEW,
} as const;
