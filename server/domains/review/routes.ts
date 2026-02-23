import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { ReviewDisagreementStatusEnum, ReviewStatusEnum } from "@shared/domain/enums";
import { isAuthenticated } from "../../auth";
import { requireReviewer } from "../../auth/permissions";
import { sendError } from "../../http";
import { storage } from "../../storage";

export function registerReviewRoutes(app: Express) {
  app.get(api.review.queue.path, isAuthenticated, requireReviewer, async (req, res) => {
    const parsed = api.review.queue.input?.parse(req.query) ?? { status: ReviewStatusEnum.PENDING_REVIEW, limit: 50 };
    const status = parsed.status ?? ReviewStatusEnum.PENDING_REVIEW;
    const limit = parsed.limit ?? 50;
    const queue = await storage.getReviewQueue(status, limit);
    res.json(
      queue.map((word) => ({
        ...word,
        sourceCapturedAt: word.sourceCapturedAt?.toISOString() ?? null,
        submittedAt: word.submittedAt?.toISOString() ?? null,
        reviewedAt: word.reviewedAt?.toISOString() ?? null,
        createdAt: word.createdAt?.toISOString() ?? null,
        reviewerConfidenceScore: word.reviewerConfidenceScore ?? null,
        requiresSecondaryReview: word.requiresSecondaryReview ?? false,
        disagreementStatus: word.disagreementStatus ?? ReviewDisagreementStatusEnum.NONE,
      })),
    );
  });

  app.get(api.review.conflicts.path, isAuthenticated, requireReviewer, async (req, res) => {
    const parsed = api.review.conflicts.input?.parse(req.query) ?? { limit: 50 };
    const limit = parsed.limit ?? 50;
    const queue = await storage.getConflictReviewQueue(limit);
    res.json(
      queue.map((word) => ({
        id: word.id,
        language: word.language,
        originalScript: word.originalScript,
        transliteration: word.transliteration,
        english: word.english,
        partOfSpeech: word.partOfSpeech,
        reviewStatus: word.reviewStatus,
        reviewerConfidenceScore: word.reviewerConfidenceScore ?? null,
        requiresSecondaryReview: word.requiresSecondaryReview ?? false,
        disagreementStatus: word.disagreementStatus ?? ReviewDisagreementStatusEnum.NONE,
        reviewNotes: word.reviewNotes ?? null,
        submittedAt: word.submittedAt?.toISOString() ?? null,
        reviewedAt: word.reviewedAt?.toISOString() ?? null,
      })),
    );
  });

  app.patch(api.review.transition.path, isAuthenticated, requireReviewer, async (req, res) => {
    const reviewerId = (req.user as any).claims.sub;
    const wordId = Number(req.params.id);
    if (!Number.isFinite(wordId) || wordId <= 0) {
      return sendError(req, res, 400, "VALIDATION_ERROR", "Invalid word id");
    }

    try {
      const parsed = api.review.transition.input.parse(req.body);
      const updated = await storage.transitionWordReview(wordId, reviewerId, parsed.toStatus, {
        notes: parsed.notes,
        reviewerConfidenceScore: parsed.reviewerConfidenceScore,
        requiresSecondaryReview: parsed.requiresSecondaryReview,
        disagreementStatus: parsed.disagreementStatus,
      });
      if (!updated) {
        return sendError(req, res, 404, "NOT_FOUND", "Word not found");
      }
      res.json({
        id: updated.id,
        reviewStatus: updated.reviewStatus,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt?.toISOString() ?? null,
        reviewNotes: updated.reviewNotes ?? null,
        reviewerConfidenceScore: updated.reviewerConfidenceScore ?? null,
        requiresSecondaryReview: updated.requiresSecondaryReview ?? false,
        disagreementStatus: updated.disagreementStatus ?? ReviewDisagreementStatusEnum.NONE,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to update review status");
    }
  });

  app.patch(api.review.bulkTransition.path, isAuthenticated, requireReviewer, async (req, res) => {
    const reviewerId = (req.user as any).claims.sub;
    try {
      const parsed = api.review.bulkTransition.input.parse(req.body);
      let updated = 0;
      let skipped = 0;

      for (const id of parsed.ids) {
        const row = await storage.transitionWordReview(id, reviewerId, parsed.toStatus, {
          notes: parsed.notes,
          reviewerConfidenceScore: parsed.reviewerConfidenceScore,
          requiresSecondaryReview: parsed.requiresSecondaryReview,
          disagreementStatus: parsed.disagreementStatus,
        });
        if (row) {
          updated += 1;
        } else {
          skipped += 1;
        }
      }

      res.json({ updated, skipped });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to bulk update review status");
    }
  });

  app.patch(api.review.resolveConflict.path, isAuthenticated, requireReviewer, async (req, res) => {
    const reviewerId = (req.user as any).claims.sub;
    const wordId = Number(req.params.id);
    if (!Number.isFinite(wordId) || wordId <= 0) {
      return sendError(req, res, 400, "VALIDATION_ERROR", "Invalid word id");
    }

    try {
      const parsed = api.review.resolveConflict.input.parse(req.body);
      const updated = await storage.resolveWordReviewConflict(wordId, reviewerId, {
        toStatus: parsed.toStatus,
        notes: parsed.notes,
        reviewerConfidenceScore: parsed.reviewerConfidenceScore,
      });
      if (!updated) {
        return sendError(req, res, 400, "VALIDATION_ERROR", "Word is not in conflict state");
      }
      res.json({
        id: updated.id,
        reviewStatus: updated.reviewStatus,
        reviewerConfidenceScore: updated.reviewerConfidenceScore ?? null,
        requiresSecondaryReview: updated.requiresSecondaryReview ?? false,
        disagreementStatus: updated.disagreementStatus ?? ReviewDisagreementStatusEnum.NONE,
        reviewNotes: updated.reviewNotes ?? null,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt?.toISOString() ?? null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to resolve conflict");
    }
  });

  app.get(api.review.history.path, isAuthenticated, requireReviewer, async (req, res) => {
    const wordId = Number(req.params.id);
    if (!Number.isFinite(wordId) || wordId <= 0) {
      return sendError(req, res, 400, "VALIDATION_ERROR", "Invalid word id");
    }

    const result = await storage.getWordWithReviewHistory(wordId);
    if (!result) {
      return sendError(req, res, 404, "NOT_FOUND", "Word not found");
    }

    res.json({
      word: {
        id: result.word.id,
        language: result.word.language,
        originalScript: result.word.originalScript,
        transliteration: result.word.transliteration,
        english: result.word.english,
        reviewStatus: result.word.reviewStatus,
        sourceUrl: result.word.sourceUrl ?? null,
        sourceCapturedAt: result.word.sourceCapturedAt?.toISOString() ?? null,
        reviewNotes: result.word.reviewNotes ?? null,
        reviewerConfidenceScore: result.word.reviewerConfidenceScore ?? null,
        requiresSecondaryReview: result.word.requiresSecondaryReview ?? false,
        disagreementStatus: result.word.disagreementStatus ?? ReviewDisagreementStatusEnum.NONE,
      },
      clusters: result.clusters,
      relatedClusterWords: result.relatedClusterWords,
      events: result.events.map((e) => ({
        id: e.id,
        fromStatus: e.fromStatus,
        toStatus: e.toStatus,
        changedBy: e.changedBy,
        notes: e.notes ?? null,
        sourceUrl: e.sourceUrl ?? null,
        sourceCapturedAt: e.sourceCapturedAt?.toISOString() ?? null,
        createdAt: e.createdAt?.toISOString() ?? null,
      })),
    });
  });

  app.post(api.review.submitDraft.path, isAuthenticated, async (req, res) => {
    const submittedBy = (req.user as any).claims.sub;
    try {
      const parsed = api.review.submitDraft.input.parse(req.body);
      const created = await storage.createWordDraft({
        submittedBy,
        language: parsed.language,
        originalScript: parsed.originalScript,
        pronunciation: parsed.pronunciation ?? parsed.transliteration ?? "",
        english: parsed.english,
        partOfSpeech: parsed.partOfSpeech,
        audioUrl: parsed.audioUrl,
        imageUrl: parsed.imageUrl,
        sourceUrl: parsed.sourceUrl,
        tags: parsed.tags,
        clusterIds: parsed.clusterIds,
        examples: parsed.examples,
      });
      res.json({
        id: created.word.id,
        reviewStatus: ReviewStatusEnum.DRAFT,
        examplesCreated: created.examplesCreated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to create draft");
    }
  });
}
