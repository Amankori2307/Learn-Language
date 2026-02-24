import { sendError } from "../../http";
import type { Request, Response } from "express";
import type { IVocabularyRepository } from "./vocabulary.repository";
import { api } from "@shared/routes";

export interface IVocabularyService {
  listWords(req: Request, res: Response): Promise<void>;
  getWord(req: Request, res: Response): Promise<void>;
  listClusters(req: Request, res: Response): Promise<void>;
  getCluster(req: Request, res: Response): Promise<void>;
}

export class VocabularyService implements IVocabularyService {
  constructor(private readonly repository: IVocabularyRepository) {}

  async listWords(req: Request, res: Response): Promise<void> {
    const parsed = api.words.list.input?.parse(req.query) ?? {};
    const words = await this.repository.getWords(parsed.limit ?? 100, parsed.language);
    res.json(words);
  }

  async getWord(req: Request, res: Response): Promise<void> {
    const word = await this.repository.getWord(Number(req.params.id));
    if (!word) {
      sendError(req, res, 404, "NOT_FOUND", "Word not found");
      return;
    }
    res.json(word);
  }

  async listClusters(req: Request, res: Response): Promise<void> {
    const parsed = api.clusters.list.input?.parse(req.query) ?? {};
    const clusters = await this.repository.getClusters(parsed.language);
    res.json(clusters);
  }

  async getCluster(req: Request, res: Response): Promise<void> {
    const parsed = api.clusters.get.input?.parse(req.query) ?? {};
    const cluster = await this.repository.getCluster(Number(req.params.id), parsed.language);
    if (!cluster) {
      sendError(req, res, 404, "NOT_FOUND", "Cluster not found");
      return;
    }
    res.json(cluster);
  }
}
