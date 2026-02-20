import { z } from 'zod';
import { insertWordSchema, insertClusterSchema, words, clusters, userWordProgress, quizAttempts } from './schema';
import {
  QuizDirectionEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
  ReviewStatusEnum,
  UserTypeEnum,
} from './domain/enums';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    code: z.literal("VALIDATION_ERROR"),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string(),
  }),
  notFound: z.object({
    code: z.literal("NOT_FOUND"),
    message: z.string(),
    requestId: z.string(),
  }),
  internal: z.object({
    code: z.literal("INTERNAL_ERROR"),
    message: z.string(),
    requestId: z.string(),
  }),
  unauthorized: z.object({
    code: z.literal("UNAUTHORIZED"),
    message: z.string(),
    requestId: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  words: {
    list: {
      method: 'GET' as const,
      path: '/api/words' as const,
      input: z.object({
        search: z.string().optional(),
        clusterId: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof words.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/words/:id' as const,
      responses: {
        200: z.custom<typeof words.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  clusters: {
    list: {
      method: 'GET' as const,
      path: '/api/clusters' as const,
      responses: {
        200: z.array(z.custom<typeof clusters.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clusters/:id' as const,
      responses: {
        200: z.custom<typeof clusters.$inferSelect & { words: typeof words.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  quiz: {
    generate: {
      method: 'GET' as const,
      path: '/api/quiz/generate' as const,
      input: z.object({
        mode: z.nativeEnum(QuizModeEnum).default(QuizModeEnum.DAILY_REVIEW),
        clusterId: z.coerce.number().optional(),
        count: z.coerce.number().default(10),
      }).optional(),
      responses: {
        200: z.array(z.object({
          wordId: z.number(),
          type: z.nativeEnum(QuizQuestionTypeEnum),
          questionText: z.string(),
          pronunciation: z.string().optional().nullable(),
          audioUrl: z.string().optional().nullable(),
          options: z.array(z.object({
            id: z.number(),
            text: z.string(),
          })),
          // We don't send correctAnswerId here to prevent cheating!
        })),
        401: errorSchemas.unauthorized,
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/quiz/submit' as const,
      input: z.object({
        wordId: z.number(),
        selectedOptionId: z.number(), // The ID of the word selected as the answer
        questionType: z.nativeEnum(QuizQuestionTypeEnum).optional(),
        direction: z.nativeEnum(QuizDirectionEnum).optional(),
        confidenceLevel: z.number().min(1).max(3),
        responseTimeMs: z.number().int().positive().optional(),
      }),
      responses: {
        200: z.object({
          isCorrect: z.boolean(),
          correctAnswer: z.custom<typeof words.$inferSelect>(),
          example: z.object({
            telugu: z.string(),
            pronunciation: z.string(),
            meaning: z.string(),
          }),
          progressUpdate: z.object({
            streak: z.number(),
            masteryLevel: z.number(),
            nextReview: z.string(),
          }),
        }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          totalWords: z.number(),
          mastered: z.number(),
          learning: z.number(),
          weak: z.number(),
          streak: z.number(),
          xp: z.number(),
          recognitionAccuracy: z.number(),
          recallAccuracy: z.number(),
          recommendedDirection: z.nativeEnum(QuizDirectionEnum),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  attempts: {
    history: {
      method: "GET" as const,
      path: "/api/attempts/history" as const,
      input: z.object({
        limit: z.coerce.number().int().positive().max(200).default(100),
      }).optional(),
      responses: {
        200: z.array(z.object({
          id: z.number(),
          wordId: z.number(),
          isCorrect: z.boolean(),
          confidenceLevel: z.number().nullable(),
          direction: z.string().nullable(),
          questionType: z.string().nullable(),
          responseTimeMs: z.number().nullable(),
          createdAt: z.string().nullable(),
          word: z.object({
            telugu: z.string(),
            transliteration: z.string(),
            english: z.string(),
          }),
        })),
        401: errorSchemas.unauthorized,
      },
    },
  },
  leaderboard: {
    list: {
      method: "GET" as const,
      path: "/api/leaderboard" as const,
      input: z.object({
        window: z.enum(["daily", "weekly", "all_time"]).default("weekly"),
        limit: z.coerce.number().int().positive().max(100).default(25),
      }).optional(),
      responses: {
        200: z.array(z.object({
          rank: z.number(),
          userId: z.string(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          email: z.string().nullable(),
          profileImageUrl: z.string().nullable(),
          xp: z.number(),
          streak: z.number(),
          attempts: z.number(),
          accuracy: z.number(),
        })),
        401: errorSchemas.unauthorized,
      },
    },
  },
  profile: {
    get: {
      method: "GET" as const,
      path: "/api/profile" as const,
      responses: {
        200: z.object({
          id: z.string(),
          email: z.string().nullable(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          profileImageUrl: z.string().nullable(),
          role: z.nativeEnum(UserTypeEnum).optional(),
          createdAt: z.string().nullable(),
          updatedAt: z.string().nullable(),
        }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/profile" as const,
      input: z.object({
        firstName: z.string().trim().min(1).max(80).optional(),
        lastName: z.string().trim().min(1).max(80).optional(),
        profileImageUrl: z.string().url().or(z.literal("")).optional(),
      }),
      responses: {
        200: z.object({
          id: z.string(),
          email: z.string().nullable(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          profileImageUrl: z.string().nullable(),
          role: z.nativeEnum(UserTypeEnum).optional(),
          createdAt: z.string().nullable(),
          updatedAt: z.string().nullable(),
        }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
  },
  review: {
    queue: {
      method: "GET" as const,
      path: "/api/review/queue" as const,
      input: z.object({
        status: z.nativeEnum(ReviewStatusEnum).default(ReviewStatusEnum.PENDING_REVIEW),
        limit: z.coerce.number().int().positive().max(200).default(50),
      }).optional(),
      responses: {
        200: z.array(z.object({
          id: z.number(),
          telugu: z.string(),
          transliteration: z.string(),
          english: z.string(),
          partOfSpeech: z.string(),
          reviewStatus: z.nativeEnum(ReviewStatusEnum),
          sourceUrl: z.string().nullable(),
          sourceCapturedAt: z.string().nullable(),
          submittedBy: z.string().nullable(),
          submittedAt: z.string().nullable(),
          reviewedBy: z.string().nullable(),
          reviewedAt: z.string().nullable(),
          reviewNotes: z.string().nullable(),
        })),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
      },
    },
    transition: {
      method: "PATCH" as const,
      path: "/api/review/words/:id" as const,
      input: z.object({
        toStatus: z.nativeEnum(ReviewStatusEnum),
        notes: z.string().max(1000).optional(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          reviewStatus: z.nativeEnum(ReviewStatusEnum),
          reviewedBy: z.string().nullable(),
          reviewedAt: z.string().nullable(),
          reviewNotes: z.string().nullable(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    bulkTransition: {
      method: "PATCH" as const,
      path: "/api/review/words/bulk" as const,
      input: z.object({
        ids: z.array(z.number().int().positive()).min(1).max(200),
        toStatus: z.nativeEnum(ReviewStatusEnum),
        notes: z.string().max(1000).optional(),
      }),
      responses: {
        200: z.object({
          updated: z.number(),
          skipped: z.number(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/review/words/:id/history" as const,
      responses: {
        200: z.object({
          word: z.object({
            id: z.number(),
            telugu: z.string(),
            transliteration: z.string(),
            english: z.string(),
            reviewStatus: z.nativeEnum(ReviewStatusEnum),
            sourceUrl: z.string().nullable(),
            sourceCapturedAt: z.string().nullable(),
            reviewNotes: z.string().nullable(),
          }),
          events: z.array(z.object({
            id: z.number(),
            fromStatus: z.string(),
            toStatus: z.string(),
            changedBy: z.string(),
            notes: z.string().nullable(),
            sourceUrl: z.string().nullable(),
            sourceCapturedAt: z.string().nullable(),
            createdAt: z.string().nullable(),
          })),
        }),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    submitDraft: {
      method: "POST" as const,
      path: "/api/review/words" as const,
      input: z.object({
        telugu: z.string().trim().min(1),
        transliteration: z.string().trim().min(1),
        english: z.string().trim().min(1),
        partOfSpeech: z.string().trim().min(1),
        sourceUrl: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          reviewStatus: z.literal(ReviewStatusEnum.DRAFT),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    seed: {
      method: 'POST' as const,
      path: '/api/admin/seed' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type QuizGenerateResponse = z.infer<typeof api.quiz.generate.responses[200]>;
export type QuizSubmitInput = z.infer<typeof api.quiz.submit.input>;
export type QuizSubmitResponse = z.infer<typeof api.quiz.submit.responses[200]>;
export type StatsResponse = z.infer<typeof api.stats.get.responses[200]>;
