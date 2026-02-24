import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { QuizService } from "./quiz.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { GenerateQuizQueryDto, SubmitQuizBodyDto } from "./quiz.dto";
import { AppError } from "../../common/errors/app-error";
import { logApiEvent, sendError } from "../../../../http";

@Controller()
@UseGuards(AuthenticatedGuard)
export class QuizApiController {
  constructor(private readonly quizService: QuizService) {}

  @Get("/api/quiz/generate")
  async generateQuiz(@Req() req: Request, @Res() res: Response, @Query() query: GenerateQuizQueryDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.quizService.generateQuiz({
        userId,
        mode: query.mode,
        clusterId: query.clusterId,
        count: query.count,
        language: query.language,
      });
      logApiEvent(req, "quiz_session_generated", {
        userId,
        mode: query.mode ?? null,
        countRequested: query.count ?? 10,
        countGenerated: result.length,
        clusterId: query.clusterId ?? null,
      });
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Post("/api/quiz/submit")
  async submitQuizAnswer(@Req() req: Request, @Res() res: Response, @Body() body: SubmitQuizBodyDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.quizService.submitQuizAnswer({
        userId,
        payload: body,
      });
      logApiEvent(req, "quiz_answer_submitted", {
        userId,
        wordId: body.wordId,
        isCorrect: result.isCorrect,
        direction: body.direction ?? null,
        responseTimeMs: body.responseTimeMs ?? null,
      });
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  private handleError(req: Request, res: Response, error: unknown) {
    if (error instanceof AppError) {
      sendError(req, res, error.status, error.code, error.message, error.details);
      return;
    }
    sendError(req, res, 500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
