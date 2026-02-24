import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { QuizService } from "../../domains/quiz/quiz.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { GenerateQuizQueryDto, SubmitQuizBodyDto } from "../dto/quiz.dto";

@Controller()
@UseGuards(AuthenticatedGuard)
export class QuizApiController {
  constructor(private readonly quizService: QuizService) {}

  @Get("/api/quiz/generate")
  generateQuiz(@Req() req: Request, @Res() res: Response, @Query() query: GenerateQuizQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.quizService.generateQuiz(req, res);
  }

  @Post("/api/quiz/submit")
  submitQuizAnswer(@Req() req: Request, @Res() res: Response, @Body() body: SubmitQuizBodyDto) {
    req.body = body;
    return this.quizService.submitQuizAnswer(req, res);
  }
}
