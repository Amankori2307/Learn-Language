import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";
import { applySrsUpdate } from "../../services/srs";
import { chooseDistractors } from "../../services/distractors";
import { logApiEvent, sendError } from "../../http";
import { formatPronunciationFirst, parseLanguage } from "../common/language";

export function registerQuizRoutes(app: Express) {
  app.get(api.quiz.generate.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.quiz.generate.input?.parse(req.query) ?? { mode: QuizModeEnum.DAILY_REVIEW, count: 10 };
    const limit = parsed.count ?? 10;
    const clusterId = parsed.clusterId;
    const mode = parsed.mode ?? QuizModeEnum.DAILY_REVIEW;
    const language = parsed.language ?? parseLanguage(req.query.language);

    let candidates = await storage.getQuizCandidates(userId, limit, clusterId, mode, language);

    if (candidates.length === 0) {
      await storage.seedInitialData();
      const retry = await storage.getQuizCandidates(userId, limit, clusterId, mode, language);
      if (retry.length === 0) return res.json([]);
      candidates = retry;
    }

    const allWords = await storage.getWords(500, language);
    const links = await storage.getWordClusterLinks();
    const clusterByWord = new Map<number, Set<number>>();
    for (const link of links) {
      const set = clusterByWord.get(link.wordId) ?? new Set<number>();
      set.add(link.clusterId);
      clusterByWord.set(link.wordId, set);
    }

    const quizQuestions = await Promise.all(
      candidates.map(async (word) => {
        const distractors = chooseDistractors({
          word,
          allWords,
          clusterByWord,
          count: 3,
        });

        const typePool = [QuizQuestionTypeEnum.SOURCE_TO_TARGET, QuizQuestionTypeEnum.TARGET_TO_SOURCE] as const;
        const type =
          mode === QuizModeEnum.LISTEN_IDENTIFY
            ? QuizQuestionTypeEnum.SOURCE_TO_TARGET
            : typePool[Math.floor(Math.random() * typePool.length)];

        const questionText =
          mode === QuizModeEnum.LISTEN_IDENTIFY
            ? "Listen and pick the correct meaning"
            : type === QuizQuestionTypeEnum.SOURCE_TO_TARGET
              ? word.originalScript
              : word.english;

        const options = [word, ...distractors].sort(() => 0.5 - Math.random()).map((w) => ({
          id: w.id,
          text: type === QuizQuestionTypeEnum.SOURCE_TO_TARGET ? w.english : formatPronunciationFirst(w),
        }));

        return {
          wordId: word.id,
          type,
          questionText,
          pronunciation:
            mode === QuizModeEnum.LISTEN_IDENTIFY
              ? null
              : type === QuizQuestionTypeEnum.SOURCE_TO_TARGET
                ? (word.transliteration ?? null)
                : null,
          audioUrl: word.audioUrl,
          imageUrl: word.imageUrl ?? null,
          options,
        };
      }),
    );

    logApiEvent(req, "quiz_session_generated", {
      userId,
      mode,
      countRequested: limit,
      countGenerated: quizQuestions.length,
      clusterId: clusterId ?? null,
    });

    res.json(quizQuestions);
  });

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
      const isCorrect = input.selectedOptionId === word.id;
      const srsConfig = await storage.getActiveSrsConfig();

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
        confidenceLevel: input.confidenceLevel,
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
      const feedbackExamples =
        examples.length > 0
          ? examples.slice(0, 3).map((example) => ({
              originalScript: example.originalScript,
              pronunciation: example.pronunciation,
              meaning: example.englishSentence,
            }))
          : [
              {
                originalScript: fallbackSentence,
                pronunciation: fallbackPronunciation,
                meaning: word.english,
              },
            ];

      res.json({
        isCorrect,
        correctAnswer: word,
        examples: feedbackExamples,
        progressUpdate: {
          streak: progress.correctStreak || 0,
          masteryLevel: progress.masteryLevel || 0,
          nextReview: progress.nextReview?.toISOString() ?? now.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request", error.issues);
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
    }
  });
}
