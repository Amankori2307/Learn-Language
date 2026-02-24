import { z } from 'zod';
import type { Word, Cluster } from "../server/src/infrastructure/schema";
import {
  LanguageEnum,
  PartOfSpeechEnum,
  QuizDirectionEnum,
  QuizModeEnum,
  QuizQuestionTypeEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
  UserTypeEnum,
  VocabularyTagEnum,
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
        language: z.nativeEnum(LanguageEnum).optional(),
        search: z.string().optional(),
        clusterId: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<Word>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/words/:id' as const,
      responses: {
        200: z.custom<Word>(),
        404: errorSchemas.notFound,
      },
    },
  },
  clusters: {
    list: {
      method: 'GET' as const,
      path: '/api/clusters' as const,
      input: z.object({
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
      responses: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          type: z.string(),
          description: z.string().nullable(),
          wordCount: z.number(),
        })),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clusters/:id' as const,
      input: z.object({
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
      responses: {
        200: z.custom<Cluster & { words: Word[] }>(),
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
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
      responses: {
        200: z.array(z.object({
          wordId: z.number(),
          type: z.nativeEnum(QuizQuestionTypeEnum),
          questionText: z.string(),
          pronunciation: z.string().optional().nullable(),
          audioUrl: z.string().optional().nullable(),
          imageUrl: z.string().optional().nullable(),
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
        language: z.nativeEnum(LanguageEnum).optional(),
        questionType: z.nativeEnum(QuizQuestionTypeEnum).optional(),
        direction: z.nativeEnum(QuizDirectionEnum).optional(),
        confidenceLevel: z.number().min(1).max(3),
        responseTimeMs: z.number().int().positive().optional(),
      }),
      responses: {
        200: z.object({
          isCorrect: z.boolean(),
          correctAnswer: z.custom<Word>(),
          examples: z.array(z.object({
            originalScript: z.string(),
            pronunciation: z.string(),
            meaning: z.string(),
          })),
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
      input: z.object({
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
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
          sourceToTargetStrength: z.number(),
          targetToSourceStrength: z.number(),
          recommendedDirection: z.nativeEnum(QuizDirectionEnum),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  analytics: {
    learning: {
      method: "GET" as const,
      path: "/api/analytics/learning" as const,
      input: z.object({
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
      responses: {
        200: z.object({
          clusters: z.array(z.object({
            clusterId: z.number(),
            name: z.string(),
            wordCount: z.number(),
            attempts: z.number(),
            accuracy: z.number(),
          })),
          categories: z.array(z.object({
            category: z.string(),
            attempts: z.number(),
            accuracy: z.number(),
          })),
          weakWords: z.array(z.object({
            wordId: z.number(),
            originalScript: z.string(),
            transliteration: z.string(),
            english: z.string(),
            wrongCount: z.number(),
            masteryLevel: z.number(),
          })),
          strongWords: z.array(z.object({
            wordId: z.number(),
            originalScript: z.string(),
            transliteration: z.string(),
            english: z.string(),
            masteryLevel: z.number(),
            averageStrength: z.number(),
          })),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    wordBuckets: {
      method: "GET" as const,
      path: "/api/analytics/word-buckets" as const,
      input: z.object({
        bucket: z.enum(["mastered", "learning", "needs_review"]),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(200).default(50),
        language: z.nativeEnum(LanguageEnum).optional(),
      }),
      responses: {
        200: z.object({
          bucket: z.enum(["mastered", "learning", "needs_review"]),
          title: z.string(),
          meaning: z.string(),
          howToImprove: z.string(),
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          words: z.array(z.object({
            wordId: z.number(),
            originalScript: z.string(),
            transliteration: z.string(),
            english: z.string(),
            masteryLevel: z.number(),
            wrongCount: z.number(),
            nextReview: z.string().nullable(),
            averageStrength: z.number(),
          })),
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
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
      responses: {
        200: z.array(z.object({
          id: z.number(),
          wordId: z.number(),
          isCorrect: z.boolean(),
          confidenceLevel: z.number().nullable(),
          direction: z.nativeEnum(QuizDirectionEnum).nullable(),
          questionType: z.nativeEnum(QuizQuestionTypeEnum).nullable(),
          responseTimeMs: z.number().nullable(),
          createdAt: z.string().nullable(),
          word: z.object({
            language: z.nativeEnum(LanguageEnum),
            originalScript: z.string(),
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
        language: z.nativeEnum(LanguageEnum).optional(),
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
  feedback: {
    submit: {
      method: "POST" as const,
      path: "/api/feedback" as const,
      input: z.object({
        subject: z.string().trim().min(3).max(120),
        message: z.string().trim().min(10).max(4000),
        pageUrl: z.string().url().optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
      responses: {
        200: z.object({
          ok: z.literal(true),
          sentTo: z.string().email(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
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
          language: z.nativeEnum(LanguageEnum),
          originalScript: z.string(),
          transliteration: z.string(),
          english: z.string(),
          partOfSpeech: z.nativeEnum(PartOfSpeechEnum),
          reviewStatus: z.nativeEnum(ReviewStatusEnum),
          sourceUrl: z.string().nullable(),
          sourceCapturedAt: z.string().nullable(),
          submittedBy: z.string().nullable(),
          submittedAt: z.string().nullable(),
          reviewedBy: z.string().nullable(),
          reviewedAt: z.string().nullable(),
          reviewNotes: z.string().nullable(),
          reviewerConfidenceScore: z.number().int().min(1).max(5).nullable(),
          requiresSecondaryReview: z.boolean(),
          disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
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
        reviewerConfidenceScore: z.number().int().min(1).max(5).optional(),
        requiresSecondaryReview: z.boolean().optional(),
        disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum).optional(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          reviewStatus: z.nativeEnum(ReviewStatusEnum),
          reviewedBy: z.string().nullable(),
          reviewedAt: z.string().nullable(),
          reviewNotes: z.string().nullable(),
          reviewerConfidenceScore: z.number().int().min(1).max(5).nullable(),
          requiresSecondaryReview: z.boolean(),
          disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
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
        reviewerConfidenceScore: z.number().int().min(1).max(5).optional(),
        requiresSecondaryReview: z.boolean().optional(),
        disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum).optional(),
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
            language: z.nativeEnum(LanguageEnum),
            originalScript: z.string(),
            transliteration: z.string(),
            english: z.string(),
            reviewStatus: z.nativeEnum(ReviewStatusEnum),
            sourceUrl: z.string().nullable(),
            sourceCapturedAt: z.string().nullable(),
            reviewNotes: z.string().nullable(),
            reviewerConfidenceScore: z.number().int().min(1).max(5).nullable(),
            requiresSecondaryReview: z.boolean(),
            disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
          }),
          clusters: z.array(z.object({
            id: z.number(),
            name: z.string(),
            type: z.string(),
          })),
          relatedClusterWords: z.array(z.object({
            id: z.number(),
            originalScript: z.string(),
            transliteration: z.string(),
            english: z.string(),
            reviewStatus: z.nativeEnum(ReviewStatusEnum),
          })),
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
    conflicts: {
      method: "GET" as const,
      path: "/api/review/conflicts" as const,
      input: z.object({
        limit: z.coerce.number().int().positive().max(200).default(50),
      }).optional(),
      responses: {
        200: z.array(z.object({
          id: z.number(),
          language: z.nativeEnum(LanguageEnum),
          originalScript: z.string(),
          transliteration: z.string(),
          english: z.string(),
          partOfSpeech: z.nativeEnum(PartOfSpeechEnum),
          reviewStatus: z.nativeEnum(ReviewStatusEnum),
          reviewerConfidenceScore: z.number().int().min(1).max(5).nullable(),
          requiresSecondaryReview: z.boolean(),
          disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
          reviewNotes: z.string().nullable(),
          submittedAt: z.string().nullable(),
          reviewedAt: z.string().nullable(),
        })),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
      },
    },
    resolveConflict: {
      method: "PATCH" as const,
      path: "/api/review/words/:id/resolve-conflict" as const,
      input: z.object({
        toStatus: z.nativeEnum(ReviewStatusEnum),
        notes: z.string().max(1000).optional(),
        reviewerConfidenceScore: z.number().int().min(1).max(5).optional(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          reviewStatus: z.nativeEnum(ReviewStatusEnum),
          reviewerConfidenceScore: z.number().int().min(1).max(5).nullable(),
          requiresSecondaryReview: z.boolean(),
          disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
          reviewNotes: z.string().nullable(),
          reviewedBy: z.string().nullable(),
          reviewedAt: z.string().nullable(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    submitDraft: {
      method: "POST" as const,
      path: "/api/review/words" as const,
      input: z.object({
        originalScript: z.string().trim().min(1),
        language: z.nativeEnum(LanguageEnum),
        pronunciation: z.string().trim().min(1),
        transliteration: z.string().trim().min(1).optional(),
        english: z.string().trim().min(1),
        partOfSpeech: z.nativeEnum(PartOfSpeechEnum),
        audioUrl: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        sourceUrl: z.string().url().optional(),
        tags: z.array(z.nativeEnum(VocabularyTagEnum)).optional(),
        clusterIds: z.array(z.number().int().positive()).max(200).optional(),
        examples: z.array(z.object({
          originalScript: z.string().trim().min(1),
          pronunciation: z.string().trim().min(1),
          englishSentence: z.string().trim().min(1),
          contextTag: z.string().trim().min(1).default("general"),
          difficulty: z.number().int().min(1).max(5).default(1),
        })).min(1),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          reviewStatus: z.literal(ReviewStatusEnum.DRAFT),
          examplesCreated: z.number().int().nonnegative(),
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
    srsDrift: {
      method: "GET" as const,
      path: "/api/admin/srs/drift" as const,
      input: z.object({
        language: z.nativeEnum(LanguageEnum).optional(),
      }).optional(),
      responses: {
        200: z.object({
          generatedAt: z.string(),
          overdueCount: z.number(),
          totalTracked: z.number(),
          overdueRatio: z.number(),
          highIntervalCount: z.number(),
          highIntervalRatio: z.number(),
          emptyReviewDays: z.number(),
          alerts: z.array(z.object({
            code: z.enum(["overdue_growth", "interval_spike", "empty_review_days"]),
            severity: z.enum(["warning", "critical"]),
            message: z.string(),
          })),
        }),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
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
