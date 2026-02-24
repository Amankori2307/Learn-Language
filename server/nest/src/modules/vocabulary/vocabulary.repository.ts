import { Injectable } from "@nestjs/common";
import { storage } from "../../../../storage";
import { LanguageEnum } from "@shared/domain/enums";

@Injectable()
export class VocabularyRepository {
  getWords(limit: number, language?: LanguageEnum) {
    return storage.getWords(limit, language);
  }

  getWord(wordId: number) {
    return storage.getWord(wordId);
  }

  getClusters(language?: LanguageEnum) {
    return storage.getClusters(language);
  }

  getCluster(clusterId: number, language?: LanguageEnum) {
    return storage.getCluster(clusterId, language);
  }
}
