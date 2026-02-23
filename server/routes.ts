import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./auth";
import { registerVocabularyRoutes } from "./domains/vocabulary/routes";
import { registerQuizRoutes } from "./domains/quiz/routes";
import { registerAnalyticsRoutes } from "./domains/analytics/routes";
import { registerFeedbackRoutes } from "./domains/feedback/routes";
import { registerReviewRoutes } from "./domains/review/routes";
import { registerInfraRoutes } from "./domains/infra/routes";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  registerVocabularyRoutes(app);
  registerQuizRoutes(app);
  registerAnalyticsRoutes(app);
  registerFeedbackRoutes(app);
  registerReviewRoutes(app);
  registerInfraRoutes(app);

  return httpServer;
}

