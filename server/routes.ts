import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./auth";
import { logApiEvent, sendError } from "./http";
import { chooseDistractors } from "./services/distractors";
import { applySrsUpdate } from "./services/srs";
import { requireReviewer } from "./auth/permissions";
import {
  LanguageEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
} from "@shared/domain/enums";

function formatPronunciationFirst(word: { transliteration?: string | null; originalScript: string }) {
  const transliteration = word.transliteration?.trim();
  if (!transliteration) {
    return word.originalScript;
  }
  return `${transliteration} (${word.originalScript})`;
}

function parseLanguage(value: unknown): LanguageEnum | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }
  return Object.values(LanguageEnum).includes(value as LanguageEnum) ? (value as LanguageEnum) : undefined;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === API ROUTES ===

  // Words List
  app.get(api.words.list.path, isAuthenticated, async (req, res) => {
    const parsed = api.words.list.input?.parse(req.query) ?? {};
    const words = await storage.getWords(parsed.limit ?? 100, parsed.language);
    res.json(words);
  });

  // Get Word
  app.get(api.words.get.path, isAuthenticated, async (req, res) => {
    const word = await storage.getWord(Number(req.params.id));
    if (!word) {
      return sendError(req, res, 404, "NOT_FOUND", "Word not found");
    }
    res.json(word);
  });

  // Clusters List
  app.get(api.clusters.list.path, isAuthenticated, async (req, res) => {
    const parsed = api.clusters.list.input?.parse(req.query) ?? {};
    const clusters = await storage.getClusters(parsed.language);
    res.json(clusters);
  });

  // Get Cluster
  app.get(api.clusters.get.path, isAuthenticated, async (req, res) => {
    const parsed = api.clusters.get.input?.parse(req.query) ?? {};
    const cluster = await storage.getCluster(Number(req.params.id), parsed.language);
    if (!cluster) {
      return sendError(req, res, 404, "NOT_FOUND", "Cluster not found");
    }
    res.json(cluster);
  });

  // Generate Quiz
  app.get(api.quiz.generate.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.quiz.generate.input?.parse(req.query) ?? { mode: QuizModeEnum.DAILY_REVIEW, count: 10 };
    const limit = parsed.count ?? 10;
    const clusterId = parsed.clusterId;
    const mode = parsed.mode ?? QuizModeEnum.DAILY_REVIEW;
    const language = parsed.language ?? parseLanguage(req.query.language);

    const candidates = await storage.getQuizCandidates(userId, limit, clusterId, mode, language);
    
    if (candidates.length === 0) {
      // If no words found, maybe seed data or return empty
      // Ideally we should always have words after seeding
      await storage.seedInitialData();
      // Retry once
      const retry = await storage.getQuizCandidates(userId, limit, clusterId, mode, language);
      if (retry.length === 0) return res.json([]); 
    }

    const allWords = await storage.getWords(500, language);
    const links = await storage.getWordClusterLinks();
    const clusterByWord = new Map<number, Set<number>>();
    for (const link of links) {
      const set = clusterByWord.get(link.wordId) ?? new Set<number>();
      set.add(link.clusterId);
      clusterByWord.set(link.wordId, set);
    }

    const quizQuestions = await Promise.all(candidates.map(async (word) => {
      const distractors = chooseDistractors({
        word,
        allWords,
        clusterByWord,
        count: 3,
      });

      const typePool = [QuizQuestionTypeEnum.SOURCE_TO_TARGET, QuizQuestionTypeEnum.TARGET_TO_SOURCE] as const;
      const type = typePool[Math.floor(Math.random() * typePool.length)];

      const questionText =
        type === QuizQuestionTypeEnum.SOURCE_TO_TARGET
          ? word.originalScript
          : word.english;
      
      const options = [word, ...distractors]
        .sort(() => 0.5 - Math.random())
        .map(w => ({
          id: w.id,
          text:
            type === QuizQuestionTypeEnum.SOURCE_TO_TARGET
              ? w.english
              : formatPronunciationFirst(w)
        }));

      return {
        wordId: word.id,
        type,
        questionText,
        pronunciation: type === QuizQuestionTypeEnum.SOURCE_TO_TARGET ? (word.transliteration ?? null) : null,
        audioUrl: word.audioUrl,
        options,
      };
    }));

    logApiEvent(req, "quiz_session_generated", {
      userId,
      mode,
      countRequested: limit,
      countGenerated: quizQuestions.length,
      clusterId: clusterId ?? null,
    });

    res.json(quizQuestions);
  });

  // Submit Answer
  app.post(api.quiz.submit.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.quiz.submit.input.parse(req.body);
      
      const word = await storage.getWord(input.wordId);
      if (!word) return sendError(req, res, 404, "NOT_FOUND", "Word not found");
      if (input.language && word.language !== input.language) {
        return sendError(req, res, 404, "NOT_FOUND", "Word not found in selected language");
      }

      const examples = await storage.getWordExamples(word.id, input.language ?? undefined);
      const firstExample = examples[0];

      const isCorrect = input.selectedOptionId === word.id; // Option ID is word ID of the choice
      const srsConfig = await storage.getActiveSrsConfig();
      
      // SRS Logic
      let progress = await storage.getUserWordProgress(userId, word.id);
      
      if (!progress) {
        progress = await storage.createUserProgress({
          userId,
          wordId: word.id,
          correctStreak: 0,
          wrongCount: 0,
          easeFactor: 2.5,
          interval: 0,
          srsConfigVersion: srsConfig.version,
          sourceToTargetStrength: 0.5,
          targetToSourceStrength: 0.5,
          masteryLevel: 0,
          lastSeen: null,
          nextReview: null,
        });
      }

      const now = new Date();
      progress = applySrsUpdate({
        progress,
        isCorrect,
        confidenceLevel: input.confidenceLevel,
        responseTimeMs: input.responseTimeMs,
        direction: input.direction,
        now,
        config: srsConfig,
      });

      await storage.updateUserProgress(progress);
      await storage.logQuizAttempt({
        userId,
        wordId: word.id,
        questionType: input.questionType ?? null,
        direction: input.direction ?? null,
        responseTimeMs: input.responseTimeMs ?? null,
        isCorrect,
        confidenceLevel: input.confidenceLevel
      });

      logApiEvent(req, "quiz_answer_submitted", {
        userId,
        wordId: word.id,
        isCorrect,
        direction: input.direction ?? null,
        responseTimeMs: input.responseTimeMs ?? null,
      });

      const fallbackSentence = word.exampleSentences?.[0] ?? word.originalScript;
      const fallbackPronunciation = word.transliteration;
      const bestExamplePronunciation = firstExample?.pronunciation ?? fallbackPronunciation;
      const feedbackExample = firstExample ? {
        originalScript: firstExample.originalScript,
        pronunciation: bestExamplePronunciation,
        meaning: firstExample.englishSentence,
      } : {
        originalScript: fallbackSentence,
        pronunciation: fallbackPronunciation,
        meaning: word.english,
      };

      res.json({
        isCorrect,
        correctAnswer: word,
        example: feedbackExample,
        progressUpdate: {
          streak: progress.correctStreak || 0,
          masteryLevel: progress.masteryLevel || 0,
          nextReview: progress.nextReview?.toISOString() ?? now.toISOString()
        }
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        sendError(req, res, 400, "VALIDATION_ERROR", err.errors[0].message, err.errors);
      } else {
        sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
      }
    }
  });

  // Stats
  app.get(api.stats.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.stats.get.input?.parse(req.query) ?? {};
    const stats = await storage.getUserStats(userId, parsed.language);
    res.json(stats);
  });

  // Attempt history trail
  app.get(api.attempts.history.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.attempts.history.input?.parse(req.query) ?? { limit: 100 };
    const limit = parsed.limit ?? 100;
    const history = await storage.getUserAttemptHistory(userId, limit, parsed.language);
    res.json(history.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString() ?? null,
    })));
  });

  // Leaderboard
  app.get(api.leaderboard.list.path, isAuthenticated, async (req, res) => {
    const parsed = api.leaderboard.list.input?.parse(req.query) ?? { window: "weekly", limit: 25 };
    const window = parsed.window ?? "weekly";
    const limit = parsed.limit ?? 25;
    const leaderboard = await storage.getLeaderboard(window, limit, parsed.language);
    res.json(leaderboard);
  });

  // Review queue
  app.get(api.review.queue.path, isAuthenticated, requireReviewer, async (req, res) => {
    const parsed = api.review.queue.input?.parse(req.query) ?? { status: ReviewStatusEnum.PENDING_REVIEW, limit: 50 };
    const status = parsed.status ?? ReviewStatusEnum.PENDING_REVIEW;
    const limit = parsed.limit ?? 50;
    const queue = await storage.getReviewQueue(status, limit);
    res.json(queue.map((word) => ({
      ...word,
      sourceCapturedAt: word.sourceCapturedAt?.toISOString() ?? null,
      submittedAt: word.submittedAt?.toISOString() ?? null,
      reviewedAt: word.reviewedAt?.toISOString() ?? null,
      createdAt: word.createdAt?.toISOString() ?? null,
      reviewerConfidenceScore: word.reviewerConfidenceScore ?? null,
      requiresSecondaryReview: word.requiresSecondaryReview ?? false,
      disagreementStatus: word.disagreementStatus ?? ReviewDisagreementStatusEnum.NONE,
    })));
  });

  // Review conflict queue (secondary-review required / disagreement flagged)
  app.get(api.review.conflicts.path, isAuthenticated, requireReviewer, async (req, res) => {
    const parsed = api.review.conflicts.input?.parse(req.query) ?? { limit: 50 };
    const limit = parsed.limit ?? 50;
    const queue = await storage.getConflictReviewQueue(limit);
    res.json(queue.map((word) => ({
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
    })));
  });

  // Review transition
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
        return sendError(req, res, 400, "VALIDATION_ERROR", error.errors[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to update review status");
    }
  });

  // Review transition (bulk)
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
        return sendError(req, res, 400, "VALIDATION_ERROR", error.errors[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to bulk update review status");
    }
  });

  // Resolve flagged conflict by secondary reviewer/admin decision
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
        return sendError(req, res, 400, "VALIDATION_ERROR", error.errors[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to resolve conflict");
    }
  });

  // Review history
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

  // Submit manual/AI word as draft only
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
        sourceUrl: parsed.sourceUrl,
        tags: parsed.tags,
        examples: parsed.examples,
      });
      res.json({
        id: created.word.id,
        reviewStatus: ReviewStatusEnum.DRAFT,
        examplesCreated: created.examplesCreated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.errors[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to create draft");
    }
  });

  // Admin Seed
  app.post(api.admin.seed.path, isAuthenticated, async (req, res) => {
    await storage.seedInitialData();
    res.json({ message: "Seeded" });
  });

  app.get(api.admin.srsDrift.path, isAuthenticated, requireReviewer, async (req, res) => {
    const parsed = api.admin.srsDrift.input?.parse(req.query) ?? {};
    const summary = await storage.getSrsDriftSummary(parsed.language);
    res.json(summary);
  });

  return httpServer;
}
