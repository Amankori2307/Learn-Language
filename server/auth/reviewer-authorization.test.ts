import test from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import { authStorage } from "./storage";
import { requireReviewer } from "./permissions";
import { UserTypeEnum } from "@shared/domain/enums";

type MinimalUser = {
  id: string;
  role: UserTypeEnum;
};

function withMockedAuthStorage(
  map: Record<string, MinimalUser | undefined>,
  fn: () => Promise<void>,
) {
  const original = authStorage.getUser.bind(authStorage);
  (authStorage as any).getUser = async (id: string) => map[id];
  return fn().finally(() => {
    (authStorage as any).getUser = original;
  });
}

type MockResponse = {
  statusCode: number;
  payload: unknown;
};

async function runRequireReviewer(userId?: string): Promise<{
  response: MockResponse;
  nextCalled: boolean;
}> {
  const req = {
    user: userId ? { claims: { sub: userId } } : undefined,
    requestId: "test-req-id",
  } as unknown as Request;

  const responseState: MockResponse = {
    statusCode: 200,
    payload: undefined,
  };

  const res = {
    status(code: number) {
      responseState.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      responseState.payload = payload;
      return this;
    },
  } as unknown as Response;

  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await requireReviewer(req, res, next);
  return { response: responseState, nextCalled };
}

test("reviewer middleware blocks unauthenticated and learner users", async () => {
  await withMockedAuthStorage(
    {
      "learner-1": { id: "learner-1", role: UserTypeEnum.LEARNER },
    },
    async () => {
      const unauthenticated = await runRequireReviewer();
      assert.equal(unauthenticated.nextCalled, false);
      assert.equal(unauthenticated.response.statusCode, 403);

      const learner = await runRequireReviewer("learner-1");
      assert.equal(learner.nextCalled, false);
      assert.equal(learner.response.statusCode, 403);
    },
  );
});

test("reviewer middleware allows reviewer/admin and local dev bootstrap user", async () => {
  await withMockedAuthStorage(
    {
      "reviewer-1": { id: "reviewer-1", role: UserTypeEnum.REVIEWER },
      "admin-1": { id: "admin-1", role: UserTypeEnum.ADMIN },
    },
    async () => {
      const reviewer = await runRequireReviewer("reviewer-1");
      assert.equal(reviewer.nextCalled, true);

      const admin = await runRequireReviewer("admin-1");
      assert.equal(admin.nextCalled, true);

      const devUser = await runRequireReviewer("dev-user");
      assert.equal(devUser.nextCalled, true);
    },
  );
});
