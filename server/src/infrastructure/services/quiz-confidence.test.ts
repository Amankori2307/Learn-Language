import test from "node:test";
import assert from "node:assert/strict";
import {
  QuizConfidenceSourceEnum,
  QuizDirectionEnum,
  QuizQuestionTypeEnum,
} from "@shared/domain/enums";
import { inferQuizConfidence } from "./quiz-confidence";

const baseProgress = {
  userId: "u-1",
  wordId: 42,
  correctStreak: 2,
  wrongCount: 0,
  easeFactor: 2.5,
  interval: 6,
  srsConfigVersion: "v1",
  sourceToTargetStrength: 0.5,
  targetToSourceStrength: 0.5,
  lastSeen: null,
  nextReview: null,
  masteryLevel: 1,
};

test("inferQuizConfidence clamps incorrect answers to low confidence", () => {
  const inferred = inferQuizConfidence({
    isCorrect: false,
    progress: { ...baseProgress } as any,
    responseTimeMs: 900,
    direction: QuizDirectionEnum.SOURCE_TO_TARGET,
  });

  assert.deepEqual(inferred, {
    inferredConfidenceLevel: 1,
    effectiveConfidenceLevel: 1,
    confidenceSource: QuizConfidenceSourceEnum.INFERRED,
  });
});

test("inferQuizConfidence rewards fast, strong correct recall", () => {
  const inferred = inferQuizConfidence({
    isCorrect: true,
    progress: {
      ...baseProgress,
      correctStreak: 5,
      sourceToTargetStrength: 0.82,
    } as any,
    responseTimeMs: 1800,
    direction: QuizDirectionEnum.SOURCE_TO_TARGET,
    questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
  });

  assert.equal(inferred.inferredConfidenceLevel, 3);
  assert.equal(inferred.effectiveConfidenceLevel, 3);
  assert.equal(inferred.confidenceSource, QuizConfidenceSourceEnum.INFERRED);
});

test("inferQuizConfidence softens slow answers with weak history", () => {
  const inferred = inferQuizConfidence({
    isCorrect: true,
    progress: {
      ...baseProgress,
      correctStreak: 0,
      wrongCount: 5,
      targetToSourceStrength: 0.24,
    } as any,
    responseTimeMs: 15000,
    direction: QuizDirectionEnum.TARGET_TO_SOURCE,
    questionType: QuizQuestionTypeEnum.TARGET_TO_SOURCE,
  });

  assert.equal(inferred.inferredConfidenceLevel, 1);
  assert.equal(inferred.effectiveConfidenceLevel, 1);
});
