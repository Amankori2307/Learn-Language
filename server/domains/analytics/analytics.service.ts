import type { Request, Response } from "express";
import { api } from "@shared/routes";
import { parseLanguage } from "../common/language";
import type { IAnalyticsRepository } from "./analytics.repository";

export interface IAnalyticsService {
  getStats(req: Request, res: Response): Promise<void>;
  getLearningInsights(req: Request, res: Response): Promise<void>;
  getAttemptHistory(req: Request, res: Response): Promise<void>;
  getLeaderboard(req: Request, res: Response): Promise<void>;
}

export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly repository: IAnalyticsRepository) {}

  async getStats(req: Request, res: Response): Promise<void> {
    const userId = (req.user as { claims: { sub: string } }).claims.sub;
    const parsed = api.stats.get.input?.parse(req.query) ?? {};
    const stats = await this.repository.getUserStats(userId, parsed.language);
    res.json(stats);
  }

  async getLearningInsights(req: Request, res: Response): Promise<void> {
    const userId = (req.user as { claims: { sub: string } }).claims.sub;
    const parsed = api.analytics.learning.input?.parse(req.query) ?? {};
    const insights = await this.repository.getLearningInsights(userId, parsed.language);
    res.json(insights);
  }

  async getAttemptHistory(req: Request, res: Response): Promise<void> {
    const userId = (req.user as { claims: { sub: string } }).claims.sub;
    const parsed = api.attempts.history.input?.safeParse(req.query);
    const parsedData = parsed && parsed.success ? parsed.data : null;
    const limit = parsedData?.limit ?? 100;
    const language = parsedData?.language ?? parseLanguage(req.query.language);
    const history = await this.repository.getUserAttemptHistory(userId, limit, language);
    res.json(
      history.map((item) => ({
        ...item,
        createdAt: item.createdAt?.toISOString() ?? null,
      })),
    );
  }

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const parsed = api.leaderboard.list.input?.parse(req.query) ?? { window: "weekly", limit: 25 };
    const window = parsed.window ?? "weekly";
    const limit = parsed.limit ?? 25;
    const leaderboard = await this.repository.getLeaderboard(window, limit, parsed.language);
    res.json(leaderboard);
  }
}

