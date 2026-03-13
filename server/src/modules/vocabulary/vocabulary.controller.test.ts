import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { VocabularyApiController } from "./vocabulary.controller";
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

test("VocabularyApiController.listClusters forwards language query", async () => {
  let receivedInput: unknown = null;
  const expected = {
    items: [{ id: 1, name: "Travel", wordCount: 14 }],
    page: 1,
    limit: 12,
    total: 1,
    availableTypes: ["all", "topic"],
    summary: {
      totalWords: 14,
      nonEmptyClusters: 1,
      topCluster: { id: 1, name: "Travel", wordCount: 14 },
    },
  };

  const vocabularyService = {
    async listWords() {
      return [];
    },
    async getWord() {
      return null;
    },
    async listClusters(input: unknown) {
      receivedInput = input;
      return expected;
    },
    async getCluster() {
      return null;
    },
  };

  const controller = new VocabularyApiController(vocabularyService as any);
  const { response, state } = createMockResponse();
  const request = { requestId: "req-clusters" } as unknown as Request;

  await controller.listClusters(request, response, { language: LanguageEnum.TELUGU, page: 1 });

  assert.deepEqual(receivedInput, { language: LanguageEnum.TELUGU, page: 1 });
  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-clusters", expected));
});

test("VocabularyApiController.getCluster maps not found errors", async () => {
  const vocabularyService = {
    async listWords() {
      return [];
    },
    async getWord() {
      return null;
    },
    async listClusters() {
      return [];
    },
    async getCluster() {
      throw new AppError(404, "NOT_FOUND", "Cluster not found");
    },
  };

  const controller = new VocabularyApiController(vocabularyService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-cluster-detail",
    path: "/api/clusters/99",
    method: "GET",
  } as unknown as Request;

  await controller.getCluster(request, response, 99, { language: LanguageEnum.TELUGU });

  assert.equal(state.statusCode, 404);
  assert.deepEqual(state.body, error("req-cluster-detail", "NOT_FOUND", "Cluster not found"));
});
