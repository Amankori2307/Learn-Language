import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";
import { sendError } from "../../http";

export function registerVocabularyRoutes(app: Express) {
  app.get(api.words.list.path, isAuthenticated, async (req, res) => {
    const parsed = api.words.list.input?.parse(req.query) ?? {};
    const words = await storage.getWords(parsed.limit ?? 100, parsed.language);
    res.json(words);
  });

  app.get(api.words.get.path, isAuthenticated, async (req, res) => {
    const word = await storage.getWord(Number(req.params.id));
    if (!word) {
      return sendError(req, res, 404, "NOT_FOUND", "Word not found");
    }
    res.json(word);
  });

  app.get(api.clusters.list.path, isAuthenticated, async (req, res) => {
    const parsed = api.clusters.list.input?.parse(req.query) ?? {};
    const clusters = await storage.getClusters(parsed.language);
    res.json(clusters);
  });

  app.get(api.clusters.get.path, isAuthenticated, async (req, res) => {
    const parsed = api.clusters.get.input?.parse(req.query) ?? {};
    const cluster = await storage.getCluster(Number(req.params.id), parsed.language);
    if (!cluster) {
      return sendError(req, res, 404, "NOT_FOUND", "Cluster not found");
    }
    res.json(cluster);
  });
}

