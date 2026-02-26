import { Injectable } from "@nestjs/common";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { storage } from "../../infrastructure/storage";
import { LanguageEnum, QuizModeEnum } from "@shared/domain/enums";
import { ICreateProgressInput, IQuizAttemptInput } from "./quiz.repository.types";

@Injectable()
@LogMethodLifecycle()
export class QuizRepository {
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
