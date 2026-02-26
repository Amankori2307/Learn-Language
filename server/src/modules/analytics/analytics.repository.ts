import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";

@Injectable()
@LogMethodLifecycle()
export class AnalyticsRepository {
  getUserStats(userId: string, language?: LanguageEnum) {
    return storage.getUserStats(userId, language);
  }

  getLearningInsights(userId: string, language?: LanguageEnum) {
    return storage.getLearningInsights(userId, language);
  }

  getWordBucket(
    userId: string,
    input: { bucket: "mastered" | "learning" | "needs_review"; page: number; limit: number; language?: LanguageEnum },
  ) {
    return storage.getWordBucket(userId, input);
  }

  getUserAttemptHistory(userId: string, limit: number, language?: LanguageEnum) {
    return storage.getUserAttemptHistory(userId, limit, language);
  }

  getLeaderboard(window: "daily" | "weekly" | "all_time", limit: number, language?: LanguageEnum) {
    return storage.getLeaderboard(window, limit, language);
  }
}
