import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import type { IAnalyticsService } from "./analytics.service";

export interface IAnalyticsController {
  register(app: Express): void;
}

export class AnalyticsController implements IAnalyticsController {
  constructor(private readonly service: IAnalyticsService) {}

  register(app: Express): void {
    app.get(api.stats.get.path, isAuthenticated, (req, res) => this.service.getStats(req, res));
    app.get(api.analytics.learning.path, isAuthenticated, (req, res) =>
      this.service.getLearningInsights(req, res),
    );
    app.get(api.attempts.history.path, isAuthenticated, (req, res) => this.service.getAttemptHistory(req, res));
    app.get(api.leaderboard.list.path, isAuthenticated, (req, res) => this.service.getLeaderboard(req, res));
  }
}

