import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { FeedbackService } from "./feedback.service";
import { AuthenticatedGuard } from "../../common/guards/authenticated.guard";
import { SubmitFeedbackBodyDto } from "./feedback.dto";
import { AppError } from "../../common/errors/app-error";
import { logApiEvent, sendError } from "../../../../http";

@Controller()
@UseGuards(AuthenticatedGuard)
export class FeedbackApiController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post("/api/feedback")
  async submitFeedback(@Req() req: Request, @Res() res: Response, @Body() body: SubmitFeedbackBodyDto) {
    try {
      const claims = ((req.user as { claims?: Record<string, unknown> } | undefined)?.claims ?? {}) as {
        sub?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
      };
      const result = await this.feedbackService.submitFeedback(claims, body);
      logApiEvent(req, "feedback_submitted", {
        userId: result.userId,
        subject: body.subject,
        sentTo: result.sentTo,
      });
      res.json({
        ok: result.ok,
        sentTo: result.sentTo,
      });
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
