import { Injectable } from "@nestjs/common";
import { config } from "../../config/runtime.config";

@Injectable()
export class FeedbackRepository {
  getFeedbackRecipientEmail(): string {
    return config.FEEDBACK_EMAIL_TO;
  }
}
