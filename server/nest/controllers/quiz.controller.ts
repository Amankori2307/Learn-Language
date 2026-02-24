import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { QuizService } from "../../domains/quiz/quiz.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";

@Controller()
@UseGuards(AuthenticatedGuard)
export class QuizApiController {
  constructor(private readonly quizService: QuizService) {}

  @Get("/api/quiz/generate")
  generateQuiz(@Req() req: Request, @Res() res: Response) {
    return this.quizService.generateQuiz(req, res);
  }

  @Post("/api/quiz/submit")
  submitQuizAnswer(@Req() req: Request, @Res() res: Response) {
    return this.quizService.submitQuizAnswer(req, res);
  }
}

