import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AnalyticsService } from "../../../../domains/analytics/analytics.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { AttemptHistoryQueryDto, LanguageQueryDto, LeaderboardQueryDto } from "../../common/dto/analytics.dto";

@Controller()
@UseGuards(AuthenticatedGuard)
export class AnalyticsApiController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("/api/stats")
  getStats(@Req() req: Request, @Res() res: Response, @Query() query: LanguageQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.analyticsService.getStats(req, res);
  }

  @Get("/api/analytics/learning")
  getLearningInsights(@Req() req: Request, @Res() res: Response, @Query() query: LanguageQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.analyticsService.getLearningInsights(req, res);
  }

  @Get("/api/attempts/history")
  getAttemptHistory(@Req() req: Request, @Res() res: Response, @Query() query: AttemptHistoryQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.analyticsService.getAttemptHistory(req, res);
  }

  @Get("/api/leaderboard")
  getLeaderboard(@Req() req: Request, @Res() res: Response, @Query() query: LeaderboardQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.analyticsService.getLeaderboard(req, res);
  }
}
