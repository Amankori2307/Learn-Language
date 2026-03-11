import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { ReviewApiController } from "./review.controller";
import { AppError } from "../../common/errors/app-error";
import { LanguageEnum, PartOfSpeechEnum, ReviewStatusEnum } from "@shared/domain/enums";

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

test("ReviewApiController.bulkTransition forwards reviewer id and payload", async () => {
  let receivedReviewerId: string | null = null;
  let receivedBody: unknown = null;

  const reviewService = {
    async getQueue() {
      return [];
    },
    async getConflicts() {
      return [];
    },
    async transition() {
      return null;
    },
    async bulkTransition(reviewerId: string, body: unknown) {
      receivedReviewerId = reviewerId;
      receivedBody = body;
      return { updated: 2, skipped: 0 };
    },
    async resolveConflict() {
      return null;
    },
    async getHistory() {
      return null;
    },
    async submitDraft() {
      return null;
    },
  };

  const controller = new ReviewApiController(reviewService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-bulk",
    user: { claims: { sub: "reviewer-1" } },
  } as unknown as Request;
  const body = {
    ids: [11, 12],
    toStatus: ReviewStatusEnum.APPROVED,
    notes: "verified",
  };

  await controller.bulkTransition(request, response, body as any);

  assert.equal(receivedReviewerId, "reviewer-1");
  assert.deepEqual(receivedBody, body);
  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-bulk", { updated: 2, skipped: 0 }));
});

test("ReviewApiController.getHistory maps AppError from service", async () => {
  const reviewService = {
    async getQueue() {
      return [];
    },
    async getConflicts() {
      return [];
    },
    async transition() {
      return null;
    },
    async bulkTransition() {
      return null;
    },
    async resolveConflict() {
      return null;
    },
    async getHistory() {
      throw new AppError(404, "NOT_FOUND", "Word not found");
    },
    async submitDraft() {
      return null;
    },
  };

  const controller = new ReviewApiController(reviewService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-history",
    path: "/api/review/words/99/history",
    method: "GET",
  } as unknown as Request;

  await controller.getHistory(request, response, 99);

  assert.equal(state.statusCode, 404);
  assert.deepEqual(state.body, error("req-history", "NOT_FOUND", "Word not found"));
});

test("ReviewApiController.submitDraft forwards submitter id and body", async () => {
  let receivedSubmittedBy: string | null = null;
  let receivedBody: unknown = null;

  const reviewService = {
    async getQueue() {
      return [];
    },
    async getConflicts() {
      return [];
    },
    async transition() {
      return null;
    },
    async bulkTransition() {
      return null;
    },
    async resolveConflict() {
      return null;
    },
    async getHistory() {
      return null;
    },
    async submitDraft(submittedBy: string, body: unknown) {
      receivedSubmittedBy = submittedBy;
      receivedBody = body;
      return { id: 55, reviewStatus: ReviewStatusEnum.DRAFT, examplesCreated: 1 };
    },
  };

  const controller = new ReviewApiController(reviewService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-draft",
    user: { claims: { sub: "u-5" } },
  } as unknown as Request;
  const body = {
    language: LanguageEnum.TELUGU,
    originalScript: "నమస్తే",
    pronunciation: "namaste",
    english: "hello",
    partOfSpeech: PartOfSpeechEnum.PHRASE,
  };

  await controller.submitDraft(request, response, body as any);

  assert.equal(receivedSubmittedBy, "u-5");
  assert.deepEqual(receivedBody, body);
  assert.equal(state.statusCode, 201);
  assert.deepEqual(
    state.body,
    success("req-draft", { id: 55, reviewStatus: ReviewStatusEnum.DRAFT, examplesCreated: 1 }),
  );
});
