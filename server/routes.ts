import type { Express } from "express";
import type { Server } from "http";
import { registerAuthModule } from "./auth";
import { registerVocabularyModule } from "./domains/vocabulary/vocabulary.module";
import { registerQuizModule } from "./domains/quiz/quiz.module";
import { registerAnalyticsModule } from "./domains/analytics/analytics.module";
import { registerFeedbackModule } from "./domains/feedback/feedback.module";
import { registerReviewModule } from "./domains/review/review.module";
import { registerInfraModule } from "./domains/infra/infra.module";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await registerAuthModule(app);

  registerVocabularyModule(app);
  registerQuizModule(app);
  registerAnalyticsModule(app);
  registerFeedbackModule(app);
  registerReviewModule(app);
  registerInfraModule(app);

  return httpServer;
}
