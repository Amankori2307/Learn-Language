import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { api } from "@shared/routes";
import { sendFeedbackEmail } from "../../infrastructure/services/feedback-email";
import { FeedbackRepository } from "./feedback.repository";
import { AppError } from "../../common/errors/app-error";

type FeedbackUser = {
  sub?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

@Injectable()
export class FeedbackService {
  constructor(private readonly repository: FeedbackRepository) {}

  async submitFeedback(user: FeedbackUser, payload: unknown) {
    try {
      const parsed = api.feedback.submit.input.parse(payload);
      const userId = String(user.sub ?? "unknown");
      const userEmail = typeof user.email === "string" ? user.email : null;
      const userName = [user.first_name, user.last_name]
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

      return {
        ok: true as const,
        sentTo: this.repository.getFeedbackRecipientEmail(),
        userId,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      throw new AppError(500, "INTERNAL_ERROR", "Failed to submit feedback");
    }
  }
}
