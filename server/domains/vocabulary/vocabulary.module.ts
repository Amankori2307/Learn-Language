import type { Express } from "express";
import { VocabularyController } from "./vocabulary.controller";
import { VocabularyRepository } from "./vocabulary.repository";
import { VocabularyService } from "./vocabulary.service";

export function registerVocabularyModule(app: Express): void {
  const repository = new VocabularyRepository();
  const service = new VocabularyService(repository);
  const controller = new VocabularyController(service);
  controller.register(app);
}

