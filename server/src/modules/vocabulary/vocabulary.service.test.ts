import test from "node:test";
import assert from "node:assert/strict";
import { VocabularyService } from "./vocabulary.service";
import { AppError } from "../../common/errors/app-error";
import { LanguageEnum } from "@shared/domain/enums";

test("VocabularyService.listClusters forwards parsed language", async () => {
  let receivedLanguage: LanguageEnum | undefined;

  const repository = {
    async getWords() {
      return [];
    },
    async getWord() {
      return null;
    },
    async getClusters(language?: LanguageEnum) {
      receivedLanguage = language;
      return [{ id: 1, name: "Travel", wordCount: 14 }];
    },
    async getCluster() {
      return null;
    },
  };

  const service = new VocabularyService(repository as any);
  const result = await service.listClusters(LanguageEnum.TELUGU);

  assert.equal(receivedLanguage, LanguageEnum.TELUGU);
  assert.equal(result[0]?.name, "Travel");
});

test("VocabularyService.getCluster throws not found when repository returns null", async () => {
  const repository = {
    async getWords() {
      return [];
    },
    async getWord() {
      return null;
    },
    async getClusters() {
      return [];
    },
    async getCluster() {
      return null;
    },
  };

  const service = new VocabularyService(repository as any);

  await assert.rejects(
    () => service.getCluster(99, LanguageEnum.TELUGU),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 404);
      assert.equal(error.code, "NOT_FOUND");
      assert.equal(error.message, "Cluster not found");
      return true;
    },
  );
});

test("VocabularyService.getWord throws not found when repository returns null", async () => {
  const repository = {
    async getWords() {
      return [];
    },
    async getWord() {
      return null;
    },
    async getClusters() {
      return [];
    },
    async getCluster() {
      return null;
    },
  };

  const service = new VocabularyService(repository as any);

  await assert.rejects(
    () => service.getWord(42),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 404);
      assert.equal(error.code, "NOT_FOUND");
      assert.equal(error.message, "Word not found");
      return true;
    },
  );
});
