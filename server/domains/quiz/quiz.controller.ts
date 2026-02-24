import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import type { IQuizService } from "./quiz.service";

export interface IQuizController {
  register(app: Express): void;
}

export class QuizController implements IQuizController {
  constructor(private readonly service: IQuizService) {}

  register(app: Express): void {
    app.get(api.quiz.generate.path, isAuthenticated, (req, res) => this.service.generateQuiz(req, res));
    app.post(api.quiz.submit.path, isAuthenticated, (req, res) => this.service.submitQuizAnswer(req, res));
  }
}

