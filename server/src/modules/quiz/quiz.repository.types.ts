import { storage } from "../../infrastructure/storage";

export type ICreateProgressInput = Parameters<typeof storage.createUserProgress>[0];
export type IQuizAttemptInput = Parameters<typeof storage.logQuizAttempt>[0];
