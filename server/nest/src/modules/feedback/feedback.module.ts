import { Module } from "@nestjs/common";
import { FeedbackApiController } from "./feedback.controller";
import { FeedbackRepository } from "../../../../domains/feedback/feedback.repository";
import { FeedbackService } from "../../../../domains/feedback/feedback.service";

@Module({
  controllers: [FeedbackApiController],
  providers: [FeedbackRepository, FeedbackService],
})
export class FeedbackApiModule {}
