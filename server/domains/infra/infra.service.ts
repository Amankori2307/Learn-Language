import { Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import { api } from "@shared/routes";
import { InfraRepository } from "./infra.repository";

export interface IInfraService {
  seed(req: Request, res: Response): Promise<void>;
  getSrsDrift(req: Request, res: Response): Promise<void>;
}

@Injectable()
export class InfraService implements IInfraService {
  constructor(private readonly repository: InfraRepository) {}

  async seed(_req: Request, res: Response): Promise<void> {
    await this.repository.seedInitialData();
    res.json({ message: "Seeded" });
  }

  async getSrsDrift(req: Request, res: Response): Promise<void> {
    const parsed = api.admin.srsDrift.input?.parse(req.query) ?? {};
    const summary = await this.repository.getSrsDriftSummary(parsed.language);
    res.json(summary);
  }
}
