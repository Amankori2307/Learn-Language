import { Injectable } from "@nestjs/common";
import { storage } from "../../storage";
import { LanguageEnum } from "@shared/domain/enums";

export interface IVocabularyRepository {
  getWords(limit: number, language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getWords>>>;
  getWord(wordId: number): Promise<Awaited<ReturnType<typeof storage.getWord>>>;
  getClusters(language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getClusters>>>;
  getCluster(clusterId: number, language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getCluster>>>;
}

@Injectable()
export class VocabularyRepository implements IVocabularyRepository {
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
