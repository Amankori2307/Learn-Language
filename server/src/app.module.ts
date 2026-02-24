import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthenticatedGuard } from "./common/guards/authenticated.guard";
import { ReviewerGuard } from "./common/guards/reviewer.guard";
import { AuthApiModule } from "./modules/auth/auth.module";
import { VocabularyApiModule } from "./modules/vocabulary/vocabulary.module";
import { AnalyticsApiModule } from "./modules/analytics/analytics.module";
import { QuizApiModule } from "./modules/quiz/quiz.module";
import { ReviewApiModule } from "./modules/review/review.module";
import { FeedbackApiModule } from "./modules/feedback/feedback.module";
import { InfraApiModule } from "./modules/infra/infra.module";
import { AudioApiModule } from "./modules/audio/audio.module";
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
    AudioApiModule,
  ],
  providers: [AuthenticatedGuard, ReviewerGuard],
})
export class AppModule {}
