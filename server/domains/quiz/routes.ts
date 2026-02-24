import type { Express } from "express";
import { registerQuizModule } from "./quiz.module";

export function registerQuizRoutes(app: Express) {
  registerQuizModule(app);
}
