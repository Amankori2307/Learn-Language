import test from "node:test";
import assert from "node:assert/strict";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import { ReviewDisagreementStatusEnum, ReviewStatusEnum, UserTypeEnum, LanguageEnum } from "@shared/domain/enums";
import { users, words, wordReviewEvents } from "@shared/schema";

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

test("review conflict workflow resolves disagreement with audit history", async (t) => {
  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "ECONNREFUSED" || code === "EPERM") {
      t.skip("Postgres is unavailable in current environment; skipping DB integration test");
      return;
    }
    throw error;
  }

  const reviewerA = buildId("p6-reviewer-a");
  const reviewerB = buildId("p6-reviewer-b");
  let createdWordId: number | null = null;

  try {
    await db.insert(users).values([
      {
        id: reviewerA,
        email: `${reviewerA}@example.com`,
        firstName: "Reviewer",
        lastName: "One",
        role: UserTypeEnum.REVIEWER,
      },
      {
        id: reviewerB,
        email: `${reviewerB}@example.com`,
        firstName: "Reviewer",
        lastName: "Two",
        role: UserTypeEnum.REVIEWER,
      },
    ]);

    const [createdWord] = await db
      .insert(words)
      .values({
        language: LanguageEnum.TELUGU,
        originalScript: `p6_conflict_${Date.now()}`,
        transliteration: "p6-conflict",
        english: "conflict word",
        partOfSpeech: "noun",
        difficulty: 1,
        difficultyLevel: "beginner",
        frequencyScore: 0.5,
        reviewStatus: ReviewStatusEnum.DRAFT,
        submittedBy: reviewerA,
      })
      .returning();
    createdWordId = createdWord.id;

    await storage.transitionWordReview(createdWordId, reviewerA, ReviewStatusEnum.PENDING_REVIEW, {
      notes: "Flagging for secondary review",
      reviewerConfidenceScore: 2,
      requiresSecondaryReview: true,
      disagreementStatus: ReviewDisagreementStatusEnum.FLAGGED,
    });

    const conflictQueueBefore = await storage.getConflictReviewQueue(20);
    assert.ok(conflictQueueBefore.some((word) => word.id === createdWordId));

    const resolved = await storage.resolveWordReviewConflict(createdWordId, reviewerB, {
      toStatus: ReviewStatusEnum.APPROVED,
      notes: "Resolved by secondary reviewer",
      reviewerConfidenceScore: 4,
    });
    assert.ok(resolved);
    assert.equal(resolved?.disagreementStatus, ReviewDisagreementStatusEnum.RESOLVED);
    assert.equal(resolved?.requiresSecondaryReview, false);

    const conflictQueueAfter = await storage.getConflictReviewQueue(20);
    assert.ok(!conflictQueueAfter.some((word) => word.id === createdWordId));

    const history = await storage.getWordWithReviewHistory(createdWordId);
    assert.ok(history);
    assert.equal(history?.word.disagreementStatus, ReviewDisagreementStatusEnum.RESOLVED);
    assert.ok((history?.events.length ?? 0) >= 2);
    assert.ok(history?.events.some((event) => (event.notes ?? "").startsWith("[conflict-resolved]")));
  } finally {
    if (createdWordId) {
      await db.delete(wordReviewEvents).where(eq(wordReviewEvents.wordId, createdWordId));
      await db.delete(words).where(eq(words.id, createdWordId));
    }
    await db.delete(users).where(inArray(users.id, [reviewerA, reviewerB]));
  }
});
