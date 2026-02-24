import { Module } from "@nestjs/common";
import { QuizApiController } from "../controllers/quiz.controller";
import { QuizRepository } from "../../domains/quiz/quiz.repository";
import { QuizService } from "../../domains/quiz/quiz.service";

@Module({
  controllers: [QuizApiController],
  providers: [QuizRepository, QuizService],
})
export class QuizApiModule {}

