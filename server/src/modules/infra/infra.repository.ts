import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum } from "@shared/domain/enums";

@Injectable()
@LogMethodLifecycle()
export class InfraRepository {
  seedInitialData() {
    return storage.seedInitialData();
  }

  getSrsDriftSummary(language?: LanguageEnum) {
    return storage.getSrsDriftSummary(language);
  }
}
