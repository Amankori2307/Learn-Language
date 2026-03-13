import { describe, expect, it } from "vitest";
import { QuizModeEnum, ReviewStatusEnum } from "@shared/domain/enums";
import {
  attemptHistoryQueryKey,
} from "./use-attempt-history";
import { leaderboardQueryKey } from "./use-leaderboard";
import { wordBucketQueryKey } from "./use-word-bucket";
import { clusterQueryKey, clustersCatalogQueryKey, clustersQueryKey } from "./use-clusters";
import { authMeQueryKey } from "./use-auth";
import { profileQueryKey } from "./use-profile";
import { reviewHistoryQueryKey, reviewQueueQueryKey } from "./use-review";
import {
  learningInsightsQueryKey,
  quizGenerateQueryKey,
  statsQueryKey,
} from "./use-quiz";
import { wordQueryKey, wordsQueryKey } from "./use-words";

describe("shared query key builders", () => {
  it("builds stable learner analytics and quiz query keys", () => {
    expect(quizGenerateQueryKey(QuizModeEnum.DAILY_REVIEW, null, "telugu")).toEqual([
      "/api/quiz/generate",
      QuizModeEnum.DAILY_REVIEW,
      null,
      "telugu",
    ]);
    expect(statsQueryKey("telugu")).toEqual(["/api/stats", "telugu"]);
    expect(learningInsightsQueryKey("telugu")).toEqual([
      "/api/analytics/learning",
      "telugu",
    ]);
    expect(
      attemptHistoryQueryKey(
        {
          page: 1,
          limit: 20,
          search: "",
          result: "all",
          direction: "all",
          sort: "newest",
        },
        "telugu",
      ),
    ).toEqual([
      "/api/attempts/history",
      1,
      20,
      "",
      "all",
      "all",
      "newest",
      "telugu",
    ]);
    expect(leaderboardQueryKey("weekly", 1, 25, "telugu")).toEqual([
      "/api/leaderboard",
      "weekly",
      1,
      25,
      "telugu",
    ]);
    expect(wordBucketQueryKey("learning", 2, 20, "telugu")).toEqual([
      "/api/analytics/word-buckets",
      "learning",
      2,
      20,
      "telugu",
    ]);
  });

  it("builds stable vocabulary, profile, and review query keys", () => {
    expect(clustersQueryKey("telugu")).toEqual(["/api/clusters", "telugu"]);
    expect(
      clustersCatalogQueryKey(
        {
          q: "",
          type: "all",
          sort: "words_desc",
          page: 1,
          limit: 12,
        },
        "telugu",
      ),
    ).toEqual(["/api/clusters", "", "all", "words_desc", 1, 12, "telugu"]);
    expect(clusterQueryKey(42, "telugu")).toEqual(["/api/clusters/:id", 42, "telugu"]);
    expect(wordsQueryKey()).toEqual(["/api/words", null]);
    expect(wordsQueryKey(42)).toEqual(["/api/words", 42]);
    expect(wordQueryKey(42)).toEqual(["/api/words/:id", 42]);
    expect(profileQueryKey()).toEqual(["/api/auth/profile"]);
    expect(authMeQueryKey()).toEqual(["/api/auth/me"]);
    expect(reviewQueueQueryKey(ReviewStatusEnum.PENDING_REVIEW, 1, 50)).toEqual([
      "/api/review/queue",
      ReviewStatusEnum.PENDING_REVIEW,
      1,
      50,
    ]);
    expect(reviewHistoryQueryKey(42)).toEqual(["/api/review/words/:id/history", 42]);
  });
});
