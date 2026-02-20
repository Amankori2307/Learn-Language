import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { logApiEvent, sendError } from "./http";
import { chooseDistractors } from "./services/distractors";
import { applySrsUpdate } from "./services/srs";

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
    const userId = (req.user as any).claims.sub; // From Replit Auth
    const parsed = api.quiz.generate.input?.parse(req.query) ?? { mode: "daily_review", count: 10 };
    const limit = parsed.count ?? 10;
    const clusterId = parsed.clusterId;
    const mode = parsed.mode ?? "daily_review";

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

      const type = ['telugu_to_english', 'english_to_telugu', 'fill_in_blank'][Math.floor(Math.random() * 3)];

      const options = [word, ...distractors]
        .sort(() => 0.5 - Math.random())
        .map(w => ({
          id: w.id,
          text: type === 'telugu_to_english' || type === 'fill_in_blank' ? w.english : w.telugu
        }));

      return {
        wordId: word.id,
        type,
        questionText: type === 'telugu_to_english' || type === 'fill_in_blank' ? word.telugu : word.english,
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

      res.json({
        isCorrect,
        correctAnswer: word,
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

  // Admin Seed
  app.post(api.admin.seed.path, isAuthenticated, async (req, res) => {
    await storage.seedInitialData();
    res.json({ message: "Seeded" });
  });

  return httpServer;
}
