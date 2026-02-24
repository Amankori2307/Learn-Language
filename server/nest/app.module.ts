import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthenticatedGuard } from "./guards/authenticated.guard";
import { ReviewerGuard } from "./guards/reviewer.guard";
import { AuthApiModule } from "./modules/auth.module";
import { VocabularyApiModule } from "./modules/vocabulary.module";
import { AnalyticsApiModule } from "./modules/analytics.module";
import { QuizApiModule } from "./modules/quiz.module";
import { ReviewApiModule } from "./modules/review.module";
import { FeedbackApiModule } from "./modules/feedback.module";
import { InfraApiModule } from "./modules/infra.module";
import { nestAppConfig } from "./config/app.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [nestAppConfig],
      cache: true,
    }),
    AuthApiModule,
    VocabularyApiModule,
    AnalyticsApiModule,
    QuizApiModule,
    ReviewApiModule,
    FeedbackApiModule,
    InfraApiModule,
  ],
  providers: [AuthenticatedGuard, ReviewerGuard],
})
export class AppModule {}
