import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import type { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ReviewerGuard } from "../../common/guards/reviewer.guard";
import {
  ReviewBulkTransitionBodyDto,
  ReviewConflictsQueryDto,
  ReviewQueueQueryDto,
  ReviewResolveConflictBodyDto,
  ReviewSubmitDraftBodyDto,
  ReviewTransitionBodyDto,
} from "./review.dto";
import { AppError } from "../../common/errors/app-error";
import { sendError } from "../../common/http";

@Controller()
@LogMethodLifecycle()
export class ReviewApiController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get("/api/review/queue")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getQueue(@Req() req: Request, @Res() res: Response, @Query() query: ReviewQueueQueryDto) {
    try {
      const result = await this.reviewService.getQueue(query);
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/review/conflicts")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getConflicts(@Req() req: Request, @Res() res: Response, @Query() query: ReviewConflictsQueryDto) {
    try {
      const result = await this.reviewService.getConflicts(query);
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/api/review/words/:id")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async transition(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ReviewTransitionBodyDto,
  ) {
    try {
      const reviewerId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.reviewService.transition(id, reviewerId, body);
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/api/review/words/bulk")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async bulkTransition(@Req() req: Request, @Res() res: Response, @Body() body: ReviewBulkTransitionBodyDto) {
    try {
      const reviewerId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.reviewService.bulkTransition(reviewerId, body);
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/api/review/words/:id/resolve-conflict")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async resolveConflict(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ReviewResolveConflictBodyDto,
  ) {
    try {
      const reviewerId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.reviewService.resolveConflict(id, reviewerId, body);
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/api/review/words/:id/history")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getHistory(@Req() req: Request, @Res() res: Response, @Param("id", ParseIntPipe) id: number) {
    try {
      const result = await this.reviewService.getHistory(id);
      res.json(result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Post("/api/review/words")
  @UseGuards(AuthenticatedGuard)
  async submitDraft(@Req() req: Request, @Res() res: Response, @Body() body: ReviewSubmitDraftBodyDto) {
    try {
      const submittedBy = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.reviewService.submitDraft(submittedBy, body);
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
