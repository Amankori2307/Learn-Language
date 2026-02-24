import { Injectable } from "@nestjs/common";
import { ConfigService, type ConfigType } from "@nestjs/config";
import { feedbackConfig } from "../../config/feedback.config";

@Injectable()
export class FeedbackRepository {
  constructor(private readonly configService: ConfigService) {}

  getFeedbackRecipientEmail(): string {
    const config = this.configService.getOrThrow<ConfigType<typeof feedbackConfig>>("feedback");
    return config.emailTo;
  }
}
