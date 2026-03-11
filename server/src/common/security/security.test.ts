import test from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import {
  createRateLimitMiddleware,
  expressErrorHandler,
  noStoreMiddleware,
  resetRateLimitStoreForTests,
  securityHeadersMiddleware,
  setStaticAssetSecurityHeaders,
} from "./security";

function createMockResponse() {
  const headers = new Map<string, string>();
  const state = {
    statusCode: 200,
    body: null as unknown,
    headers,
  };

  const response = {
    headersSent: false,
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      state.body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value);
      return this;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
  } as unknown as Response;

  return { response, state };
}

test("securityHeadersMiddleware applies the default hardening headers", () => {
  const { response, state } = createMockResponse();
  let nextCalled = false;

  securityHeadersMiddleware({} as Request, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(state.headers.get("x-content-type-options"), "nosniff");
  assert.equal(state.headers.get("x-frame-options"), "DENY");
  assert.equal(state.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(state.headers.get("cross-origin-opener-policy"), "same-origin");
});

test("noStoreMiddleware disables caching for sensitive responses", () => {
  const { response, state } = createMockResponse();

  noStoreMiddleware({} as Request, response, () => {});

  assert.equal(state.headers.get("cache-control"), "no-store");
  assert.equal(state.headers.get("pragma"), "no-cache");
  assert.equal(state.headers.get("expires"), "0");
});

test("createRateLimitMiddleware blocks requests after the configured threshold", () => {
  resetRateLimitStoreForTests();
  const middleware = createRateLimitMiddleware({
    key: "auth-test",
    windowMs: 60_000,
    maxRequests: 2,
    message: "Too many authentication requests. Please try again later.",
  });
  const request = {
    method: "POST",
    path: "/api/auth/google",
    requestId: "req-rate-limit",
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    headers: {},
  } as unknown as Request;

  const first = createMockResponse();
  let firstNextCalled = false;
  middleware(request, first.response, () => {
    firstNextCalled = true;
  });
  assert.equal(firstNextCalled, true);
  assert.equal(first.state.headers.get("x-ratelimit-remaining"), "1");

  const second = createMockResponse();
  let secondNextCalled = false;
  middleware(request, second.response, () => {
    secondNextCalled = true;
  });
  assert.equal(secondNextCalled, true);
  assert.equal(second.state.headers.get("x-ratelimit-remaining"), "0");

  const third = createMockResponse();
  let thirdNextCalled = false;
  middleware(request, third.response, () => {
    thirdNextCalled = true;
  });
  assert.equal(thirdNextCalled, false);
  assert.equal(third.state.statusCode, 429);
  assert.equal(third.state.headers.get("retry-after"), "60");
  assert.deepEqual(third.state.body, {
    success: false,
    error: true,
    data: null,
    code: "RATE_LIMITED",
    message: "Too many authentication requests. Please try again later.",
    requestId: "req-rate-limit",
  });
});

test("expressErrorHandler maps AppError to the canonical envelope", () => {
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-app-error",
    method: "GET",
    path: "/api/profile",
  } as unknown as Request;
  let nextCalled = false;

  expressErrorHandler(
    new AppError(403, "FORBIDDEN", "Reviewer access required"),
    request,
    response,
    (() => {
      nextCalled = true;
    }) as NextFunction,
  );

  assert.equal(nextCalled, false);
  assert.equal(state.statusCode, 403);
  assert.deepEqual(state.body, {
    success: false,
    error: true,
    data: null,
    code: "FORBIDDEN",
    message: "Reviewer access required",
    requestId: "req-app-error",
  });
});

test("expressErrorHandler normalizes rejected CORS requests", () => {
  const { response, state } = createMockResponse();
  const request = {
    requestId: "req-cors",
    method: "GET",
    path: "/api/auth/me",
  } as unknown as Request;

  expressErrorHandler(new Error("Origin http://evil.test is not allowed by CORS"), request, response, (() => {}) as NextFunction);

  assert.equal(state.statusCode, 403);
  assert.deepEqual(state.body, {
    success: false,
    error: true,
    data: null,
    code: "FORBIDDEN",
    message: "Origin is not allowed",
    requestId: "req-cors",
  });
});

test("setStaticAssetSecurityHeaders applies nosniff and immutable caching", () => {
  const { response, state } = createMockResponse();
  setStaticAssetSecurityHeaders(response);

  assert.equal(state.headers.get("x-content-type-options"), "nosniff");
  assert.equal(state.headers.get("cache-control"), "public, max-age=31536000, immutable");
});
