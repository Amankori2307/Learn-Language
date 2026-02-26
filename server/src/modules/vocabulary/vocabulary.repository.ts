import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";

@Injectable()
@LogMethodLifecycle()
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
