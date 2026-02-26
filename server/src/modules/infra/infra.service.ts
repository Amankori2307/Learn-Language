import { Injectable } from "@nestjs/common";
import { api } from "@shared/routes";
import { InfraRepository } from "./infra.repository";

@Injectable()
export class InfraService {
  constructor(private readonly repository: InfraRepository) {}

  async seed() {
    await this.repository.seedInitialData();
    return { message: "Seeded" };
  }

  async getSrsDrift(language?: unknown) {
    const parsed = api.admin.srsDrift.input?.parse({ language }) ?? {};
    return this.repository.getSrsDriftSummary(parsed.language);
  }
}

