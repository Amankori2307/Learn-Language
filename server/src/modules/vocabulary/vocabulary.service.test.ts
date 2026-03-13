import test from "node:test";
import assert from "node:assert/strict";
import { VocabularyService } from "./vocabulary.service";
import { AppError } from "../../common/errors/app-error";
import { LanguageEnum } from "@shared/domain/enums";

test("VocabularyService.listClusters forwards parsed language", async () => {
  let receivedInput: unknown = null;

  const repository = {
    async getWords() {
      return [];
    },
    async getWord() {
      return null;
    },
    async getClusters(input: unknown) {
      receivedInput = input;
      return {
        items: [{ id: 1, name: "Travel", wordCount: 14 }],
        page: 1,
        limit: 12,
        total: 1,
        availableTypes: ["all", "topic"],
        summary: {
          totalWords: 14,
          nonEmptyClusters: 1,
          topCluster: { id: 1, name: "Travel", wordCount: 14 },
        },
      };
    },
    async getCluster() {
      return null;
    },
  };

  const service = new VocabularyService(repository as any);
  const result = await service.listClusters({ language: LanguageEnum.TELUGU });

  assert.deepEqual(receivedInput, {
    language: LanguageEnum.TELUGU,
    sort: "words_desc",
    page: 1,
    limit: 12,
  });
  assert.equal(result.items[0]?.name, "Travel");
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
