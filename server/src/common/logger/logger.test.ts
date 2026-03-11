import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { buildHttpRequestLogEntry, redactLogValue, safeJsonStringify } from "./logger";

test("redactLogValue masks sensitive keys recursively", () => {
  const payload = {
    authorization: "Bearer secret-token",
    cookie: "session=abc",
    nested: {
      jwtSecret: "super-secret",
      safe: "value",
    },
  };

  const result = redactLogValue(payload) as Record<string, unknown>;
  assert.equal(result.authorization, "[redacted]");
  assert.equal(result.cookie, "[redacted]");
  assert.deepEqual(result.nested, {
    jwtSecret: "[redacted]",
    safe: "value",
  });
});

test("safeJsonStringify handles circular structures", () => {
  const payload: { self?: unknown; message: string } = { message: "hello" };
  payload.self = payload;

  const result = safeJsonStringify(payload);
  assert.match(result, /"\[circular\]"/);
});

test("buildHttpRequestLogEntry extracts request and response metadata", () => {
  const request = {
    requestId: "req-123",
    method: "GET",
    path: "/api/auth/me",
    originalUrl: "/api/auth/me?foo=bar",
    ip: "::1",
    user: {
      claims: {
        sub: "user-1",
      },
    },
  } as unknown as Request;

  const response = {
    statusCode: 200,
    getHeader(name: string) {
      return name === "content-length" ? "128" : null;
    },
  } as unknown as Response;

  assert.deepEqual(buildHttpRequestLogEntry(request, response, 12.3456), {
    event: "http.request.completed",
    requestId: "req-123",
    method: "GET",
    path: "/api/auth/me",
    url: "/api/auth/me?foo=bar",
    statusCode: 200,
    durationMs: 12.35,
    contentLength: "128",
    userId: "user-1",
    ip: "::1",
  });
});
