import { Injectable } from "@nestjs/common";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";

@Injectable()
export class AnalyticsRepository {
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
