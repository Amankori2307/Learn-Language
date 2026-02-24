import { Injectable } from "@nestjs/common";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";

@Injectable()
export class InfraRepository {
  seedInitialData() {
    return storage.seedInitialData();
  }

  getSrsDriftSummary(language?: LanguageEnum) {
    return storage.getSrsDriftSummary(language);
  }
}
