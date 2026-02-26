import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { api } from "@shared/routes";
import { InfraRepository } from "./infra.repository";

@Injectable()
@LogMethodLifecycle()
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

