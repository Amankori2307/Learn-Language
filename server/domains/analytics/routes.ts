import type { Express } from "express";
import { registerAnalyticsModule } from "./analytics.module";

export function registerAnalyticsRoutes(app: Express) {
  registerAnalyticsModule(app);
}
