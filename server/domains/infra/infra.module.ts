import type { Express } from "express";
import { InfraController } from "./infra.controller";
import { InfraRepository } from "./infra.repository";
import { InfraService } from "./infra.service";

export function registerInfraModule(app: Express): void {
  const repository = new InfraRepository();
  const service = new InfraService(repository);
  const controller = new InfraController(service);
  controller.register(app);
}

