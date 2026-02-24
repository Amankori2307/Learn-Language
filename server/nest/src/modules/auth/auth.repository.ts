import { Injectable } from "@nestjs/common";
import { authStorage } from "./auth.storage";

type IUpsertUserInput = Parameters<typeof authStorage.upsertUser>[0];
type IProfileInput = Parameters<typeof authStorage.updateUserProfile>[1];

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
