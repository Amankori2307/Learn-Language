import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { authStorage } from "./auth.storage";
import { IProfileInput, IUpsertUserInput } from "./auth.repository.types";

@Injectable()
@LogMethodLifecycle()
export class AuthRepository {
  getUser(userId: string) {
    return authStorage.getUser(userId);
  }

  upsertUser(input: IUpsertUserInput) {
    return authStorage.upsertUser(input);
  }

  updateUserProfile(userId: string, profile: IProfileInput) {
    return authStorage.updateUserProfile(userId, profile);
  }
}
