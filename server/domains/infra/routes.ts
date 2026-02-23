import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../../storage";
import { isAuthenticated } from "../../auth";
import { requireReviewer } from "../../auth/permissions";

export function registerInfraRoutes(app: Express) {
  app.post(api.admin.seed.path, isAuthenticated, async (_req, res) => {
    await storage.seedInitialData();
    res.json({ message: "Seeded" });
  });

  app.get(api.admin.srsDrift.path, isAuthenticated, requireReviewer, async (req, res) => {
    const parsed = api.admin.srsDrift.input?.parse(req.query) ?? {};
    const summary = await storage.getSrsDriftSummary(parsed.language);
    res.json(summary);
  });
}

