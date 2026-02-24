import type { Express } from "express";
import { registerInfraModule } from "./infra.module";

export function registerInfraRoutes(app: Express) {
  registerInfraModule(app);
}
