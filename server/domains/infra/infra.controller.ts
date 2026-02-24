import type { Express } from "express";
import { api } from "@shared/routes";
import { isAuthenticated } from "../../auth";
import { requireReviewer } from "../../auth/permissions";
import type { IInfraService } from "./infra.service";

export interface IInfraController {
  register(app: Express): void;
}

export class InfraController implements IInfraController {
  constructor(private readonly service: IInfraService) {}

  register(app: Express): void {
    app.post(api.admin.seed.path, isAuthenticated, (req, res) => this.service.seed(req, res));
    app.get(api.admin.srsDrift.path, isAuthenticated, requireReviewer, (req, res) =>
      this.service.getSrsDrift(req, res),
    );
  }
}

