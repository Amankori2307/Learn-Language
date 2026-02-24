import { Module } from "@nestjs/common";
import { QuizApiController } from "./quiz.controller";
import { QuizRepository } from "./quiz.repository";
import { QuizService } from "./quiz.service";

@Module({
  controllers: [QuizApiController],
  providers: [QuizRepository, QuizService],
})
export class QuizApiModule {}
