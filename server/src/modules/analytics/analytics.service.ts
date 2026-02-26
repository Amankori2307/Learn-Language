import { Injectable } from "@nestjs/common";
import { LanguageEnum } from "@shared/domain/enums";
import { api } from "@shared/routes";
import { parseLanguage } from "../../common/utils/language";
import { AnalyticsRepository } from "./analytics.repository";
import { AttemptHistoryInput, LeaderboardInput, WordBucketInput } from "./analytics.types";

@Injectable()
export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getStats(userId: string, language?: LanguageEnum) {
    const parsed = api.stats.get.input?.parse({ language }) ?? {};
    return this.repository.getUserStats(userId, parsed.language);
  }

  async getLearningInsights(userId: string, language?: LanguageEnum) {
    const parsed = api.analytics.learning.input?.parse({ language }) ?? {};
    return this.repository.getLearningInsights(userId, parsed.language);
  }

  async getWordBucket(userId: string, input: WordBucketInput) {
    const parsed = api.analytics.wordBuckets.input.parse(input);
    return this.repository.getWordBucket(userId, parsed);
  }

  async getAttemptHistory(userId: string, input: AttemptHistoryInput) {
    const parsed = api.attempts.history.input?.safeParse(input);
    const parsedData = parsed && parsed.success ? parsed.data : null;
    const limit = parsedData?.limit ?? 100;
    const language = parsedData?.language ?? parseLanguage(input.language);
    const history = await this.repository.getUserAttemptHistory(userId, limit, language);
    return history.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString() ?? null,
    }));
  }

  async getLeaderboard(input: LeaderboardInput) {
    const parsed = api.leaderboard.list.input?.parse(input) ?? { window: "weekly", limit: 25 };
    const window = parsed.window ?? "weekly";
    const limit = parsed.limit ?? 25;
    return this.repository.getLeaderboard(window, limit, parsed.language);
  }
}
