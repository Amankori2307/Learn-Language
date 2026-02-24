import { storage } from "../../storage";
import { LanguageEnum } from "@shared/domain/enums";

export interface IInfraRepository {
  seedInitialData(): Promise<void>;
  getSrsDriftSummary(language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getSrsDriftSummary>>>;
}

export class InfraRepository implements IInfraRepository {
  seedInitialData() {
    return storage.seedInitialData();
  }

  getSrsDriftSummary(language?: LanguageEnum) {
    return storage.getSrsDriftSummary(language);
  }
}

