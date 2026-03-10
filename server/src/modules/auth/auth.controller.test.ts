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
  assert.deepEqual(state.body, expected);
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
    path: "/auth/me",
    method: "GET",
  } as unknown as Request;

  await controller.getAuthUser(request, response);

  assert.equal(getAuthUserCalls, 0);
  assert.equal(state.statusCode, 401);
  assert.deepEqual(state.body, {
    code: "UNAUTHORIZED",
    message: "Unauthorized",
    requestId: "req-2",
  });
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
    path: "/auth/me",
    method: "GET",
    user: {
      claims: {
        sub: "u-3",
      },
    },
  } as unknown as Request;

  await controller.getAuthUser(request, response);

  assert.equal(state.statusCode, 401);
  assert.deepEqual(state.body, {
    code: "UNAUTHORIZED",
    message: "Unauthorized",
    requestId: "req-3",
  });
});
