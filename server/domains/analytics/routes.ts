import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";
import { parseLanguage } from "../common/language";

export function registerAnalyticsRoutes(app: Express) {
  app.get(api.stats.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.stats.get.input?.parse(req.query) ?? {};
    const stats = await storage.getUserStats(userId, parsed.language);
    res.json(stats);
  });

  app.get(api.analytics.learning.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.analytics.learning.input?.parse(req.query) ?? {};
    const insights = await storage.getLearningInsights(userId, parsed.language);
    res.json(insights);
  });

  app.get(api.attempts.history.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.attempts.history.input?.safeParse(req.query);
    const parsedData = parsed && parsed.success ? parsed.data : null;
    const limit = parsedData?.limit ?? 100;
    const language = parsedData?.language ?? parseLanguage(req.query.language);
    const history = await storage.getUserAttemptHistory(userId, limit, language);
    res.json(
      history.map((item) => ({
        ...item,
        createdAt: item.createdAt?.toISOString() ?? null,
      })),
    );
  });

  app.get(api.leaderboard.list.path, isAuthenticated, async (req, res) => {
    const parsed = api.leaderboard.list.input?.parse(req.query) ?? { window: "weekly", limit: 25 };
    const window = parsed.window ?? "weekly";
    const limit = parsed.limit ?? 25;
    const leaderboard = await storage.getLeaderboard(window, limit, parsed.language);
    res.json(leaderboard);
  });
}

