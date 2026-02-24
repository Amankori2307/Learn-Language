import { Injectable } from "@nestjs/common";
import { api } from "@shared/routes";
import { LanguageEnum } from "@shared/domain/enums";
import { VocabularyRepository } from "./vocabulary.repository";
import { AppError } from "../../common/errors/app-error";

type ListWordsInput = {
  language?: LanguageEnum;
  search?: string;
  clusterId?: number;
  limit?: number;
};

@Injectable()
export class VocabularyService {
  constructor(private readonly repository: VocabularyRepository) {}

  async listWords(input: ListWordsInput) {
    const parsed = api.words.list.input?.parse(input) ?? {};
    return this.repository.getWords(parsed.limit ?? 100, parsed.language);
  }

  async getWord(wordId: number) {
    const word = await this.repository.getWord(wordId);
    if (!word) {
      throw new AppError(404, "NOT_FOUND", "Word not found");
    }
    return word;
  }

  async listClusters(language?: LanguageEnum) {
    const parsed = api.clusters.list.input?.parse({ language }) ?? {};
    return this.repository.getClusters(parsed.language);
  }

  async getCluster(clusterId: number, language?: LanguageEnum) {
    const parsed = api.clusters.get.input?.parse({ language }) ?? {};
    const cluster = await this.repository.getCluster(clusterId, parsed.language);
    if (!cluster) {
      throw new AppError(404, "NOT_FOUND", "Cluster not found");
    }
    return cluster;
  }
}
