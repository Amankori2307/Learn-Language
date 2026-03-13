import { Controller, Get, Inject, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import {
  AttemptHistoryQueryDto,
  LanguageQueryDto,
  LeaderboardQueryDto,
  WordBucketQueryDto,
} from "./analytics.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError, sendSuccess } from "../../common/http";

@Controller()
@UseGuards(AuthenticatedGuard)
export class AnalyticsApiController {
  constructor(@Inject(AnalyticsService) private readonly analyticsService: AnalyticsService) {}

  @Get("/stats")
  async getStats(@Req() req: Request, @Res() res: Response, @Query() query: LanguageQueryDto) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const stats = await this.analyticsService.getStats(userId, query.language);
      sendSuccess(req, res, stats);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/analytics/learning")
  async getLearningInsights(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: LanguageQueryDto,
  ) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const insights = await this.analyticsService.getLearningInsights(userId, query.language);
      sendSuccess(req, res, insights);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/analytics/word-buckets")
  async getWordBucket(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: WordBucketQueryDto,
  ) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.analyticsService.getWordBucket(userId, query);
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/attempts/history")
  async getAttemptHistory(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: AttemptHistoryQueryDto,
  ) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const history = await this.analyticsService.getAttemptHistory(userId, query);
      sendSuccess(req, res, history);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/leaderboard")
  async getLeaderboard(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: LeaderboardQueryDto,
    ) {
    try {
      const userId = (req.user as { claims: { sub: string } }).claims.sub;
      const leaderboard = await this.analyticsService.getLeaderboard(userId, query);
      sendSuccess(req, res, leaderboard);
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
