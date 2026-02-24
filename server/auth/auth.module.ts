import type { Express } from "express";
import { setupAuth } from "./oidcAuth";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

export async function registerAuthModule(app: Express): Promise<void> {
  await setupAuth(app);
  const repository = new AuthRepository();
  const service = new AuthService(repository);
  const controller = new AuthController(service);
  controller.register(app);
}

