import type { UserWordProgress } from "../schema";
import { QuizDirectionEnum } from "@shared/domain/enums";

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
  return Math.min(max, Math.max(min, value));
}

function computeQuality(isCorrect: boolean, confidenceLevel: number, responseTimeMs?: number) {
  if (!isCorrect) return 1;

  let quality = 3;
  if (confidenceLevel >= 3) quality += 1;
  if (confidenceLevel <= 1) quality -= 0.5;

  if (typeof responseTimeMs === "number") {
    if (responseTimeMs <= 3000) quality += 0.5;
    if (responseTimeMs >= 10000) quality -= 0.5;
  }

  return clamp(Math.round(quality), 0, 5);
}

function toMasteryLevel(streak: number) {
  if (streak >= 7) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1;
  return 0;
}

function updateStrength(current: number | null | undefined, isCorrect: boolean, confidenceLevel: number) {
  const base = isCorrect ? 0.12 : -0.18;
  const confidenceAdjustment = isCorrect ? (confidenceLevel - 2) * 0.04 : (confidenceLevel - 2) * 0.02;
  return clamp((current ?? 0.5) + base + confidenceAdjustment, 0, 1);
}

export function applySrsUpdate(input: SrsInput): UserWordProgress {
  const now = input.now ?? new Date();
  const next = { ...input.progress };
  const config = input.config ?? {
    version: "v1",
    easeMin: 1.3,
    easeMax: 3.0,
    incorrectEasePenalty: 0.2,
  };
  const quality = computeQuality(input.isCorrect, input.confidenceLevel, input.responseTimeMs);

  const currentEase = next.easeFactor ?? 2.5;
  const currentInterval = next.interval ?? 1;

  if (quality < 3) {
    next.correctStreak = 0;
    next.wrongCount = (next.wrongCount ?? 0) + 1;
    next.interval = 1;
    next.easeFactor = clamp(currentEase - config.incorrectEasePenalty, config.easeMin, config.easeMax);
  } else {
    next.correctStreak = (next.correctStreak ?? 0) + 1;

    // SM-2 inspired ease factor update with quality score.
    const updatedEase =
      currentEase +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    next.easeFactor = clamp(updatedEase, config.easeMin, config.easeMax);

    if (next.correctStreak === 1) {
      next.interval = 1;
    } else if (next.correctStreak === 2) {
      next.interval = 6;
    } else {
      next.interval = Math.max(1, Math.round(currentInterval * (next.easeFactor ?? 2.5)));
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
  nextReview.setDate(nextReview.getDate() + (next.interval ?? 1));
  next.nextReview = nextReview;

  return next;
}
