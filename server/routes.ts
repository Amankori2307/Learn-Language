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
import { QuizModeEnum, QuizQuestionTypeEnum, ReviewStatusEnum } from "@shared/domain/enums";

function formatPronunciationFirst(word: { transliteration?: string | null; telugu: string }) {
  const transliteration = word.transliteration?.trim();
  if (!transliteration) {
    return word.telugu;
  }
  return `${transliteration} (${word.telugu})`;
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
    // Basic implementation - filters can be added later
    const words = await storage.getWords(100);
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
    const clusters = await storage.getClusters();
    res.json(clusters);
  });

  // Get Cluster
  app.get(api.clusters.get.path, isAuthenticated, async (req, res) => {
    const cluster = await storage.getCluster(Number(req.params.id));
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

    const candidates = await storage.getQuizCandidates(userId, limit, clusterId, mode);
    
    if (candidates.length === 0) {
      // If no words found, maybe seed data or return empty
      // Ideally we should always have words after seeding
      await storage.seedInitialData();
      // Retry once
      const retry = await storage.getQuizCandidates(userId, limit, clusterId);
      if (retry.length === 0) return res.json([]); 
    }

    const allWords = await storage.getWords(500);
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

      const typePool = [QuizQuestionTypeEnum.TELUGU_TO_ENGLISH, QuizQuestionTypeEnum.ENGLISH_TO_TELUGU] as const;
      const type = typePool[Math.floor(Math.random() * typePool.length)];

      const questionText =
        type === QuizQuestionTypeEnum.TELUGU_TO_ENGLISH
          ? word.telugu
          : word.english;
      
      const options = [word, ...distractors]
        .sort(() => 0.5 - Math.random())
        .map(w => ({
          id: w.id,
          text:
            type === QuizQuestionTypeEnum.TELUGU_TO_ENGLISH
              ? w.english
              : formatPronunciationFirst(w)
        }));

      return {
        wordId: word.id,
        type,
        questionText,
        pronunciation: type === QuizQuestionTypeEnum.TELUGU_TO_ENGLISH ? (word.transliteration ?? null) : null,
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
      const examples = await storage.getWordExamples(word.id);
      const firstExample = examples[0];

      const isCorrect = input.selectedOptionId === word.id; // Option ID is word ID of the choice
      
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
        now,
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

      const fallbackSentence = word.exampleSentences?.[0] ?? word.telugu;
      const fallbackPronunciation = word.transliteration;
      const bestExamplePronunciation = firstExample?.pronunciation ?? fallbackPronunciation;
      const feedbackExample = firstExample ? {
        telugu: firstExample.teluguSentence,
        pronunciation: bestExamplePronunciation,
        meaning: firstExample.englishSentence,
      } : {
        telugu: fallbackSentence,
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
    const stats = await storage.getUserStats(userId);
    res.json(stats);
  });

  // Attempt history trail
  app.get(api.attempts.history.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.attempts.history.input?.parse(req.query) ?? { limit: 100 };
    const limit = parsed.limit ?? 100;
    const history = await storage.getUserAttemptHistory(userId, limit);
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
    const leaderboard = await storage.getLeaderboard(window, limit);
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
      const updated = await storage.transitionWordReview(wordId, reviewerId, parsed.toStatus, parsed.notes);
      if (!updated) {
        return sendError(req, res, 404, "NOT_FOUND", "Word not found");
      }
      res.json({
        id: updated.id,
        reviewStatus: updated.reviewStatus,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt?.toISOString() ?? null,
        reviewNotes: updated.reviewNotes ?? null,
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
        const row = await storage.transitionWordReview(id, reviewerId, parsed.toStatus, parsed.notes);
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
        telugu: result.word.telugu,
        transliteration: result.word.transliteration,
        english: result.word.english,
        reviewStatus: result.word.reviewStatus,
        sourceUrl: result.word.sourceUrl ?? null,
        sourceCapturedAt: result.word.sourceCapturedAt?.toISOString() ?? null,
        reviewNotes: result.word.reviewNotes ?? null,
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
        telugu: parsed.telugu,
        transliteration: parsed.transliteration,
        english: parsed.english,
        partOfSpeech: parsed.partOfSpeech,
        sourceUrl: parsed.sourceUrl,
        tags: parsed.tags,
      });
      res.json({
        id: created.id,
        reviewStatus: ReviewStatusEnum.DRAFT,
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

  return httpServer;
}
