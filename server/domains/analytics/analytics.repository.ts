import { storage } from "../../storage";
import { LanguageEnum } from "@shared/domain/enums";

export interface IAnalyticsRepository {
  getUserStats(userId: string, language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getUserStats>>>;
  getLearningInsights(
    userId: string,
    language?: LanguageEnum,
  ): Promise<Awaited<ReturnType<typeof storage.getLearningInsights>>>;
  getUserAttemptHistory(
    userId: string,
    limit: number,
    language?: LanguageEnum,
  ): Promise<Awaited<ReturnType<typeof storage.getUserAttemptHistory>>>;
  getLeaderboard(
    window: "daily" | "weekly" | "all_time",
    limit: number,
    language?: LanguageEnum,
  ): Promise<Awaited<ReturnType<typeof storage.getLeaderboard>>>;
}

export class AnalyticsRepository implements IAnalyticsRepository {
  getUserStats(userId: string, language?: LanguageEnum) {
    return storage.getUserStats(userId, language);
  }

  getLearningInsights(userId: string, language?: LanguageEnum) {
    return storage.getLearningInsights(userId, language);
  }

  getUserAttemptHistory(userId: string, limit: number, language?: LanguageEnum) {
    return storage.getUserAttemptHistory(userId, limit, language);
  }

  getLeaderboard(window: "daily" | "weekly" | "all_time", limit: number, language?: LanguageEnum) {
    return storage.getLeaderboard(window, limit, language);
  }
}
