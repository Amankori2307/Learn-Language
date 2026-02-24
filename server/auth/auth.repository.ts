import { Injectable } from "@nestjs/common";
import { authStorage } from "./storage";

type IUpsertUserInput = Parameters<typeof authStorage.upsertUser>[0];
type IProfileInput = Parameters<typeof authStorage.updateUserProfile>[1];

export interface IAuthRepository {
  getUser(userId: string): Promise<Awaited<ReturnType<typeof authStorage.getUser>>>;
  upsertUser(input: IUpsertUserInput): Promise<Awaited<ReturnType<typeof authStorage.upsertUser>>>;
  updateUserProfile(
    userId: string,
    profile: IProfileInput,
  ): Promise<Awaited<ReturnType<typeof authStorage.updateUserProfile>>>;
}

@Injectable()
export class AuthRepository implements IAuthRepository {
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
