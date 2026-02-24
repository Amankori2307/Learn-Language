import type { Express } from "express";
import { ReviewController } from "./review.controller";
import { ReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";

export function registerReviewModule(app: Express): void {
  const repository = new ReviewRepository();
  const service = new ReviewService(repository);
  const controller = new ReviewController(service);
  controller.register(app);
}

