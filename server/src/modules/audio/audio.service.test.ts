import test from "node:test";
import assert from "node:assert/strict";
import { LanguageEnum } from "@shared/domain/enums";
import { AudioService } from "./audio.service";
import { AppError } from "../../common/errors/app-error";

function createRepositoryMock() {
  return {
    getWord: async (_wordId: number) =>
      undefined as
        | {
            id: number;
            language: LanguageEnum;
            originalScript: string;
            audioUrl: string | null;
          }
        | undefined,
    updateWordAudioUrl: async (_wordId: number, _audioUrl: string) => {},
  };
}

function createConfigServiceMock() {
  return {
    getOrThrow() {
      return {
        enableGcpTts: false,
        googleTtsApiKey: null,
      };
    },
  };
}

test("resolveAudio returns existing audioUrl from payload when present", async () => {
  const repository = createRepositoryMock();
  const service = new AudioService(repository as any, createConfigServiceMock() as any);

  const result = await service.resolveAudio({
    userId: "u-1",
    payload: {
      language: LanguageEnum.TELUGU,
      text: "నమస్తే",
      audioUrl: "https://cdn.example.com/audio/namaste.mp3",
    },
  });

  assert.equal(result.audioUrl, "https://cdn.example.com/audio/namaste.mp3");
  assert.equal(result.source, "existing");
  assert.equal(result.cached, true);
});

test("resolveAudio returns existing stored word audioUrl", async () => {
  const repository = createRepositoryMock();
  repository.getWord = async () => ({
    id: 42,
    language: LanguageEnum.TELUGU,
    originalScript: "నమస్తే",
    audioUrl: "https://cdn.example.com/audio/word-42.mp3",
  });

  const service = new AudioService(repository as any, createConfigServiceMock() as any);
  const result = await service.resolveAudio({
    userId: "u-1",
    payload: {
      wordId: 42,
      language: LanguageEnum.TELUGU,
    },
  });

  assert.equal(result.audioUrl, "https://cdn.example.com/audio/word-42.mp3");
  assert.equal(result.source, "existing");
  assert.equal(result.cached, true);
});

test("resolveAudio returns unavailable for ASCII-only synthesis text", async () => {
  const repository = createRepositoryMock();
  const service = new AudioService(repository as any, createConfigServiceMock() as any);

  const result = await service.resolveAudio({
    userId: "u-1",
    payload: {
      language: LanguageEnum.TELUGU,
      text: "namaste",
    },
  });

  assert.equal(result.audioUrl, null);
  assert.equal(result.source, "unavailable");
  assert.equal(result.cached, false);
});

test("resolveAudio persists generated word audio URL", async () => {
  const repository = createRepositoryMock();
  repository.getWord = async () => ({
    id: 7,
    language: LanguageEnum.TELUGU,
    originalScript: "ధన్యవాదాలు",
    audioUrl: null,
  });

  let persistedWordId: number | null = null;
  let persistedAudioUrl: string | null = null;
  repository.updateWordAudioUrl = async (wordId: number, audioUrl: string) => {
    persistedWordId = wordId;
    persistedAudioUrl = audioUrl;
  };

  const service = new AudioService(repository as any, createConfigServiceMock() as any);
  (
    service as unknown as {
      resolveAndCacheAudio: (input: {
        text: string;
        language: LanguageEnum;
      }) => Promise<string | null>;
    }
  ).resolveAndCacheAudio = async () => "/audio/generated/telugu/generated-word.mp3";

  const result = await service.resolveAudio({
    userId: "u-1",
    payload: {
      wordId: 7,
      language: LanguageEnum.TELUGU,
    },
  });

  assert.equal(result.audioUrl, "/audio/generated/telugu/generated-word.mp3");
  assert.equal(persistedWordId, 7);
  assert.equal(persistedAudioUrl, "/audio/generated/telugu/generated-word.mp3");
});

test("resolveAudio rejects word requests in the wrong language", async () => {
  const repository = createRepositoryMock();
  repository.getWord = async () => ({
    id: 9,
    language: LanguageEnum.HINDI,
    originalScript: "नमस्ते",
    audioUrl: null,
  });

  const service = new AudioService(repository as any, createConfigServiceMock() as any);

  await assert.rejects(
    () =>
      service.resolveAudio({
        userId: "u-1",
        payload: {
          wordId: 9,
          language: LanguageEnum.TELUGU,
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.status, 404);
      assert.equal(error.code, "NOT_FOUND");
      assert.equal(error.message, "Word not found in selected language");
      return true;
    },
  );
});
