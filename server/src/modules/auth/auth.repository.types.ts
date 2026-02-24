import { authStorage } from "./auth.storage";

export type IUpsertUserInput = Parameters<typeof authStorage.upsertUser>[0];
export type IProfileInput = Parameters<typeof authStorage.updateUserProfile>[1];
