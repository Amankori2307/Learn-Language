import type { Express } from "express";
import { registerReviewModule } from "./review.module";

export function registerReviewRoutes(app: Express) {
  registerReviewModule(app);
}
