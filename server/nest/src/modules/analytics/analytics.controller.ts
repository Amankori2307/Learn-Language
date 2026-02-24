import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { AttemptHistoryQueryDto, LanguageQueryDto, LeaderboardQueryDto } from "./analytics.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError } from "../../../../http";

@Controller()
@UseGuards(AuthenticatedGuard)
export class AnalyticsApiController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("/api/stats")
  async getStats(@Req() req: Request, @Res() res: Response, @Query() query: LanguageQueryDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const stats = await this.analyticsService.getStats(userId, query.language);
      res.json(stats);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/analytics/learning")
  async getLearningInsights(@Req() req: Request, @Res() res: Response, @Query() query: LanguageQueryDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const insights = await this.analyticsService.getLearningInsights(userId, query.language);
      res.json(insights);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/attempts/history")
  async getAttemptHistory(@Req() req: Request, @Res() res: Response, @Query() query: AttemptHistoryQueryDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const history = await this.analyticsService.getAttemptHistory(userId, query);
      res.json(history);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/leaderboard")
  async getLeaderboard(@Req() req: Request, @Res() res: Response, @Query() query: LeaderboardQueryDto) {
    try {
      const leaderboard = await this.analyticsService.getLeaderboard(query);
      res.json(leaderboard);
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
