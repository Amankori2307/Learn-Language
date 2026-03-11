import test from "node:test";
import assert from "node:assert/strict";
import {
  LanguageEnum,
  QuizDirectionEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
} from "@shared/domain/enums";
import { QuizService } from "./quiz.service";
import { AppError } from "../../common/errors/app-error";

function makeWord(id: number) {
  return {
    id,
    language: LanguageEnum.TELUGU,
    originalScript: `word-${id}`,
    transliteration: `word-${id}`,
    english: `english-${id}`,
    partOfSpeech: "noun",
    difficulty: 1,
    difficultyLevel: "beginner",
    frequencyScore: 0.5,
    cefrLevel: null,
    audioUrl: null,
    imageUrl: null,
    exampleSentences: [`example-${id}`],
    tags: [],
    createdAt: null,
  };
}

test("QuizService.generateQuiz reseeds when initial candidate lookup is empty", async () => {
  let candidateCallCount = 0;
  let seeded = false;

  const repository = {
    async getQuizCandidates() {
      candidateCallCount += 1;
      return candidateCallCount === 1 ? [] : [makeWord(1)];
    },
    async seedInitialData() {
      seeded = true;
    },
    async getWords() {
      return [makeWord(1), makeWord(2), makeWord(3), makeWord(4)];
    },
    async getWordClusterLinks() {
      return [];
    },
    async getWord() {
      return null;
    },
    async getWordExamples() {
      return [];
    },
    async getActiveSrsConfig() {
      return { version: 1 };
    },
    async getUserWordProgress() {
      return null;
    },
    async createUserProgress() {
      return null;
    },
    async updateUserProgress() {},
    async logQuizAttempt() {},
  };

  const service = new QuizService(repository as any);
  const result = await service.generateQuiz({
    userId: "u-1",
    mode: QuizModeEnum.DAILY_REVIEW,
    count: 1,
    language: LanguageEnum.TELUGU,
  });

  assert.equal(seeded, true);
  assert.equal(candidateCallCount, 2);
  assert.equal(result.length, 1);
  assert.equal(result[0]?.wordId, 1);
});

test("QuizService.submitQuizAnswer rejects words outside selected language", async () => {
  const repository = {
    async getQuizCandidates() {
      return [];
    },
    async seedInitialData() {},
    async getWords() {
      return [];
    },
    async getWordClusterLinks() {
      return [];
    },
    async getWord() {
      return {
        ...makeWord(11),
        language: LanguageEnum.HINDI,
      };
    },
    async getWordExamples() {
      return [];
    },
    async getActiveSrsConfig() {
      return { version: 1 };
    },
    async getUserWordProgress() {
      return null;
    },
    async createUserProgress() {
      return null;
    },
    async updateUserProgress() {},
    async logQuizAttempt() {},
  };

  const service = new QuizService(repository as any);

  await assert.rejects(
    () =>
      service.submitQuizAnswer({
        userId: "u-1",
        payload: {
          wordId: 11,
          selectedOptionId: 11,
          language: LanguageEnum.TELUGU,
          questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
          direction: QuizDirectionEnum.SOURCE_TO_TARGET,
          confidenceLevel: 2,
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 404);
      assert.equal(error.code, "NOT_FOUND");
      return true;
    },
  );
});

test("QuizService.submitQuizAnswer creates progress, updates it, and logs attempt", async () => {
  let createdProgress = false;
  let updatedProgress: unknown = null;
  let loggedAttempt: unknown = null;

  const repository = {
    async getQuizCandidates() {
      return [];
    },
    async seedInitialData() {},
    async getWords() {
      return [];
    },
    async getWordClusterLinks() {
      return [];
    },
    async getWord() {
      return makeWord(21);
    },
    async getWordExamples() {
      return [
        {
          originalScript: "ఉదాహరణ",
          pronunciation: "udaaharana",
          englishSentence: "example sentence",
        },
      ];
    },
    async getActiveSrsConfig() {
      return {
        version: 1,
        initialEaseFactor: 2.5,
        correctIntervalMultiplier: 2,
        incorrectIntervalReset: 0,
        easyBonusMultiplier: 1.3,
        masteryThreshold: 5,
      };
    },
    async getUserWordProgress() {
      return null;
    },
    async createUserProgress(input: any) {
      createdProgress = true;
      return {
        ...input,
        id: 1,
        correctStreak: 0,
        wrongCount: 0,
        easeFactor: 2.5,
        interval: 0,
        masteryLevel: 0,
        sourceToTargetStrength: 0.5,
        targetToSourceStrength: 0.5,
        lastSeen: null,
        nextReview: null,
      };
    },
    async updateUserProgress(progress: unknown) {
      updatedProgress = progress;
    },
    async logQuizAttempt(input: unknown) {
      loggedAttempt = input;
    },
  };

  const service = new QuizService(repository as any);
  const result = await service.submitQuizAnswer({
    userId: "u-9",
    payload: {
      wordId: 21,
      selectedOptionId: 21,
      language: LanguageEnum.TELUGU,
      questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
      direction: QuizDirectionEnum.SOURCE_TO_TARGET,
      confidenceLevel: 3,
      responseTimeMs: 900,
    },
  });

  assert.equal(createdProgress, true);
  assert.ok(updatedProgress);
  assert.deepEqual(loggedAttempt, {
    userId: "u-9",
    wordId: 21,
    questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
    direction: QuizDirectionEnum.SOURCE_TO_TARGET,
    responseTimeMs: 900,
    isCorrect: true,
    confidenceLevel: 3,
  });
  assert.equal(result.isCorrect, true);
  assert.equal(result.correctAnswer.id, 21);
  assert.equal(result.examples[0]?.meaning, "example sentence");
  assert.equal(typeof result.progressUpdate.masteryLevel, "number");
});
