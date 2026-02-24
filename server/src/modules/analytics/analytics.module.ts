import { Module } from "@nestjs/common";
import { AnalyticsApiController } from "./analytics.controller";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsService } from "./analytics.service";

@Module({
  controllers: [AnalyticsApiController],
  providers: [AnalyticsRepository, AnalyticsService],
})
export class AnalyticsApiModule {}
