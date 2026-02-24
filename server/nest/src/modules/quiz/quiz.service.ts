import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { api } from "@shared/routes";
import { QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { applySrsUpdate } from "../../infrastructure/services/srs";
import { chooseDistractors } from "../../infrastructure/services/distractors";
import { formatPronunciationFirst, parseLanguage } from "../../common/utils/language";
import { QuizRepository } from "./quiz.repository";
import { AppError } from "../../common/errors/app-error";

type GenerateQuizInput = {
  userId: string;
  mode?: QuizModeEnum;
  clusterId?: number;
  count?: number;
  language?: unknown;
};

type SubmitQuizInput = {
  userId: string;
  payload: unknown;
};

@Injectable()
export class QuizService {
  constructor(private readonly repository: QuizRepository) {}

  async generateQuiz(input: GenerateQuizInput) {
    const parsed = api.quiz.generate.input?.parse({
      mode: input.mode,
      clusterId: input.clusterId,
      count: input.count,
      language: input.language,
    }) ?? { mode: QuizModeEnum.DAILY_REVIEW, count: 10 };
    const limit = parsed.count ?? 10;
    const clusterId = parsed.clusterId;
    const mode = parsed.mode ?? QuizModeEnum.DAILY_REVIEW;
    const language = parsed.language ?? parseLanguage(input.language);

    let candidates = await this.repository.getQuizCandidates(input.userId, limit, clusterId, mode, language);

    if (candidates.length === 0) {
      await this.repository.seedInitialData();
      const retry = await this.repository.getQuizCandidates(input.userId, limit, clusterId, mode, language);
      if (retry.length === 0) {
        return [];
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

    return Promise.all(
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
  }

  async submitQuizAnswer(input: SubmitQuizInput) {
    try {
      const parsedInput = api.quiz.submit.input.parse(input.payload);

      const word = await this.repository.getWord(parsedInput.wordId);
      if (!word) {
        throw new AppError(404, "NOT_FOUND", "Word not found");
      }
      if (parsedInput.language && word.language !== parsedInput.language) {
        throw new AppError(404, "NOT_FOUND", "Word not found in selected language");
      }

      const examples = await this.repository.getWordExamples(word.id, parsedInput.language ?? undefined);
      const isCorrect = parsedInput.selectedOptionId === word.id;
      const srsConfig = await this.repository.getActiveSrsConfig();

      let progress = await this.repository.getUserWordProgress(input.userId, word.id);
      if (!progress) {
        progress = await this.repository.createUserProgress({
          userId: input.userId,
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
        confidenceLevel: parsedInput.confidenceLevel,
        responseTimeMs: parsedInput.responseTimeMs,
        direction: parsedInput.direction,
        now,
        config: srsConfig,
      });

      await this.repository.updateUserProgress(progress);
      await this.repository.logQuizAttempt({
        userId: input.userId,
        wordId: word.id,
        questionType: parsedInput.questionType ?? null,
        direction: parsedInput.direction ?? null,
        responseTimeMs: parsedInput.responseTimeMs ?? null,
        isCorrect,
        confidenceLevel: parsedInput.confidenceLevel,
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

      return {
        isCorrect,
        correctAnswer: word,
        examples: feedbackExamples,
        progressUpdate: {
          streak: progress.correctStreak || 0,
          masteryLevel: progress.masteryLevel || 0,
          nextReview: progress.nextReview?.toISOString() ?? now.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new AppError(400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request", error.issues);
      }
      throw new AppError(500, "INTERNAL_ERROR", "Internal Server Error");
    }
  }
}
