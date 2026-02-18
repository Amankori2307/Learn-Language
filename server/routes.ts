import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

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
      return res.status(404).json({ message: "Word not found" });
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
      return res.status(404).json({ message: "Cluster not found" });
    }
    res.json(cluster);
  });

  // Generate Quiz
  app.get(api.quiz.generate.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub; // From Replit Auth
    
    // Parse params manually or use z.coerce in schemas
    const limit = req.query.count ? Number(req.query.count) : 10;
    const clusterId = req.query.clusterId ? Number(req.query.clusterId) : undefined;
    
    const candidates = await storage.getQuizCandidates(userId, limit, clusterId);
    
    if (candidates.length === 0) {
      // If no words found, maybe seed data or return empty
      // Ideally we should always have words after seeding
      await storage.seedInitialData();
      // Retry once
      const retry = await storage.getQuizCandidates(userId, limit, clusterId);
      if (retry.length === 0) return res.json([]); 
    }

    // Generate questions for each candidate
    const quizQuestions = await Promise.all(candidates.map(async (word) => {
      // Get 3 distractors
      const allWords = await storage.getWords(100);
      const distractors = allWords
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      const options = [word, ...distractors]
        .sort(() => 0.5 - Math.random())
        .map(w => ({
          id: w.id,
          text: w.english // For Telugu->English question
        }));

      // Randomize question type (Simple implementation: mostly Telugu -> English)
      const type = 'telugu_to_english'; 

      return {
        wordId: word.id,
        type,
        questionText: word.telugu, // Show Telugu word
        audioUrl: word.audioUrl,
        options,
      };
    }));

    res.json(quizQuestions);
  });

  // Submit Answer
  app.post(api.quiz.submit.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.quiz.submit.input.parse(req.body);
      
      const word = await storage.getWord(input.wordId);
      if (!word) return res.status(404).json({ message: "Word not found" });

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
          masteryLevel: 0
        });
      }

      // Update progress based on simplified SM-2 (from PRD)
      const now = new Date();
      
      if (isCorrect) {
        progress.correctStreak = (progress.correctStreak || 0) + 1;
        
        // Ease factor adjustment
        // If confidence high (3), +0.1. If low, maybe -0.1? PRD says "+0.1 (if confidence high)"
        if (input.confidenceLevel === 3) {
          progress.easeFactor = (progress.easeFactor || 2.5) + 0.1;
        }

        // Interval calc
        if (progress.correctStreak === 1) {
          progress.interval = 1;
        } else if (progress.correctStreak === 2) {
          progress.interval = 6;
        } else {
          progress.interval = Math.ceil((progress.interval || 1) * (progress.easeFactor || 2.5));
        }

        // Mastery Level
        // 1->Learning, 3->Familiar, 5->Strong, 7->Mastered
        if (progress.correctStreak >= 7) progress.masteryLevel = 4; // Mastered
        else if (progress.correctStreak >= 5) progress.masteryLevel = 3; // Strong
        else if (progress.correctStreak >= 3) progress.masteryLevel = 2; // Familiar
        else progress.masteryLevel = 1; // Learning

      } else {
        progress.correctStreak = 0;
        progress.wrongCount = (progress.wrongCount || 0) + 1;
        progress.interval = 1; // Reset to 1 day
        progress.easeFactor = Math.max(1.3, (progress.easeFactor || 2.5) - 0.2); // Penalty
      }

      // Next review date
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + (progress.interval || 1));
      progress.nextReview = nextDate;
      progress.lastSeen = now;

      await storage.updateUserProgress(progress);
      await storage.logQuizAttempt({
        userId,
        wordId: word.id,
        isCorrect,
        confidenceLevel: input.confidenceLevel
      });

      res.json({
        isCorrect,
        correctAnswer: word,
        progressUpdate: {
          streak: progress.correctStreak || 0,
          masteryLevel: progress.masteryLevel || 0,
          nextReview: nextDate.toISOString()
        }
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
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
