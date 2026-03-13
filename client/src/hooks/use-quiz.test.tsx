import { describe, expect, it, vi, beforeEach } from "vitest";
import { api } from "@shared/routes";
import { LanguageEnum, QuizDirectionEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { useSeedData, useSubmitAnswer } from "./use-quiz";

const invalidateQueries = vi.fn();
const useMutationMock = vi.fn();
const postMock = vi.fn();
const apiRequestMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: (options: unknown) => useMutationMock(options),
  useQueryClient: () => ({
    invalidateQueries,
  }),
}));

vi.mock("@/hooks/use-language", () => ({
  useLearningLanguage: () => ({
    language: LanguageEnum.TELUGU,
  }),
}));

vi.mock("@/services/apiClient", () => ({
  apiClient: Object.assign((...args: unknown[]) => apiRequestMock(...args), {
    post: (...args: unknown[]) => postMock(...args),
  }),
  buildApiUrl: (path: string) => path,
}));

describe("useSeedData", () => {
  beforeEach(() => {
    invalidateQueries.mockReset();
    postMock.mockReset();
    apiRequestMock.mockReset();
    useMutationMock.mockImplementation((options) => options);
  });

  it("invalidates only seed-affected query resources after a successful seed run", async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        error: false,
        message: "ok",
        requestId: "seed-request",
        data: { message: "Seed complete" },
      },
    });

    const mutation = useSeedData();

    await mutation.mutationFn();
    mutation.onSuccess?.();

    expect(postMock).toHaveBeenCalledWith(api.admin.seed.path);
    expect(invalidateQueries).toHaveBeenCalledTimes(13);
    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: [api.stats.get.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: [api.analytics.learning.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: [api.analytics.wordBuckets.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: [api.attempts.history.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(5, {
      queryKey: [api.leaderboard.list.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(6, {
      queryKey: [api.words.list.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(7, {
      queryKey: [api.words.get.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(8, {
      queryKey: [api.clusters.list.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(9, {
      queryKey: [api.clusters.get.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(10, {
      queryKey: [api.quiz.generate.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(11, {
      queryKey: [api.review.queue.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(12, {
      queryKey: [api.review.history.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(13, {
      queryKey: [api.admin.srsDrift.path],
    });
  });
});

describe("useSubmitAnswer", () => {
  beforeEach(() => {
    invalidateQueries.mockReset();
    postMock.mockReset();
    apiRequestMock.mockReset();
    useMutationMock.mockImplementation((options) => options);
  });

  it("invalidates learner progress surfaces affected by quiz submission", async () => {
    apiRequestMock.mockResolvedValue({
      data: {
        success: true,
        error: false,
        message: "ok",
        requestId: "quiz-submit",
        data: {
          isCorrect: true,
          correctAnswer: {
            originalScript: "నమస్తే",
            english: "hello",
            transliteration: "namaste",
            exampleSentences: [],
          },
          examples: [],
          progressUpdate: {
            streak: 3,
            masteryLevel: 2,
            nextReview: new Date().toISOString(),
          },
        },
      },
    });

    const mutation = useSubmitAnswer();

    await mutation.mutationFn({
      wordId: 11,
      selectedOptionId: 11,
      questionType: QuizQuestionTypeEnum.SOURCE_TO_TARGET,
      direction: QuizDirectionEnum.SOURCE_TO_TARGET,
      confidenceLevel: 2,
      responseTimeMs: 1200,
    });
    mutation.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledTimes(5);
    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: [api.stats.get.path, LanguageEnum.TELUGU],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: [api.analytics.learning.path, LanguageEnum.TELUGU],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: [api.analytics.wordBuckets.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: [api.attempts.history.path],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(5, {
      queryKey: [api.leaderboard.list.path],
    });
  });
});
