import { Module } from "@nestjs/common";
import { FeedbackApiController } from "./feedback.controller";
import { FeedbackRepository } from "./feedback.repository";
import { FeedbackService } from "./feedback.service";

@Module({
  controllers: [FeedbackApiController],
  providers: [FeedbackRepository, FeedbackService],
})
export class FeedbackApiModule {}
