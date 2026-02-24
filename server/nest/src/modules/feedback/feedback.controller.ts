import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { FeedbackService } from "../../../../domains/feedback/feedback.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { SubmitFeedbackBodyDto } from "../../common/dto/feedback.dto";

@Controller()
@UseGuards(AuthenticatedGuard)
export class FeedbackApiController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post("/api/feedback")
  submitFeedback(@Req() req: Request, @Res() res: Response, @Body() body: SubmitFeedbackBodyDto) {
    req.body = body;
    return this.feedbackService.submitFeedback(req, res);
  }
}
