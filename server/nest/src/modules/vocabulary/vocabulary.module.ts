import { Module } from "@nestjs/common";
import { VocabularyApiController } from "./vocabulary.controller";
import { VocabularyRepository } from "./vocabulary.repository";
import { VocabularyService } from "./vocabulary.service";

@Module({
  controllers: [VocabularyApiController],
  providers: [VocabularyRepository, VocabularyService],
})
export class VocabularyApiModule {}
