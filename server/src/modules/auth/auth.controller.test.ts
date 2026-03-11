import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { AuthApiController } from "./auth.controller";
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

test("AuthApiController.getAuthUser returns user when claims exist", async () => {
  const expected = {
    id: "u-1",
    email: "u1@example.com",
    firstName: "Aman",
    lastName: "Kori",
    profileImageUrl: null,
    role: "admin",
  };

  const authService = {
    async getAuthUser() {
      return expected;
    },
    async getProfile() {
      return null;
    },
    async updateProfile() {
      return null;
    },
  };

  const controller = new AuthApiController(authService as any);
  const { response, state } = createMockResponse();

  const request = {
    requestId: "req-1",
    user: {
      claims: {
        sub: "u-1",
        email: "u1@example.com",
      },
    },
  } as unknown as Request;

  await controller.getAuthUser(request, response);

  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-1", expected));
});

test("AuthApiController.getAuthUser returns 401 when auth claims are missing", async () => {
  let getAuthUserCalls = 0;
  const authService = {
    async getAuthUser() {
      getAuthUserCalls += 1;
      return null;
    },
    async getProfile() {
      return null;
    },
    async updateProfile() {
      return null;
    },
  };

  const controller = new AuthApiController(authService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-2",
    path: "/api/auth/me",
    method: "GET",
  } as unknown as Request;

  await controller.getAuthUser(request, response);

  assert.equal(getAuthUserCalls, 0);
  assert.equal(state.statusCode, 401);
  assert.deepEqual(state.body, error("req-2", "UNAUTHORIZED", "Unauthorized"));
});

test("AuthApiController.getAuthUser maps AppError from service", async () => {
  const authService = {
    async getAuthUser() {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    },
    async getProfile() {
      return null;
    },
    async updateProfile() {
      return null;
    },
  };

  const controller = new AuthApiController(authService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-3",
    path: "/api/auth/me",
    method: "GET",
    user: {
      claims: {
        sub: "u-3",
      },
    },
  } as unknown as Request;

  await controller.getAuthUser(request, response);

  assert.equal(state.statusCode, 401);
  assert.deepEqual(state.body, error("req-3", "UNAUTHORIZED", "Unauthorized"));
});

test("AuthApiController.getProfile returns 401 when session user id is missing", async () => {
  let getProfileCalls = 0;
  const authService = {
    async getAuthUser() {
      return null;
    },
    async getProfile() {
      getProfileCalls += 1;
      return null;
    },
    async updateProfile() {
      return null;
    },
  };

  const controller = new AuthApiController(authService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-4",
    path: "/api/auth/profile",
    method: "GET",
  } as unknown as Request;

  await controller.getProfile(request, response);

  assert.equal(getProfileCalls, 0);
  assert.equal(state.statusCode, 401);
  assert.deepEqual(state.body, error("req-4", "UNAUTHORIZED", "Unauthorized"));
});

test("AuthApiController.updateProfile forwards sanitized body to service", async () => {
  const expected = {
    id: "u-7",
    email: "learner@example.com",
    firstName: "Aman",
    lastName: "Kori",
    profileImageUrl: "https://example.com/a.png",
  };

  let receivedUserId: string | null = null;
  let receivedBody: unknown = null;
  const authService = {
    async getAuthUser() {
      return null;
    },
    async getProfile() {
      return null;
    },
    async updateProfile(userId: string, body: unknown) {
      receivedUserId = userId;
      receivedBody = body;
      return expected;
    },
  };

  const controller = new AuthApiController(authService as any);
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-5",
    path: "/api/auth/profile",
    method: "PATCH",
    user: {
      claims: {
        sub: "u-7",
      },
    },
  } as unknown as Request;

  const body = {
    firstName: "Aman",
    lastName: "Kori",
    profileImageUrl: "https://example.com/a.png",
  };

  await controller.updateProfile(request, response, body);

  assert.equal(receivedUserId, "u-7");
  assert.deepEqual(receivedBody, body);
  assert.equal(state.statusCode, 200);
  assert.deepEqual(state.body, success("req-5", expected));
});
