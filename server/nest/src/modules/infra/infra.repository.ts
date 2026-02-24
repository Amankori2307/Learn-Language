import { Injectable } from "@nestjs/common";
import { storage } from "../../../../storage";
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
