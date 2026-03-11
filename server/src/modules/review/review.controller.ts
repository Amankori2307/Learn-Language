import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
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
import { sendError, sendSuccess } from "../../common/http";

@Controller()
export class ReviewApiController {
  constructor(@Inject(ReviewService) private readonly reviewService: ReviewService) {}

  @Get("/review/queue")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getQueue(@Req() req: Request, @Res() res: Response, @Query() query: ReviewQueueQueryDto) {
    try {
      const result = await this.reviewService.getQueue(query);
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/review/conflicts")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getConflicts(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ReviewConflictsQueryDto,
  ) {
    try {
      const result = await this.reviewService.getConflicts(query);
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/review/words/:id")
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
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/review/words/bulk")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async bulkTransition(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ReviewBulkTransitionBodyDto,
  ) {
    try {
      const reviewerId = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.reviewService.bulkTransition(reviewerId, body);
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Patch("/review/words/:id/resolve-conflict")
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
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Get("/review/words/:id/history")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  async getHistory(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
  ) {
    try {
      const result = await this.reviewService.getHistory(id);
      sendSuccess(req, res, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  @Post("/review/words")
  @HttpCode(201)
  @UseGuards(AuthenticatedGuard)
  async submitDraft(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ReviewSubmitDraftBodyDto,
  ) {
    try {
      const submittedBy = (req.user as { claims: { sub: string } }).claims.sub;
      const result = await this.reviewService.submitDraft(submittedBy, body);
      res.status(201);
      sendSuccess(req, res, result);
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
