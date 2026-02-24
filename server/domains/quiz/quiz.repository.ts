import { Injectable } from "@nestjs/common";
import { storage } from "../../storage";
import { LanguageEnum, QuizModeEnum } from "@shared/domain/enums";

type ICreateProgressInput = Parameters<typeof storage.createUserProgress>[0];
type IQuizAttemptInput = Parameters<typeof storage.logQuizAttempt>[0];

export interface IQuizRepository {
  getQuizCandidates(
    userId: string,
    limit: number,
    clusterId?: number,
    mode?: QuizModeEnum,
    language?: LanguageEnum,
  ): Promise<Awaited<ReturnType<typeof storage.getQuizCandidates>>>;
  seedInitialData(): Promise<void>;
  getWords(limit: number, language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getWords>>>;
  getWordClusterLinks(): Promise<Awaited<ReturnType<typeof storage.getWordClusterLinks>>>;
  getWord(wordId: number): Promise<Awaited<ReturnType<typeof storage.getWord>>>;
  getWordExamples(wordId: number, language?: LanguageEnum): Promise<Awaited<ReturnType<typeof storage.getWordExamples>>>;
  getActiveSrsConfig(): Promise<Awaited<ReturnType<typeof storage.getActiveSrsConfig>>>;
  getUserWordProgress(
    userId: string,
    wordId: number,
  ): Promise<Awaited<ReturnType<typeof storage.getUserWordProgress>>>;
  createUserProgress(input: ICreateProgressInput): Promise<Awaited<ReturnType<typeof storage.createUserProgress>>>;
  updateUserProgress(progress: Awaited<ReturnType<typeof storage.createUserProgress>>): Promise<void>;
  logQuizAttempt(input: IQuizAttemptInput): Promise<void>;
}

@Injectable()
export class QuizRepository implements IQuizRepository {
  getQuizCandidates(userId: string, limit: number, clusterId?: number, mode?: QuizModeEnum, language?: LanguageEnum) {
    return storage.getQuizCandidates(userId, limit, clusterId, mode, language);
  }

  seedInitialData() {
    return storage.seedInitialData();
  }

  getWords(limit: number, language?: LanguageEnum) {
    return storage.getWords(limit, language);
  }

  getWordClusterLinks() {
    return storage.getWordClusterLinks();
  }

  getWord(wordId: number) {
    return storage.getWord(wordId);
  }

  getWordExamples(wordId: number, language?: LanguageEnum) {
    return storage.getWordExamples(wordId, language);
  }

  getActiveSrsConfig() {
    return storage.getActiveSrsConfig();
  }

  getUserWordProgress(userId: string, wordId: number) {
    return storage.getUserWordProgress(userId, wordId);
  }

  createUserProgress(input: ICreateProgressInput) {
    return storage.createUserProgress(input);
  }

  async updateUserProgress(progress: Awaited<ReturnType<typeof storage.createUserProgress>>) {
    await storage.updateUserProgress(progress);
  }

  async logQuizAttempt(input: IQuizAttemptInput) {
    await storage.logQuizAttempt(input);
  }
}
