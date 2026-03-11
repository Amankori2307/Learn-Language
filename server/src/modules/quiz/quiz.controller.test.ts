import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import {
  LanguageEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
} from "@shared/domain/enums";
import { QuizApiController } from "./quiz.controller";
import { AppError } from "../../common/errors/app-error";

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

test("QuizApiController.generateQuiz forwards user id and query to service", async () => {
  let receivedInput: unknown = null;
  const expected = [
    {
      wordId: 11,
      type: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
      questionText: "నమస్తే",
      options: [{ id: 11, text: "hello" }],
    },
  ];

  const quizService = {
    async generateQuiz(input: unknown) {
      receivedInput = input;
      return expected;
    },
    async submitQuizAnswer() {
      return null;
    },
  };

  const controller = new QuizApiController(quizService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-generate",
    user: { claims: { sub: "u-1" } },
  } as unknown as Request;

  await controller.generateQuiz(
    request,
    response,
    {
      mode: QuizModeEnum.DAILY_REVIEW,
      count: 3,
      language: LanguageEnum.TELUGU,
    } as any,
  );

  assert.deepEqual(receivedInput, {
    userId: "u-1",
    mode: QuizModeEnum.DAILY_REVIEW,
    clusterId: undefined,
    count: 3,
    language: LanguageEnum.TELUGU,
  });
  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-generate", expected));
});

test("QuizApiController.submitQuizAnswer forwards payload and user id", async () => {
  let receivedInput: unknown = null;
  const expected = {
    isCorrect: true,
    correctAnswer: { id: 11 },
    examples: [],
    progressUpdate: { streak: 1, masteryLevel: 1, nextReview: "2026-03-11T00:00:00.000Z" },
  };

  const quizService = {
    async generateQuiz() {
      return [];
    },
    async submitQuizAnswer(input: unknown) {
      receivedInput = input;
      return expected;
    },
  };

  const controller = new QuizApiController(quizService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-submit",
    user: { claims: { sub: "u-2" } },
  } as unknown as Request;
  const body = {
    wordId: 11,
    selectedOptionId: 11,
    language: LanguageEnum.TELUGU,
    questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
    confidenceLevel: 2,
    responseTimeMs: 1200,
  };

  await controller.submitQuizAnswer(request, response, body as any);

  assert.deepEqual(receivedInput, {
    userId: "u-2",
    payload: body,
  });
  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-submit", expected));
});

test("QuizApiController.generateQuiz maps AppError from service", async () => {
  const quizService = {
    async generateQuiz() {
      throw new AppError(400, "VALIDATION_ERROR", "Bad quiz request");
    },
    async submitQuizAnswer() {
      return null;
    },
  };

  const controller = new QuizApiController(quizService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-error",
    path: "/api/quiz/generate",
    method: "GET",
    user: { claims: { sub: "u-3" } },
  } as unknown as Request;

  await controller.generateQuiz(request, response, {} as any);

  assert.equal(state.statusCode, 400);
  assert.deepEqual(state.body, error("req-error", "VALIDATION_ERROR", "Bad quiz request"));
});
