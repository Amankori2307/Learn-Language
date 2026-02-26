import type { UserWordProgress } from "../schema";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { SRS_DEFAULT_CONFIG, SRS_EASE_UPDATE, SRS_MASTERY_RULES, SRS_QUALITY_RULES, SRS_STRENGTH_RULES } from "./srs.constants";
import { runWithLifecycle } from "../../common/logger/logger";

export type SrsInput = {
  progress: UserWordProgress;
  isCorrect: boolean;
  confidenceLevel: number;
  responseTimeMs?: number;
  direction?: QuizDirectionEnum;
  now?: Date;
  config?: {
    version: string;
    easeMin: number;
    easeMax: number;
    incorrectEasePenalty: number;
  };
};

function clamp(value: number, min: number, max: number) {
  return runWithLifecycle("srs.clamp", () => Math.min(max, Math.max(min, value)));
}

function computeQuality(isCorrect: boolean, confidenceLevel: number, responseTimeMs?: number) {
  return runWithLifecycle("srs.computeQuality", () => {
    if (!isCorrect) return SRS_QUALITY_RULES.INCORRECT_QUALITY;

    let quality = SRS_QUALITY_RULES.BASE_QUALITY;
    if (confidenceLevel >= SRS_QUALITY_RULES.HIGH_CONFIDENCE_THRESHOLD) {
      quality += SRS_QUALITY_RULES.HIGH_CONFIDENCE_BONUS;
    }
    if (confidenceLevel <= SRS_QUALITY_RULES.LOW_CONFIDENCE_THRESHOLD) {
      quality -= SRS_QUALITY_RULES.LOW_CONFIDENCE_PENALTY;
    }

    if (typeof responseTimeMs === "number") {
      if (responseTimeMs <= SRS_QUALITY_RULES.FAST_RESPONSE_MS_THRESHOLD) {
        quality += SRS_QUALITY_RULES.FAST_RESPONSE_BONUS;
      }
      if (responseTimeMs >= SRS_QUALITY_RULES.SLOW_RESPONSE_MS_THRESHOLD) {
        quality -= SRS_QUALITY_RULES.SLOW_RESPONSE_PENALTY;
      }
    }

    return clamp(Math.round(quality), SRS_QUALITY_RULES.QUALITY_MIN, SRS_QUALITY_RULES.QUALITY_MAX);
  });
}

function toMasteryLevel(streak: number) {
  return runWithLifecycle("srs.toMasteryLevel", () => {
    if (streak >= SRS_MASTERY_RULES.LEVEL_4_STREAK_MIN) return 4;
    if (streak >= SRS_MASTERY_RULES.LEVEL_3_STREAK_MIN) return 3;
    if (streak >= SRS_MASTERY_RULES.LEVEL_2_STREAK_MIN) return 2;
    if (streak >= SRS_MASTERY_RULES.LEVEL_1_STREAK_MIN) return 1;
    return 0;
  });
}

function updateStrength(current: number | null | undefined, isCorrect: boolean, confidenceLevel: number) {
  return runWithLifecycle("srs.updateStrength", () => {
    const base = isCorrect
      ? SRS_STRENGTH_RULES.CORRECT_BASE_ADJUSTMENT
      : SRS_STRENGTH_RULES.INCORRECT_BASE_ADJUSTMENT;
    const confidenceDelta = confidenceLevel - SRS_STRENGTH_RULES.CONFIDENCE_BASELINE;
    const confidenceAdjustment = isCorrect
      ? confidenceDelta * SRS_STRENGTH_RULES.CORRECT_CONFIDENCE_SCALE
      : confidenceDelta * SRS_STRENGTH_RULES.INCORRECT_CONFIDENCE_SCALE;
    return clamp(
      (current ?? SRS_STRENGTH_RULES.DEFAULT_STRENGTH) + base + confidenceAdjustment,
      SRS_STRENGTH_RULES.MIN_STRENGTH,
      SRS_STRENGTH_RULES.MAX_STRENGTH,
    );
  });
}

export function applySrsUpdate(input: SrsInput): UserWordProgress {
  return runWithLifecycle("applySrsUpdate", () => {
    const now = input.now ?? new Date();
    const next = { ...input.progress };
    const config = input.config ?? {
      version: SRS_DEFAULT_CONFIG.VERSION,
      easeMin: SRS_DEFAULT_CONFIG.EASE_MIN,
      easeMax: SRS_DEFAULT_CONFIG.EASE_MAX,
      incorrectEasePenalty: SRS_DEFAULT_CONFIG.INCORRECT_EASE_PENALTY,
    };
    const quality = computeQuality(input.isCorrect, input.confidenceLevel, input.responseTimeMs);

  const currentEase = next.easeFactor ?? SRS_DEFAULT_CONFIG.DEFAULT_EASE;
  const currentInterval = next.interval ?? SRS_DEFAULT_CONFIG.DEFAULT_INTERVAL_DAYS;

  if (quality < SRS_DEFAULT_CONFIG.QUALITY_PASS_THRESHOLD) {
    next.correctStreak = 0;
    next.wrongCount = (next.wrongCount ?? 0) + 1;
    next.interval = SRS_DEFAULT_CONFIG.DEFAULT_INTERVAL_DAYS;
    next.easeFactor = clamp(currentEase - config.incorrectEasePenalty, config.easeMin, config.easeMax);
  } else {
    next.correctStreak = (next.correctStreak ?? 0) + 1;

    // SM-2 inspired ease factor update with quality score.
    const updatedEase =
      currentEase +
      (SRS_EASE_UPDATE.BASE_INCREMENT -
        (SRS_EASE_UPDATE.QUALITY_OFFSET - quality) *
          (SRS_EASE_UPDATE.PRIMARY_FACTOR +
            (SRS_EASE_UPDATE.QUALITY_OFFSET - quality) * SRS_EASE_UPDATE.SECONDARY_FACTOR));
    next.easeFactor = clamp(updatedEase, config.easeMin, config.easeMax);

    if (next.correctStreak === SRS_MASTERY_RULES.LEVEL_1_STREAK_MIN) {
      next.interval = SRS_DEFAULT_CONFIG.DEFAULT_INTERVAL_DAYS;
    } else if (next.correctStreak === SRS_MASTERY_RULES.SECOND_STREAK_STEP) {
      next.interval = SRS_DEFAULT_CONFIG.SECOND_INTERVAL_DAYS;
    } else {
      next.interval = Math.max(
        SRS_DEFAULT_CONFIG.DEFAULT_INTERVAL_DAYS,
        Math.round(currentInterval * (next.easeFactor ?? SRS_DEFAULT_CONFIG.DEFAULT_EASE)),
      );
    }
  }

  next.masteryLevel = toMasteryLevel(next.correctStreak ?? 0);
  next.srsConfigVersion = config.version;

  if (input.direction === QuizDirectionEnum.SOURCE_TO_TARGET) {
    next.sourceToTargetStrength = updateStrength(next.sourceToTargetStrength, input.isCorrect, input.confidenceLevel);
  } else if (input.direction === QuizDirectionEnum.TARGET_TO_SOURCE) {
    next.targetToSourceStrength = updateStrength(next.targetToSourceStrength, input.isCorrect, input.confidenceLevel);
  } else {
    // Fallback for legacy submissions without direction metadata.
    next.sourceToTargetStrength = updateStrength(next.sourceToTargetStrength, input.isCorrect, input.confidenceLevel);
    next.targetToSourceStrength = updateStrength(next.targetToSourceStrength, input.isCorrect, input.confidenceLevel);
  }

  next.lastSeen = now;

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + (next.interval ?? SRS_DEFAULT_CONFIG.DEFAULT_INTERVAL_DAYS));
  next.nextReview = nextReview;

    return next;
  });
}
