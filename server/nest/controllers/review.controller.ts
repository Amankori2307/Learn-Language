import { Controller, Get, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { ReviewService } from "../../domains/review/review.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";
import { ReviewerGuard } from "../guards/reviewer.guard";

@Controller()
export class ReviewApiController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get("/api/review/queue")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getQueue(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.getQueue(req, res);
  }

  @Get("/api/review/conflicts")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getConflicts(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.getConflicts(req, res);
  }

  @Patch("/api/review/words/:id")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  transition(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.transition(req, res);
  }

  @Patch("/api/review/words/bulk")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  bulkTransition(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.bulkTransition(req, res);
  }

  @Patch("/api/review/words/:id/resolve-conflict")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  resolveConflict(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.resolveConflict(req, res);
  }

  @Get("/api/review/words/:id/history")
  @UseGuards(AuthenticatedGuard, ReviewerGuard)
  getHistory(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.getHistory(req, res);
  }

  @Post("/api/review/words")
  @UseGuards(AuthenticatedGuard)
  submitDraft(@Req() req: Request, @Res() res: Response) {
    return this.reviewService.submitDraft(req, res);
  }
}
