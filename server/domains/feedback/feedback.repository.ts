import { Injectable } from "@nestjs/common";
import { config } from "../../config";

export interface IFeedbackRepository {
  getFeedbackRecipientEmail(): string;
}

@Injectable()
export class FeedbackRepository implements IFeedbackRepository {
  getFeedbackRecipientEmail(): string {
    return config.FEEDBACK_EMAIL_TO;
  }
}
