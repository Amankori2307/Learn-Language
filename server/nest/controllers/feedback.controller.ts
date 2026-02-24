import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { FeedbackService } from "../../domains/feedback/feedback.service";
import { AuthenticatedGuard } from "../guards/authenticated.guard";

@Controller()
@UseGuards(AuthenticatedGuard)
export class FeedbackApiController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post("/api/feedback")
  submitFeedback(@Req() req: Request, @Res() res: Response) {
    return this.feedbackService.submitFeedback(req, res);
  }
}

