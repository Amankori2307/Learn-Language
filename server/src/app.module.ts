import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthenticatedGuard } from "./common/guards/authenticated.guard";
import { ReviewerGuard } from "./common/guards/reviewer.guard";
import { AuthApiModule } from "./modules/auth/auth.module";
import { VocabularyApiModule } from "./modules/vocabulary/vocabulary.module";
import { AnalyticsApiModule } from "./modules/analytics/analytics.module";
import { QuizApiModule } from "./modules/quiz/quiz.module";
import { ReviewApiModule } from "./modules/review/review.module";
import { InfraApiModule } from "./modules/infra/infra.module";
import { AudioApiModule } from "./modules/audio/audio.module";
import { nestAppConfig } from "./config/app.config";
import { authConfig } from "./config/auth.config";
import { databaseConfig } from "./config/database.config";
import { audioConfig } from "./config/audio.config";
import { resolveEnvFile } from "./config/env-files";
import { validateEnv } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFile(process.env.APP_ENV ?? process.env.NODE_ENV),
      validate: validateEnv,
      load: [nestAppConfig, authConfig, databaseConfig, audioConfig],
      cache: true,
    }),
    AuthApiModule,
    VocabularyApiModule,
    AnalyticsApiModule,
    QuizApiModule,
    ReviewApiModule,
    InfraApiModule,
    AudioApiModule,
  ],
  providers: [AuthenticatedGuard, ReviewerGuard],
})
export class AppModule {}
