import { Injectable } from "@nestjs/common";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";
import { AttemptHistoryInput, LeaderboardInput } from "./analytics.types";

@Injectable()
export class AnalyticsRepository {
  getUserStats(userId: string, language?: LanguageEnum) {
    return storage.getUserStats(userId, language);
  }

  getLearningInsights(userId: string, language?: LanguageEnum) {
    return storage.getLearningInsights(userId, language);
  }

  getWordBucket(
    userId: string,
    input: {
      bucket: "mastered" | "learning" | "needs_review";
      page: number;
      limit: number;
      language?: LanguageEnum;
    },
  ) {
    return storage.getWordBucket(userId, input);
  }

  getUserAttemptHistory(userId: string, input: AttemptHistoryInput) {
    return storage.getUserAttemptHistory(userId, input);
  }

  getLeaderboard(userId: string, input: LeaderboardInput) {
    return storage.getLeaderboard({
      userId,
      window: input.window ?? "weekly",
      page: input.page,
      limit: input.limit,
      language: input.language,
    });
  }
}
