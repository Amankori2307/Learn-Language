import { Injectable } from "@nestjs/common";
import { z } from "zod";
import type { Request, Response } from "express";
import { api } from "@shared/routes";
import { logApiEvent, sendError } from "../../http";
import { sendFeedbackEmail } from "../../services/feedback-email";
import { FeedbackRepository } from "./feedback.repository";

interface IClaims {
  sub?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface IFeedbackService {
  submitFeedback(req: Request, res: Response): Promise<void>;
}

@Injectable()
export class FeedbackService implements IFeedbackService {
  constructor(private readonly repository: FeedbackRepository) {}

  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const parsed = api.feedback.submit.input.parse(req.body);
      const claims = ((req.user as { claims?: IClaims } | undefined)?.claims ?? {}) as IClaims;
      const userId = String(claims.sub ?? "unknown");
      const userEmail = typeof claims.email === "string" ? claims.email : null;
      const userName = [claims.first_name, claims.last_name]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .join(" ")
        .trim();

      await sendFeedbackEmail({
        userId,
        userEmail,
        userName: userName.length > 0 ? userName : null,
        subject: parsed.subject,
        message: parsed.message,
        pageUrl: parsed.pageUrl,
        rating: parsed.rating,
      });

      const sentTo = this.repository.getFeedbackRecipientEmail();
      logApiEvent(req, "feedback_submitted", {
        userId,
        subject: parsed.subject,
        sentTo,
      });

      res.json({
        ok: true,
        sentTo,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(req, res, 400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
        return;
      }
      sendError(req, res, 500, "INTERNAL_ERROR", "Failed to submit feedback");
    }
  }
}
