import { Inject, Injectable } from "@nestjs/common";
import { LanguageEnum } from "@shared/domain/enums";
import { api } from "@shared/routes";
import { parseLanguage } from "../../common/utils/language";
import { AnalyticsRepository } from "./analytics.repository";
import { AttemptHistoryInput, LeaderboardInput, WordBucketInput } from "./analytics.types";

const ANALYTICS_CACHE_TTL_MS = 15_000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

@Injectable()
export class AnalyticsService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(@Inject(AnalyticsRepository) private readonly repository: AnalyticsRepository) {}

  async getStats(userId: string, language?: LanguageEnum) {
    const parsed = api.stats.get.input?.parse({ language }) ?? {};
    return this.getOrSetCache(
      `stats:${userId}:${parsed.language ?? "all"}`,
      () => this.repository.getUserStats(userId, parsed.language),
    );
  }

  async getLearningInsights(userId: string, language?: LanguageEnum) {
    const parsed = api.analytics.learning.input?.parse({ language }) ?? {};
    return this.getOrSetCache(
      `learning:${userId}:${parsed.language ?? "all"}`,
      () => this.repository.getLearningInsights(userId, parsed.language),
    );
  }

  async getWordBucket(userId: string, input: WordBucketInput) {
    const parsed = api.analytics.wordBuckets.input.parse(input);
    return this.getOrSetCache(
      `word-bucket:${userId}:${parsed.bucket}:${parsed.page}:${parsed.limit}:${parsed.language ?? "all"}`,
      () => this.repository.getWordBucket(userId, parsed),
    );
  }

  async getAttemptHistory(userId: string, input: AttemptHistoryInput) {
    const parsed = api.attempts.history.input?.safeParse(input);
    const parsedData = parsed && parsed.success ? parsed.data : null;
    const limit = parsedData?.limit ?? 100;
    const language = parsedData?.language ?? parseLanguage(input.language);
    return this.getOrSetCache(`history:${userId}:${limit}:${language ?? "all"}`, async () => {
      const history = await this.repository.getUserAttemptHistory(userId, limit, language);
      return history.map((item) => ({
        ...item,
        createdAt: item.createdAt?.toISOString() ?? null,
      }));
    });
  }

  async getLeaderboard(input: LeaderboardInput) {
    const parsed = api.leaderboard.list.input?.parse(input) ?? { window: "weekly", limit: 25 };
    const window = parsed.window ?? "weekly";
    const limit = parsed.limit ?? 25;
    return this.getOrSetCache(
      `leaderboard:${window}:${limit}:${parsed.language ?? "all"}`,
      () => this.repository.getLeaderboard(window, limit, parsed.language),
    );
  }

  resetCacheForTests() {
    this.cache.clear();
  }

  private async getOrSetCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = this.cache.get(key);
    if (existing && existing.expiresAt > now) {
      return existing.value as T;
    }

    const value = await loader();
    this.cache.set(key, {
      value,
      expiresAt: now + ANALYTICS_CACHE_TTL_MS,
    });
    return value;
  }
}
