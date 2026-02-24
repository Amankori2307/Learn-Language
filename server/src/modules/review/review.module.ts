import { Module } from "@nestjs/common";
import { ReviewApiController } from "./review.controller";
import { ReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";

@Module({
  controllers: [ReviewApiController],
  providers: [ReviewRepository, ReviewService],
})
export class ReviewApiModule {}
