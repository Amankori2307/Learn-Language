import test from "node:test";
import assert from "node:assert/strict";
import { AnalyticsService } from "./analytics.service";
import { LanguageEnum } from "@shared/domain/enums";

test("AnalyticsService.getAttemptHistory falls back to parsed language and normalizes dates", async () => {
  let receivedUserId: string | null = null;
  let receivedLimit: number | null = null;
  let receivedLanguage: LanguageEnum | undefined;

  const repository = {
    async getUserStats() {
      return null;
    },
    async getLearningInsights() {
      return null;
    },
    async getWordBucket() {
      return null;
    },
    async getUserAttemptHistory(userId: string, limit: number, language?: LanguageEnum) {
      receivedUserId = userId;
      receivedLimit = limit;
      receivedLanguage = language;
      return [
        {
          id: 1,
          isCorrect: true,
          createdAt: new Date("2026-03-10T10:00:00.000Z"),
          word: { transliteration: "namaste", originalScript: "నమస్తే", english: "hello" },
        },
      ];
    },
    async getLeaderboard() {
      return [];
    },
  };

  const service = new AnalyticsService(repository as any);
  const result = await service.getAttemptHistory("u-1", {
    limit: -1,
    language: LanguageEnum.TELUGU,
  });

  assert.equal(receivedUserId, "u-1");
  assert.equal(receivedLimit, 100);
  assert.equal(receivedLanguage, LanguageEnum.TELUGU);
  assert.equal(result[0]?.createdAt, "2026-03-10T10:00:00.000Z");
});

test("AnalyticsService.getLeaderboard applies default window and limit", async () => {
  let receivedWindow: string | null = null;
  let receivedLimit: number | null = null;
  let receivedLanguage: LanguageEnum | undefined;

  const repository = {
    async getUserStats() {
      return null;
    },
    async getLearningInsights() {
      return null;
    },
    async getWordBucket() {
      return null;
    },
    async getUserAttemptHistory() {
      return [];
    },
    async getLeaderboard(window: string, limit: number, language?: LanguageEnum) {
      receivedWindow = window;
      receivedLimit = limit;
      receivedLanguage = language;
      return [];
    },
  };

  const service = new AnalyticsService(repository as any);
  await service.getLeaderboard({});

  assert.equal(receivedWindow, "weekly");
  assert.equal(receivedLimit, 25);
  assert.equal(receivedLanguage, undefined);
});

test("AnalyticsService.getWordBucket forwards parsed payload", async () => {
  let receivedUserId: string | null = null;
  let receivedInput: unknown = null;

  const repository = {
    async getUserStats() {
      return null;
    },
    async getLearningInsights() {
      return null;
    },
    async getWordBucket(userId: string, input: unknown) {
      receivedUserId = userId;
      receivedInput = input;
      return { title: "Learning", words: [] };
    },
    async getUserAttemptHistory() {
      return [];
    },
    async getLeaderboard() {
      return [];
    },
  };

  const service = new AnalyticsService(repository as any);
  await service.getWordBucket("u-9", {
    bucket: "learning",
    page: 2,
    limit: 15,
    language: LanguageEnum.HINDI,
  });

  assert.equal(receivedUserId, "u-9");
  assert.deepEqual(receivedInput, {
    bucket: "learning",
    page: 2,
    limit: 15,
    language: LanguageEnum.HINDI,
  });
});

test("AnalyticsService caches repeated leaderboard reads by normalized key", async () => {
  let leaderboardCalls = 0;

  const repository = {
    async getUserStats() {
      return null;
    },
    async getLearningInsights() {
      return null;
    },
    async getWordBucket() {
      return null;
    },
    async getUserAttemptHistory() {
      return [];
    },
    async getLeaderboard() {
      leaderboardCalls += 1;
      return [{ rank: 1, userId: "u-1" }];
    },
  };

  const service = new AnalyticsService(repository as any);
  const first = await service.getLeaderboard({});
  const second = await service.getLeaderboard({ window: "weekly", limit: 25 });

  assert.equal(leaderboardCalls, 1);
  assert.deepEqual(first, second);
});

test("AnalyticsService caches learning insights per user and language", async () => {
  let learningCalls = 0;

  const repository = {
    async getUserStats() {
      return null;
    },
    async getLearningInsights() {
      learningCalls += 1;
      return { clusters: [], categories: [], weakWords: [], strongWords: [] };
    },
    async getWordBucket() {
      return null;
    },
    async getUserAttemptHistory() {
      return [];
    },
    async getLeaderboard() {
      return [];
    },
  };

  const service = new AnalyticsService(repository as any);
  await service.getLearningInsights("u-1", LanguageEnum.TELUGU);
  await service.getLearningInsights("u-1", LanguageEnum.TELUGU);
  await service.getLearningInsights("u-1", LanguageEnum.HINDI);

  assert.equal(learningCalls, 2);
});
