import { z } from 'zod';
import { insertWordSchema, insertClusterSchema, words, clusters, userWordProgress, quizAttempts } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
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
        mode: z.enum(['daily_review', 'new_words', 'cluster', 'weak_words']).default('daily_review'),
        clusterId: z.coerce.number().optional(),
        count: z.coerce.number().default(10),
      }).optional(),
      responses: {
        200: z.array(z.object({
          wordId: z.number(),
          type: z.enum(['telugu_to_english', 'english_to_telugu', 'audio']),
          questionText: z.string(),
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
        confidenceLevel: z.number().min(1).max(3),
      }),
      responses: {
        200: z.object({
          isCorrect: z.boolean(),
          correctAnswer: z.custom<typeof words.$inferSelect>(),
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
        }),
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
