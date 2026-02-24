import { Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { applySrsUpdate } from "../../services/srs";
import { chooseDistractors } from "../../services/distractors";
import { logApiEvent, sendError } from "../../http";
import { formatPronunciationFirst, parseLanguage } from "../common/language";
import { QuizRepository } from "./quiz.repository";

interface IUserClaimsRequest extends Request {
  user: {
    claims: {
      sub: string;
    };
  };
}

export interface IQuizService {
  generateQuiz(req: Request, res: Response): Promise<void>;
  submitQuizAnswer(req: Request, res: Response): Promise<void>;
}

@Injectable()
export class QuizService implements IQuizService {
  constructor(private readonly repository: QuizRepository) {}

  async generateQuiz(req: Request, res: Response): Promise<void> {
    const userId = (req as IUserClaimsRequest).user.claims.sub;
    const parsed = api.quiz.generate.input?.parse(req.query) ?? { mode: QuizModeEnum.DAILY_REVIEW, count: 10 };
    const limit = parsed.count ?? 10;
    const clusterId = parsed.clusterId;
    const mode = parsed.mode ?? QuizModeEnum.DAILY_REVIEW;
    const language = parsed.language ?? parseLanguage(req.query.language);

    let candidates = await this.repository.getQuizCandidates(userId, limit, clusterId, mode, language);

    if (candidates.length === 0) {
      await this.repository.seedInitialData();
      const retry = await this.repository.getQuizCandidates(userId, limit, clusterId, mode, language);
      if (retry.length === 0) {
        res.json([]);
        return;
      }
      candidates = retry;
    }

    const allWords = await this.repository.getWords(500, language);
    const links = await this.repository.getWordClusterLinks();
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

        const options = [word, ...distractors].sort(() => 0.5 - Math.random()).map((optionWord) => ({
          id: optionWord.id,
          text: type === QuizQuestionTypeEnum.SOURCE_TO_TARGET ? optionWord.english : formatPronunciationFirst(optionWord),
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
  }

  async submitQuizAnswer(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as IUserClaimsRequest).user.claims.sub;
      const input = api.quiz.submit.input.parse(req.body);

      const word = await this.repository.getWord(input.wordId);
      if (!word) {
        sendError(req, res, 404, "NOT_FOUND", "Word not found");
        return;
      }
      if (input.language && word.language !== input.language) {
        sendError(req, res, 404, "NOT_FOUND", "Word not found in selected language");
        return;
      }

      const examples = await this.repository.getWordExamples(word.id, input.language ?? undefined);
      const isCorrect = input.selectedOptionId === word.id;
      const srsConfig = await this.repository.getActiveSrsConfig();

      let progress = await this.repository.getUserWordProgress(userId, word.id);
      if (!progress) {
        progress = await this.repository.createUserProgress({
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

      await this.repository.updateUserProgress(progress);
      await this.repository.logQuizAttempt({
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
        sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request", error.issues);
        return;
      }
      sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
    }
  }
}
