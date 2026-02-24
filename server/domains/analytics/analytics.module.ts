import type { Express } from "express";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsService } from "./analytics.service";

export function registerAnalyticsModule(app: Express): void {
  const repository = new AnalyticsRepository();
  const service = new AnalyticsService(repository);
  const controller = new AnalyticsController(service);
  controller.register(app);
}

