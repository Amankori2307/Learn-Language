import { Injectable } from "@nestjs/common";
import { authStorage } from "./auth.storage";
import { IProfileInput, IUpsertUserInput } from "./auth.repository.types";

@Injectable()
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
