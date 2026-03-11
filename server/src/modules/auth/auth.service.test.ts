import test from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "./auth.service";
import { AppError } from "../../common/errors/app-error";
import { UserTypeEnum } from "@shared/domain/enums";

function createConfigService(overrides?: {
  reviewerEmails?: string[];
  adminEmails?: string[];
  throws?: boolean;
}) {
  return {
    getOrThrow() {
      if (overrides?.throws) {
        throw new Error("config missing");
      }
      return {
        reviewerEmails: new Set(overrides?.reviewerEmails ?? []),
        adminEmails: new Set(overrides?.adminEmails ?? []),
      };
    },
  };
}

test("AuthService.getAuthUser upserts a new user with role from config", async () => {
  let upsertedInput: unknown = null;

  const repository = {
    async getUser() {
      return null;
    },
    async upsertUser(input: unknown) {
      upsertedInput = input;
      return {
        ...(input as object),
        createdAt: null,
        updatedAt: null,
      };
    },
    async updateUserProfile() {
      return null;
    },
  };

  const service = new AuthService(
    repository as any,
    createConfigService({ reviewerEmails: ["reviewer@example.com"] }) as any,
  );

  const result = await service.getAuthUser({
    sub: "u-1",
    email: "reviewer@example.com",
    given_name: "Aman",
    family_name: "Kori",
    picture: "https://example.com/a.png",
  });

  assert.deepEqual(upsertedInput, {
    id: "u-1",
    email: "reviewer@example.com",
    firstName: "Aman",
    lastName: "Kori",
    profileImageUrl: "https://example.com/a.png",
    role: UserTypeEnum.REVIEWER,
  });
  assert.equal(result.role, UserTypeEnum.REVIEWER);
});

test("AuthService.getAuthUser falls back to claims-backed user when repository fails", async () => {
  const repository = {
    async getUser() {
      throw new Error("db down");
    },
    async upsertUser() {
      return null;
    },
    async updateUserProfile() {
      return null;
    },
  };

  const service = new AuthService(
    repository as any,
    createConfigService({ adminEmails: ["admin@example.com"] }) as any,
  );

  const result = await service.getAuthUser({
    sub: "u-2",
    email: "admin@example.com",
    given_name: "Smoke",
    family_name: "User",
    picture: "https://example.com/smoke.png",
  });

  assert.deepEqual(result, {
    id: "u-2",
    email: "admin@example.com",
    firstName: "Smoke",
    lastName: "User",
    profileImageUrl: "https://example.com/smoke.png",
    role: UserTypeEnum.ADMIN,
    createdAt: null,
    updatedAt: null,
  });
});

test("AuthService.getAuthUser backfills missing profile fields on existing user", async () => {
  let upsertedInput: unknown = null;
  const existingUser = {
    id: "u-3",
    email: null,
    firstName: null,
    lastName: null,
    profileImageUrl: null,
    role: UserTypeEnum.LEARNER,
    createdAt: null,
    updatedAt: null,
  };

  const repository = {
    async getUser() {
      return existingUser;
    },
    async upsertUser(input: unknown) {
      upsertedInput = input;
      return {
        ...existingUser,
        ...(input as object),
      };
    },
    async updateUserProfile() {
      return null;
    },
  };

  const service = new AuthService(
    repository as any,
    createConfigService({ reviewerEmails: ["reviewer@example.com"] }) as any,
  );

  await service.getAuthUser({
    sub: "u-3",
    email: "reviewer@example.com",
    given_name: "Aman",
    family_name: "Kori",
    picture: "https://example.com/backfill.png",
  });

  assert.deepEqual(upsertedInput, {
    id: "u-3",
    email: "reviewer@example.com",
    firstName: "Aman",
    lastName: "Kori",
    profileImageUrl: "https://example.com/backfill.png",
    role: UserTypeEnum.REVIEWER,
  });
});

test("AuthService.updateProfile maps invalid payload to validation error", async () => {
  const repository = {
    async getUser() {
      return null;
    },
    async upsertUser() {
      return null;
    },
    async updateUserProfile() {
      return null;
    },
  };

  const service = new AuthService(repository as any, createConfigService() as any);

  await assert.rejects(
    () => service.updateProfile("u-4", { firstName: 123 }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      return true;
    },
  );
});
