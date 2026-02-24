import type { Express } from "express";
import { registerFeedbackModule } from "./feedback.module";

export function registerFeedbackRoutes(app: Express) {
  registerFeedbackModule(app);
}
