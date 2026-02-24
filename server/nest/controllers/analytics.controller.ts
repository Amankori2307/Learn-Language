import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AnalyticsService } from "../../domains/analytics/analytics.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";

@Controller()
@UseGuards(AuthenticatedGuard)
export class AnalyticsApiController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("/api/stats")
  getStats(@Req() req: Request, @Res() res: Response) {
    return this.analyticsService.getStats(req, res);
  }

  @Get("/api/analytics/learning")
  getLearningInsights(@Req() req: Request, @Res() res: Response) {
    return this.analyticsService.getLearningInsights(req, res);
  }

  @Get("/api/attempts/history")
  getAttemptHistory(@Req() req: Request, @Res() res: Response) {
    return this.analyticsService.getAttemptHistory(req, res);
  }

  @Get("/api/leaderboard")
  getLeaderboard(@Req() req: Request, @Res() res: Response) {
    return this.analyticsService.getLeaderboard(req, res);
  }
}

