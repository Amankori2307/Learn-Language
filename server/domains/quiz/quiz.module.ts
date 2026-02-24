import type { Express } from "express";
import { QuizController } from "./quiz.controller";
import { QuizRepository } from "./quiz.repository";
import { QuizService } from "./quiz.service";

export function registerQuizModule(app: Express): void {
  const repository = new QuizRepository();
  const service = new QuizService(repository);
  const controller = new QuizController(service);
  controller.register(app);
}

