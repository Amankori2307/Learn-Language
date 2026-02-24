import { Module } from "@nestjs/common";
import { VocabularyApiController } from "../controllers/vocabulary.controller";
import { VocabularyRepository } from "../../domains/vocabulary/vocabulary.repository";
import { VocabularyService } from "../../domains/vocabulary/vocabulary.service";

@Module({
  controllers: [VocabularyApiController],
  providers: [VocabularyRepository, VocabularyService],
})
export class VocabularyApiModule {}

