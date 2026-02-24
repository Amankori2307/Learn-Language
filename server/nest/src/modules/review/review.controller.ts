import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { ReviewService } from "../../../../domains/review/review.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { ReviewerGuard } from "../../common/guards/reviewer.guard";
import {
  ReviewBulkTransitionBodyDto,
  ReviewConflictsQueryDto,
  ReviewQueueQueryDto,
  ReviewResolveConflictBodyDto,
  ReviewSubmitDraftBodyDto,
  ReviewTransitionBodyDto,
} from "../../common/dto/review.dto";

@Controller()
export class ReviewApiController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get("/api/review/queue")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getQueue(@Req() req: Request, @Res() res: Response, @Query() query: ReviewQueueQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.reviewService.getQueue(req, res);
  }

  @Get("/api/review/conflicts")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getConflicts(@Req() req: Request, @Res() res: Response, @Query() query: ReviewConflictsQueryDto) {
    req.query = query as unknown as Request["query"];
    return this.reviewService.getConflicts(req, res);
  }

  @Patch("/api/review/words/:id")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  transition(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ReviewTransitionBodyDto,
  ) {
    req.params.id = String(id);
    req.body = body;
    return this.reviewService.transition(req, res);
  }

  @Patch("/api/review/words/bulk")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  bulkTransition(@Req() req: Request, @Res() res: Response, @Body() body: ReviewBulkTransitionBodyDto) {
    req.body = body;
    return this.reviewService.bulkTransition(req, res);
  }

  @Patch("/api/review/words/:id/resolve-conflict")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  resolveConflict(
    @Req() req: Request,
    @Res() res: Response,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ReviewResolveConflictBodyDto,
  ) {
    req.params.id = String(id);
    req.body = body;
    return this.reviewService.resolveConflict(req, res);
  }

  @Get("/api/review/words/:id/history")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getHistory(@Req() req: Request, @Res() res: Response, @Param("id", ParseIntPipe) id: number) {
    req.params.id = String(id);
    return this.reviewService.getHistory(req, res);
  }

  @Post("/api/review/words")
  @UseGuards(AuthenticatedGuard)
  submitDraft(@Req() req: Request, @Res() res: Response, @Body() body: ReviewSubmitDraftBodyDto) {
    req.body = body;
    return this.reviewService.submitDraft(req, res);
  }
}
