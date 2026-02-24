import type { Express } from "express";
import { registerVocabularyModule } from "./vocabulary.module";

export function registerVocabularyRoutes(app: Express) {
  registerVocabularyModule(app);
}
