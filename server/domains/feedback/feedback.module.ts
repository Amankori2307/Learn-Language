import type { Express } from "express";
import { FeedbackController } from "./feedback.controller";
import { FeedbackRepository } from "./feedback.repository";
import { FeedbackService } from "./feedback.service";

export function registerFeedbackModule(app: Express): void {
  const repository = new FeedbackRepository();
  const service = new FeedbackService(repository);
  const controller = new FeedbackController(service);
  controller.register(app);
}

