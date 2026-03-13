import { z } from "zod";
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
} from "./domain/enums";
import {
  API_PAGINATION_DEFAULTS,
  API_PAGINATION_LIMITS,
  API_VALIDATION_LIMITS,
} from "./domain/api-limits";

// ============================================
// SHARED ENVELOPE SCHEMAS
// ============================================
export function successResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    error: z.literal(false),
    data: dataSchema,
    message: z.string(),
    requestId: z.string(),
    meta: z.record(z.string(), z.unknown()).optional(),
  });
}

function errorResponseSchema<
  TCode extends
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "INTERNAL_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "RATE_LIMITED",
>(code: TCode) {
  return z.object({
    success: z.literal(false),
    error: z.literal(true),
    data: z.null(),
    message: z.string(),
    code: z.literal(code),
    requestId: z.string(),
    details: z.unknown().optional(),
  });
}

export const errorSchemas = {
  validation: errorResponseSchema("VALIDATION_ERROR"),
  notFound: errorResponseSchema("NOT_FOUND"),
  internal: errorResponseSchema("INTERNAL_ERROR"),
  unauthorized: errorResponseSchema("UNAUTHORIZED"),
  forbidden: errorResponseSchema("FORBIDDEN"),
  rateLimited: errorResponseSchema("RATE_LIMITED"),
};

function paginatedDataSchema<T extends z.ZodTypeAny, Extra extends z.ZodRawShape = {}>(
  itemSchema: T,
  extraShape?: Extra,
) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    ...(extraShape ?? ({} as Extra)),
  });
}

const seedWordSchema = z.object({
  key: z.string(),
  language: z.nativeEnum(LanguageEnum),
  originalScript: z.string(),
  transliteration: z.string(),
  english: z.string(),
  partOfSpeech: z.nativeEnum(PartOfSpeechEnum),
  difficulty: z.number(),
  difficultyLevel: z.string(),
  frequencyScore: z.number(),
  cefrLevel: z.string().nullable().optional(),
  tags: z.array(z.nativeEnum(VocabularyTagEnum)).optional(),
  clusters: z.array(z.string()).optional(),
  source: z
    .object({
      type: z.string().optional(),
      generatedAt: z.string().optional(),
      reviewStatus: z.nativeEnum(ReviewStatusEnum).optional(),
      sourceUrl: z.string().optional(),
    })
    .optional(),
});

const seedSentenceSchema = z.object({
  language: z.nativeEnum(LanguageEnum),
  originalScript: z.string(),
  pronunciation: z.string(),
  english: z.string(),
  contextTag: z.string(),
  difficulty: z.number(),
  wordRefs: z.array(z.string()),
});

const clusterListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  wordCount: z.number(),
});

const leaderboardEntrySchema = z.object({
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
});

const attemptHistoryItemSchema = z.object({
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
});

const reviewQueueItemSchema = z.object({
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
});

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
    },
    googleLogin: {
      method: "GET" as const,
      path: "/api/auth/google" as const,
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout" as const,
    },
    profile: {
      get: {
        method: "GET" as const,
        path: "/api/auth/profile" as const,
        responses: {
          200: successResponseSchema(
            z.object({
              id: z.string(),
              email: z.string().nullable(),
              firstName: z.string().nullable(),
              lastName: z.string().nullable(),
              profileImageUrl: z.string().nullable(),
              role: z.nativeEnum(UserTypeEnum).optional(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
          ),
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/auth/profile" as const,
        input: z.object({
          firstName: z.string().trim().min(1).max(80).optional(),
          lastName: z.string().trim().min(1).max(80).optional(),
          profileImageUrl: z.string().url().or(z.literal("")).optional(),
        }),
        responses: {
          200: successResponseSchema(
            z.object({
              id: z.string(),
              email: z.string().nullable(),
              firstName: z.string().nullable(),
              lastName: z.string().nullable(),
              profileImageUrl: z.string().nullable(),
              role: z.nativeEnum(UserTypeEnum).optional(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
          ),
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          400: errorSchemas.validation,
        },
      },
    },
  },
  words: {
    list: {
      method: "GET" as const,
      path: "/api/words" as const,
      input: z
        .object({
          language: z.nativeEnum(LanguageEnum).optional(),
          search: z.string().optional(),
          clusterId: z.coerce.number().optional(),
          limit: z.coerce.number().optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(z.array(z.custom<Word>())),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/words/:id" as const,
      responses: {
        200: successResponseSchema(z.custom<Word>()),
        404: errorSchemas.notFound,
      },
    },
  },
  clusters: {
    list: {
      method: "GET" as const,
      path: "/api/clusters" as const,
      input: z
        .object({
          q: z.string().optional(),
          language: z.nativeEnum(LanguageEnum).optional(),
          type: z.string().optional(),
          sort: z
            .enum(["name_asc", "name_desc", "type_asc", "words_desc", "words_asc"])
            .default("words_desc"),
          page: z.coerce.number().int().positive().default(API_PAGINATION_DEFAULTS.PAGE),
          limit: z.coerce
            .number()
            .int()
            .positive()
            .max(API_PAGINATION_LIMITS.GENERIC_MAX)
            .default(API_PAGINATION_DEFAULTS.CLUSTER_LIMIT),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          paginatedDataSchema(clusterListItemSchema, {
            availableTypes: z.array(z.string()),
            summary: z.object({
              totalWords: z.number(),
              nonEmptyClusters: z.number(),
              topCluster: clusterListItemSchema.nullable(),
            }),
          }),
        ),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/clusters/:id" as const,
      input: z
        .object({
          language: z.nativeEnum(LanguageEnum).optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(z.custom<Cluster & { words: Word[] }>()),
        404: errorSchemas.notFound,
      },
    },
  },
  quiz: {
    generate: {
      method: "GET" as const,
      path: "/api/quiz/generate" as const,
      input: z
        .object({
          mode: z.nativeEnum(QuizModeEnum).default(QuizModeEnum.DAILY_REVIEW),
          clusterId: z.coerce.number().optional(),
          count: z.coerce.number().default(API_PAGINATION_DEFAULTS.QUIZ_COUNT),
          language: z.nativeEnum(LanguageEnum).optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          z.array(
            z.object({
              wordId: z.number(),
              type: z.nativeEnum(QuizQuestionTypeEnum),
              questionText: z.string(),
              pronunciation: z.string().optional().nullable(),
              audioUrl: z.string().optional().nullable(),
              imageUrl: z.string().optional().nullable(),
              options: z.array(
                z.object({
                  id: z.number(),
                  text: z.string(),
                }),
              ),
              // We don't send correctAnswerId here to prevent cheating!
            }),
          ),
        ),
        401: errorSchemas.unauthorized,
      },
    },
    submit: {
      method: "POST" as const,
      path: "/api/quiz/submit" as const,
      input: z.object({
        wordId: z.number(),
        selectedOptionId: z.number(), // The ID of the word selected as the answer
        language: z.nativeEnum(LanguageEnum).optional(),
        questionType: z.nativeEnum(QuizQuestionTypeEnum).optional(),
        direction: z.nativeEnum(QuizDirectionEnum).optional(),
        responseTimeMs: z.number().int().positive().optional(),
      }),
      responses: {
        200: successResponseSchema(
          z.object({
            isCorrect: z.boolean(),
            correctAnswer: z.custom<Word>(),
            examples: z.array(
              z.object({
                originalScript: z.string(),
                pronunciation: z.string(),
                meaning: z.string(),
              }),
            ),
            progressUpdate: z.object({
              streak: z.number(),
              masteryLevel: z.number(),
              nextReview: z.string(),
            }),
          }),
        ),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  audio: {
    resolve: {
      method: "POST" as const,
      path: "/api/audio/resolve" as const,
      input: z.object({
        wordId: z.number().int().positive().optional(),
        language: z.nativeEnum(LanguageEnum),
        text: z.string().trim().min(1).max(280).optional(),
        audioUrl: z.string().url().optional(),
      }),
      responses: {
        200: successResponseSchema(
          z.object({
            audioUrl: z.string().url().nullable(),
            source: z.enum(["existing", "cache", "generated", "unavailable"]),
            cached: z.boolean(),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
  },
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats" as const,
      input: z
        .object({
          language: z.nativeEnum(LanguageEnum).optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          z.object({
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
        ),
        401: errorSchemas.unauthorized,
      },
    },
  },
  analytics: {
    learning: {
      method: "GET" as const,
      path: "/api/analytics/learning" as const,
      input: z
        .object({
          language: z.nativeEnum(LanguageEnum).optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          z.object({
            clusters: z.array(
              z.object({
                clusterId: z.number(),
                name: z.string(),
                wordCount: z.number(),
                attempts: z.number(),
                accuracy: z.number(),
              }),
            ),
            categories: z.array(
              z.object({
                category: z.string(),
                attempts: z.number(),
                accuracy: z.number(),
              }),
            ),
            weakWords: z.array(
              z.object({
                wordId: z.number(),
                originalScript: z.string(),
                transliteration: z.string(),
                english: z.string(),
                wrongCount: z.number(),
                masteryLevel: z.number(),
              }),
            ),
            strongWords: z.array(
              z.object({
                wordId: z.number(),
                originalScript: z.string(),
                transliteration: z.string(),
                english: z.string(),
                masteryLevel: z.number(),
                averageStrength: z.number(),
              }),
            ),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
    wordBuckets: {
      method: "GET" as const,
      path: "/api/analytics/word-buckets" as const,
      input: z.object({
        bucket: z.enum(["mastered", "learning", "needs_review"]),
        page: z.coerce.number().int().positive().default(API_PAGINATION_DEFAULTS.PAGE),
        limit: z.coerce
          .number()
          .int()
          .positive()
          .max(API_PAGINATION_LIMITS.GENERIC_MAX)
          .default(API_PAGINATION_DEFAULTS.WORD_BUCKET_LIMIT),
        language: z.nativeEnum(LanguageEnum).optional(),
      }),
      responses: {
        200: successResponseSchema(
          z.object({
            bucket: z.enum(["mastered", "learning", "needs_review"]),
            title: z.string(),
            meaning: z.string(),
            howToImprove: z.string(),
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            words: z.array(
              z.object({
                wordId: z.number(),
                originalScript: z.string(),
                transliteration: z.string(),
                english: z.string(),
                masteryLevel: z.number(),
                wrongCount: z.number(),
                nextReview: z.string().nullable(),
                averageStrength: z.number(),
              }),
            ),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
  },
  attempts: {
    history: {
      method: "GET" as const,
      path: "/api/attempts/history" as const,
      input: z
        .object({
          page: z.coerce.number().int().positive().default(API_PAGINATION_DEFAULTS.PAGE),
          limit: z.coerce
            .number()
            .int()
            .positive()
            .max(API_PAGINATION_LIMITS.GENERIC_MAX)
            .default(API_PAGINATION_DEFAULTS.ATTEMPT_HISTORY_LIMIT),
          language: z.nativeEnum(LanguageEnum).optional(),
          search: z.string().optional(),
          result: z.enum(["all", "correct", "wrong"]).default("all"),
          direction: z
            .enum(["all", QuizDirectionEnum.SOURCE_TO_TARGET, QuizDirectionEnum.TARGET_TO_SOURCE])
            .default("all"),
          sort: z
            .enum(["newest", "oldest", "confidence_desc", "response_time_desc"])
            .default("newest"),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          paginatedDataSchema(attemptHistoryItemSchema, {
            summary: z.object({
              total: z.number(),
              correct: z.number(),
              accuracy: z.number(),
            }),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
  },
  leaderboard: {
    list: {
      method: "GET" as const,
      path: "/api/leaderboard" as const,
      input: z
        .object({
          window: z.enum(["daily", "weekly", "all_time"]).default("weekly"),
          page: z.coerce.number().int().positive().default(API_PAGINATION_DEFAULTS.PAGE),
          limit: z.coerce
            .number()
            .int()
            .positive()
            .max(API_PAGINATION_LIMITS.LEADERBOARD_MAX)
            .default(API_PAGINATION_DEFAULTS.LEADERBOARD_LIMIT),
          language: z.nativeEnum(LanguageEnum).optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          paginatedDataSchema(leaderboardEntrySchema, {
            currentUserEntry: leaderboardEntrySchema.nullable(),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
  },
  review: {
    queue: {
      method: "GET" as const,
      path: "/api/review/queue" as const,
      input: z
        .object({
          status: z.nativeEnum(ReviewStatusEnum).default(ReviewStatusEnum.PENDING_REVIEW),
          page: z.coerce.number().int().positive().default(API_PAGINATION_DEFAULTS.PAGE),
          limit: z.coerce
            .number()
            .int()
            .positive()
            .max(API_PAGINATION_LIMITS.GENERIC_MAX)
            .default(API_PAGINATION_DEFAULTS.REVIEW_LIMIT),
        })
        .optional(),
      responses: {
        200: successResponseSchema(paginatedDataSchema(reviewQueueItemSchema)),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    conflicts: {
      method: "GET" as const,
      path: "/api/review/conflicts" as const,
      input: z
        .object({
          limit: z.coerce
            .number()
            .int()
            .positive()
            .max(API_PAGINATION_LIMITS.GENERIC_MAX)
            .default(API_PAGINATION_DEFAULTS.REVIEW_LIMIT),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          z.array(
            z.object({
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
            }),
          ),
        ),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    transition: {
      method: "PATCH" as const,
      path: "/api/review/words/:id" as const,
      input: z.object({
        toStatus: z.nativeEnum(ReviewStatusEnum),
        notes: z.string().max(API_VALIDATION_LIMITS.REVIEW_NOTES_MAX).optional(),
        reviewerConfidenceScore: z
          .number()
          .int()
          .min(API_VALIDATION_LIMITS.REVIEWER_CONFIDENCE_MIN)
          .max(API_VALIDATION_LIMITS.REVIEWER_CONFIDENCE_MAX)
          .optional(),
        requiresSecondaryReview: z.boolean().optional(),
        disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum).optional(),
      }),
      responses: {
        200: successResponseSchema(
          z.object({
            id: z.number(),
            reviewStatus: z.nativeEnum(ReviewStatusEnum),
            reviewedBy: z.string().nullable(),
            reviewedAt: z.string().nullable(),
            reviewNotes: z.string().nullable(),
            reviewerConfidenceScore: z.number().nullable(),
            requiresSecondaryReview: z.boolean(),
            disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
          }),
        ),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    bulkTransition: {
      method: "PATCH" as const,
      path: "/api/review/words/bulk" as const,
      input: z.object({
        ids: z
          .array(z.number().int().positive())
          .min(API_VALIDATION_LIMITS.BULK_IDS_MIN)
          .max(API_VALIDATION_LIMITS.BULK_IDS_MAX),
        toStatus: z.nativeEnum(ReviewStatusEnum),
        notes: z.string().max(API_VALIDATION_LIMITS.REVIEW_NOTES_MAX).optional(),
        reviewerConfidenceScore: z
          .number()
          .int()
          .min(API_VALIDATION_LIMITS.REVIEWER_CONFIDENCE_MIN)
          .max(API_VALIDATION_LIMITS.REVIEWER_CONFIDENCE_MAX)
          .optional(),
        requiresSecondaryReview: z.boolean().optional(),
        disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum).optional(),
      }),
      responses: {
        200: successResponseSchema(
          z.object({
            updated: z.number(),
            skipped: z.number(),
          }),
        ),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/review/words/:id/history" as const,
      responses: {
        200: successResponseSchema(
          z.object({
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
            clusters: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                type: z.string(),
              }),
            ),
            relatedClusterWords: z.array(
              z.object({
                id: z.number(),
                originalScript: z.string(),
                transliteration: z.string(),
                english: z.string(),
                reviewStatus: z.nativeEnum(ReviewStatusEnum),
              }),
            ),
            events: z.array(
              z.object({
                id: z.number(),
                fromStatus: z.string(),
                toStatus: z.string(),
                changedBy: z.string(),
                notes: z.string().nullable(),
                sourceUrl: z.string().nullable(),
                sourceCapturedAt: z.string().nullable(),
                createdAt: z.string().nullable(),
              }),
            ),
          }),
        ),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    resolveConflict: {
      method: "PATCH" as const,
      path: "/api/review/words/:id/resolve-conflict" as const,
      input: z.object({
        toStatus: z.nativeEnum(ReviewStatusEnum),
        notes: z.string().max(API_VALIDATION_LIMITS.REVIEW_NOTES_MAX).optional(),
        reviewerConfidenceScore: z
          .number()
          .int()
          .min(API_VALIDATION_LIMITS.REVIEWER_CONFIDENCE_MIN)
          .max(API_VALIDATION_LIMITS.REVIEWER_CONFIDENCE_MAX)
          .optional(),
      }),
      responses: {
        200: successResponseSchema(
          z.object({
            id: z.number(),
            reviewStatus: z.nativeEnum(ReviewStatusEnum),
            reviewerConfidenceScore: z.number().int().min(1).max(5).nullable(),
            requiresSecondaryReview: z.boolean(),
            disagreementStatus: z.nativeEnum(ReviewDisagreementStatusEnum),
            reviewNotes: z.string().nullable(),
            reviewedBy: z.string().nullable(),
            reviewedAt: z.string().nullable(),
          }),
        ),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
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
        examples: z
          .array(
            z.object({
              originalScript: z.string().trim().min(1),
              pronunciation: z.string().trim().min(1),
              englishSentence: z.string().trim().min(1),
              contextTag: z.string().trim().min(1).default("general"),
              difficulty: z
                .number()
                .int()
                .min(API_VALIDATION_LIMITS.EXAMPLE_DIFFICULTY_MIN)
                .max(API_VALIDATION_LIMITS.EXAMPLE_DIFFICULTY_MAX)
                .default(API_VALIDATION_LIMITS.EXAMPLE_DIFFICULTY_MIN),
            }),
          )
          .min(1),
      }),
      responses: {
        201: successResponseSchema(
          z.object({
            id: z.number(),
            reviewStatus: z.literal(ReviewStatusEnum.DRAFT),
            examplesCreated: z.number().int().nonnegative(),
          }),
        ),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    seed: {
      method: "POST" as const,
      path: "/api/admin/seed" as const,
      responses: {
        200: successResponseSchema(z.object({ message: z.string() })),
      },
    },
    srsDrift: {
      method: "GET" as const,
      path: "/api/admin/srs/drift" as const,
      input: z
        .object({
          language: z.nativeEnum(LanguageEnum).optional(),
        })
        .optional(),
      responses: {
        200: successResponseSchema(
          z.object({
            generatedAt: z.string(),
            overdueCount: z.number(),
            totalTracked: z.number(),
            overdueRatio: z.number(),
            highIntervalCount: z.number(),
            highIntervalRatio: z.number(),
            emptyReviewDays: z.number(),
            alerts: z.array(
              z.object({
                code: z.enum(["overdue_growth", "interval_spike", "empty_review_days"]),
                severity: z.enum(["warning", "critical"]),
                message: z.string(),
              }),
            ),
          }),
        ),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    vocabExport: {
      method: "GET" as const,
      path: "/api/admin/vocabulary/export" as const,
      responses: {
        200: successResponseSchema(
          z.object({
            generatedAt: z.string(),
            words: z.array(seedWordSchema),
            sentences: z.array(seedSentenceSchema),
          }),
        ),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
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
export function parseSuccessResponse<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown,
): z.infer<T> extends { data: infer U } ? U : never {
  const parsed = schema.parse(payload) as { data: unknown };
  return parsed.data as z.infer<T> extends { data: infer U } ? U : never;
}

type SuccessData<T extends z.ZodTypeAny> = z.infer<T> extends { data: infer U } ? U : never;

export type QuizGenerateResponse = SuccessData<(typeof api.quiz.generate.responses)[200]>;
export type QuizSubmitInput = z.infer<typeof api.quiz.submit.input>;
export type QuizSubmitResponse = SuccessData<(typeof api.quiz.submit.responses)[200]>;
export type StatsResponse = SuccessData<(typeof api.stats.get.responses)[200]>;
