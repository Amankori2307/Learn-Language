import { Module } from "@nestjs/common";
import { ReviewApiController } from "../controllers/review.controller";
import { ReviewRepository } from "../../domains/review/review.repository";
import { ReviewService } from "../../domains/review/review.service";

@Module({
  controllers: [ReviewApiController],
  providers: [ReviewRepository, ReviewService],
})
export class ReviewApiModule {}

