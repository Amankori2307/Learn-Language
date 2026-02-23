import type { Express } from "express";
import { z } from "zod";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import { config } from "../../config";
import { logApiEvent, sendError } from "../../http";
import { sendFeedbackEmail } from "../../services/feedback-email";

export function registerFeedbackRoutes(app: Express) {
  app.post(api.feedback.submit.path, isAuthenticated, async (req: any, res) => {
    try {
      const parsed = api.feedback.submit.input.parse(req.body);
      const claims = req.user?.claims ?? {};
      const userId = String(claims.sub ?? "unknown");
      const userEmail = typeof claims.email === "string" ? claims.email : null;
      const userName =
        [claims.first_name, claims.last_name]
          .filter((value: unknown) => typeof value === "string" && value.trim().length > 0)
          .join(" ")
          .trim() || null;

      await sendFeedbackEmail({
        userId,
        userEmail,
        userName,
        subject: parsed.subject,
        message: parsed.message,
        pageUrl: parsed.pageUrl,
        rating: parsed.rating,
      });

      logApiEvent(req, "feedback_submitted", {
        userId,
        subject: parsed.subject,
        sentTo: config.FEEDBACK_EMAIL_TO,
      });

      res.json({
        ok: true,
        sentTo: config.FEEDBACK_EMAIL_TO,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(req, res, 400, "VALIDATION_ERROR", error.errors[0]?.message ?? "Invalid request");
      }
      return sendError(req, res, 500, "INTERNAL_ERROR", "Failed to submit feedback");
    }
  });
}

