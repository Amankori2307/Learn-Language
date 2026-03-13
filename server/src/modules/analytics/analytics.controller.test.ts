import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { AnalyticsApiController } from "./analytics.controller";
import { AppError } from "../../common/errors/app-error";
import { LanguageEnum } from "@shared/domain/enums";

type MockResponseState = {
  statusCode: number;
  body: unknown;
};

function createMockResponse() {
  const state: MockResponseState = {
    statusCode: 200,
    body: null,
  };

  const response = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      state.body = payload;
      return this;
    },
  } as unknown as Response;

  return { response, state };
}

function success<T>(requestId: string, data: T) {
  return {
    success: true,
    error: false,
    data,
    message: "OK",
    requestId,
  };
}

function error(requestId: string, code: string, message: string) {
  return {
    success: false,
    error: true,
    data: null,
    code,
    message,
    requestId,
  };
}

test("AnalyticsApiController.getLearningInsights forwards user id and language", async () => {
  let receivedUserId: string | null = null;
  let receivedLanguage: LanguageEnum | undefined;
  const expected = { clusters: [], categories: [], weakWords: [], strongWords: [] };

  const analyticsService = {
    async getStats() {
      return null;
    },
    async getLearningInsights(userId: string, language?: LanguageEnum) {
      receivedUserId = userId;
      receivedLanguage = language;
      return expected;
    },
    async getWordBucket() {
      return null;
    },
    async getAttemptHistory() {
      return [];
    },
    async getLeaderboard() {
      return { items: [], page: 1, limit: 25, total: 0, currentUserEntry: null };
    },
  };

  const controller = new AnalyticsApiController(analyticsService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-learning",
    user: { claims: { sub: "u-1" } },
  } as unknown as Request;

  await controller.getLearningInsights(request, response, { language: LanguageEnum.TELUGU });

  assert.equal(receivedUserId, "u-1");
  assert.equal(receivedLanguage, LanguageEnum.TELUGU);
  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-learning", expected));
});

test("AnalyticsApiController.getAttemptHistory maps AppError from service", async () => {
  const analyticsService = {
    async getStats() {
      return null;
    },
    async getLearningInsights() {
      return null;
    },
    async getWordBucket() {
      return null;
    },
    async getAttemptHistory() {
      throw new AppError(400, "VALIDATION_ERROR", "Bad query");
    },
    async getLeaderboard() {
      return { items: [], page: 1, limit: 25, total: 0, currentUserEntry: null };
    },
  };

  const controller = new AnalyticsApiController(analyticsService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-history",
    path: "/api/attempts/history",
    method: "GET",
    user: { claims: { sub: "u-2" } },
  } as unknown as Request;

  await controller.getAttemptHistory(request, response, { limit: 10, language: LanguageEnum.TELUGU });

  assert.equal(state.statusCode, 400);
  assert.deepEqual(state.body, error("req-history", "VALIDATION_ERROR", "Bad query"));
});
