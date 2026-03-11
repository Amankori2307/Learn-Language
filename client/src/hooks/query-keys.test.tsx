import { describe, expect, it } from "vitest";
import { QuizModeEnum, ReviewStatusEnum } from "@shared/domain/enums";
import {
  attemptHistoryQueryKey,
} from "./use-attempt-history";
import { leaderboardQueryKey } from "./use-leaderboard";
import { wordBucketQueryKey } from "./use-word-bucket";
import { clusterQueryKey, clustersQueryKey } from "./use-clusters";
import { authMeQueryKey, profileQueryKey } from "./use-profile";
import { reviewHistoryQueryKey, reviewQueueQueryKey } from "./use-review";
import {
  learningInsightsQueryKey,
  quizGenerateQueryKey,
  statsQueryKey,
} from "./use-quiz";

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
    expect(attemptHistoryQueryKey(200, "telugu")).toEqual([
      "/api/attempts/history",
      200,
      "telugu",
    ]);
    expect(leaderboardQueryKey("weekly", 25, "telugu")).toEqual([
      "/api/leaderboard",
      "weekly",
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
    expect(clusterQueryKey(42, "telugu")).toEqual(["/api/clusters/:id", 42, "telugu"]);
    expect(profileQueryKey()).toEqual(["/api/auth/profile"]);
    expect(authMeQueryKey()).toEqual(["/api/auth/me"]);
    expect(reviewQueueQueryKey(ReviewStatusEnum.PENDING_REVIEW, 50)).toEqual([
      "/api/review/queue",
      ReviewStatusEnum.PENDING_REVIEW,
      50,
    ]);
    expect(reviewHistoryQueryKey(42)).toEqual(["/api/review/words/:id/history", 42]);
  });
});
