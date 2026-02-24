import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import type { IVocabularyService } from "./vocabulary.service";

export interface IVocabularyController {
  register(app: Express): void;
}

export class VocabularyController implements IVocabularyController {
  constructor(private readonly service: IVocabularyService) {}

  register(app: Express): void {
    app.get(api.words.list.path, isAuthenticated, (req, res) => this.service.listWords(req, res));
    app.get(api.words.get.path, isAuthenticated, (req, res) => this.service.getWord(req, res));
    app.get(api.clusters.list.path, isAuthenticated, (req, res) => this.service.listClusters(req, res));
    app.get(api.clusters.get.path, isAuthenticated, (req, res) => this.service.getCluster(req, res));
  }
}

