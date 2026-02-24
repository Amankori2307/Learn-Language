import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "./oidcAuth";
import type { IAuthService } from "./auth.service";

export interface IAuthController {
  register(app: Express): void;
}

export class AuthController implements IAuthController {
  constructor(private readonly service: IAuthService) {}

  register(app: Express): void {
    app.get("/api/auth/user", isAuthenticated, (req, res) => this.service.getAuthUser(req, res));
    app.get(api.profile.get.path, isAuthenticated, (req, res) => this.service.getProfile(req, res));
    app.patch(api.profile.update.path, isAuthenticated, (req, res) => this.service.updateProfile(req, res));
  }
}

