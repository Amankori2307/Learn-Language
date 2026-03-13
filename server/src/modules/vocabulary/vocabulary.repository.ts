import { Injectable } from "@nestjs/common";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";
import { ListClustersInput } from "./vocabulary.types";

@Injectable()
export class VocabularyRepository {
  getWords(limit: number, language?: LanguageEnum) {
    return storage.getWords(limit, language);
  }

  getWord(wordId: number) {
    return storage.getWord(wordId);
  }

  getClusters(input: ListClustersInput) {
    return storage.getClusters(input);
  }

  getCluster(clusterId: number, language?: LanguageEnum) {
    return storage.getCluster(clusterId, language);
  }
}
