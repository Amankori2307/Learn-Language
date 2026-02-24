import { Module } from "@nestjs/common";
import { AnalyticsApiController } from "../controllers/analytics.controller";
import { AnalyticsRepository } from "../../domains/analytics/analytics.repository";
import { AnalyticsService } from "../../domains/analytics/analytics.service";

@Module({
  controllers: [AnalyticsApiController],
  providers: [AnalyticsRepository, AnalyticsService],
})
export class AnalyticsApiModule {}

