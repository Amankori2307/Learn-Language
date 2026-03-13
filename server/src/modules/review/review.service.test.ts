import test from "node:test";
import assert from "node:assert/strict";
import { ReviewService } from "./review.service";
import { AppError } from "../../common/errors/app-error";
import {
  LanguageEnum,
  PartOfSpeechEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
} from "@shared/domain/enums";

test("ReviewService.getQueue normalizes nullable review fields", async () => {
  const repository = {
    async getReviewQueue() {
      return {
        items: [
          {
            id: 11,
            language: LanguageEnum.TELUGU,
            originalScript: "నమస్తే",
            transliteration: "namaste",
            english: "hello",
            partOfSpeech: PartOfSpeechEnum.PHRASE,
            reviewStatus: ReviewStatusEnum.PENDING_REVIEW,
            sourceCapturedAt: new Date("2026-03-10T10:00:00.000Z"),
            submittedAt: new Date("2026-03-10T10:00:00.000Z"),
            reviewedAt: null,
            createdAt: new Date("2026-03-09T10:00:00.000Z"),
            reviewerConfidenceScore: null,
            requiresSecondaryReview: null,
            disagreementStatus: null,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };
    },
  };

  const service = new ReviewService(repository as any);
  const result = await service.getQueue({ status: ReviewStatusEnum.PENDING_REVIEW, limit: 10 });

  assert.equal(result.items[0]?.sourceCapturedAt, "2026-03-10T10:00:00.000Z");
  assert.equal(result.items[0]?.reviewedAt, null);
  assert.equal(result.items[0]?.reviewerConfidenceScore, null);
  assert.equal(result.items[0]?.requiresSecondaryReview, false);
  assert.equal(result.items[0]?.disagreementStatus, ReviewDisagreementStatusEnum.NONE);
});

test("ReviewService.bulkTransition reports updated and skipped counts", async () => {
  let call = 0;
  const repository = {
    async transitionWordReview() {
      call += 1;
      return call === 1 ? { id: 11 } : null;
    },
  };

  const service = new ReviewService(repository as any);
  const result = await service.bulkTransition("reviewer-1", {
    ids: [11, 12],
    toStatus: ReviewStatusEnum.APPROVED,
  });

  assert.deepEqual(result, { updated: 1, skipped: 1 });
});

test("ReviewService.transition maps invalid payloads to validation errors", async () => {
  const repository = {
    async transitionWordReview() {
      return null;
    },
  };

  const service = new ReviewService(repository as any);

  await assert.rejects(
    () => service.transition(11, "reviewer-1", { toStatus: "not-a-real-status" }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      return true;
    },
  );
});

test("ReviewService.resolveConflict rejects invalid word ids", async () => {
  const repository = {
    async resolveWordReviewConflict() {
      return null;
    },
  };

  const service = new ReviewService(repository as any);

  await assert.rejects(
    () =>
      service.resolveConflict(0, "reviewer-1", {
        toStatus: ReviewStatusEnum.APPROVED,
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.equal(error.message, "Invalid word id");
      return true;
    },
  );
});
