import { createHash } from "crypto";
import { LogMethodLifecycle } from "../../common/logger/log-method-lifecycle.decorator";
import { mkdir, access, writeFile } from "fs/promises";
import path from "path";
import { Injectable } from "@nestjs/common";
import { ConfigService, type ConfigType } from "@nestjs/config";
import { z } from "zod";
import { api } from "@shared/routes";
import { AppError } from "../../common/errors/app-error";
import { AUDIO_MODULE_CONSTANTS, LANGUAGE_TO_VOICE_CODE } from "./audio.constants";
import { AudioRepository } from "./audio.repository";
import { ResolveAudioInput, ResolveAudioResult, TtsRequest } from "./audio.types";
import { audioConfig } from "../../config/audio.config";

type GoogleTextToSpeechResponse = {
  audioContent?: string;
};

@Injectable()
@LogMethodLifecycle()
export class AudioService {
  private readonly inFlight = new Map<string, Promise<string | null>>();

  constructor(
    private readonly repository: AudioRepository,
    private readonly configService: ConfigService,
  ) {}

  async resolveAudio(input: ResolveAudioInput): Promise<ResolveAudioResult> {
    try {
      const parsed = api.audio.resolve.input.parse(input.payload);

      if (parsed.audioUrl) {
        return { audioUrl: parsed.audioUrl, source: "existing", cached: true };
      }

      let synthesisText = parsed.text?.trim() ?? "";
      let language = parsed.language;

      if (parsed.wordId) {
        const word = await this.repository.getWord(parsed.wordId);
        if (!word) {
          throw new AppError(404, "NOT_FOUND", "Word not found");
        }
        if (word.language !== parsed.language) {
          throw new AppError(404, "NOT_FOUND", "Word not found in selected language");
        }
        if (word.audioUrl) {
          return { audioUrl: word.audioUrl, source: "existing", cached: true };
        }
        language = word.language;
        if (!synthesisText) {
          synthesisText = word.originalScript;
        }
      }

      const normalizedText = normalizeSynthesisText(synthesisText);
      if (!normalizedText || isMostlyAscii(normalizedText)) {
        return { audioUrl: null, source: "unavailable", cached: false };
      }

      const generatedAudioUrl = await this.resolveAndCacheAudio({
        text: normalizedText,
        language,
      });

      if (!generatedAudioUrl) {
        return { audioUrl: null, source: "unavailable", cached: false };
      }

      if (parsed.wordId) {
        await this.repository.updateWordAudioUrl(parsed.wordId, generatedAudioUrl);
      }

      return {
        audioUrl: generatedAudioUrl,
        source: generatedAudioUrl.includes(`${AUDIO_MODULE_CONSTANTS.GENERATED_AUDIO_PUBLIC_PATH}/`) ? "generated" : "cache",
        cached: true,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new AppError(400, "VALIDATION_ERROR", error.issues[0]?.message ?? "Invalid request");
      }
      throw new AppError(500, "INTERNAL_ERROR", "Failed to resolve audio");
    }
  }

  private async resolveAndCacheAudio(input: TtsRequest): Promise<string | null> {
    if (!this.isGoogleTtsConfigured()) {
      return null;
    }

    const fileName = createAudioFileName(input);
    const relativePath = path.join(input.language, fileName);
    const absolutePath = path.join(process.cwd(), AUDIO_MODULE_CONSTANTS.GENERATED_AUDIO_DIR, relativePath);
    const publicUrl = `${AUDIO_MODULE_CONSTANTS.GENERATED_AUDIO_PUBLIC_PATH}/${relativePath.replaceAll(path.sep, "/")}`;

    if (await fileExists(absolutePath)) {
      return publicUrl;
    }

    const cacheKey = `${input.language}:${input.text}`;
    const existingInFlight = this.inFlight.get(cacheKey);
    if (existingInFlight) {
      return existingInFlight;
    }

    const generationPromise = this.generateAndPersistAudio(input, absolutePath, publicUrl);
    this.inFlight.set(cacheKey, generationPromise);
    try {
      return await generationPromise;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  private async generateAndPersistAudio(input: TtsRequest, absolutePath: string, publicUrl: string): Promise<string | null> {
    const audioBuffer = await this.synthesizeWithRetry(input);
    if (!audioBuffer) {
      return null;
    }

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, audioBuffer);
    return publicUrl;
  }

  private async synthesizeWithRetry(input: TtsRequest): Promise<Buffer | null> {
    let attempt = 0;
    while (attempt < AUDIO_MODULE_CONSTANTS.MAX_TTS_RETRIES) {
      try {
        return await this.callGoogleTtsApi(input);
      } catch {
        attempt += 1;
        if (attempt >= AUDIO_MODULE_CONSTANTS.MAX_TTS_RETRIES) {
          return null;
        }
        await sleep(AUDIO_MODULE_CONSTANTS.RETRY_BACKOFF_MS * attempt);
      }
    }
    return null;
  }

  private async callGoogleTtsApi(input: TtsRequest): Promise<Buffer> {
    const voiceCode = LANGUAGE_TO_VOICE_CODE[input.language];
    if (!voiceCode) {
      throw new Error("Unsupported language for TTS");
    }

    const endpoint = new URL("https://texttospeech.googleapis.com/v1/text:synthesize");
    endpoint.searchParams.set("key", this.getAudioConfig().googleTtsApiKey ?? "");

    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: { text: input.text },
        voice: {
          languageCode: voiceCode,
          ssmlGender: "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: AUDIO_MODULE_CONSTANTS.DEFAULT_SPEAKING_RATE,
          pitch: AUDIO_MODULE_CONSTANTS.DEFAULT_PITCH,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google TTS API failed: ${response.status}`);
    }

    const payload = (await response.json()) as GoogleTextToSpeechResponse;
    if (!payload.audioContent) {
      throw new Error("Google TTS API returned no audio");
    }
    return Buffer.from(payload.audioContent, "base64");
  }

  private getAudioConfig() {
    return this.configService.getOrThrow<ConfigType<typeof audioConfig>>("audio");
  }

  private isGoogleTtsConfigured(): boolean {
    const config = this.getAudioConfig();
    return config.enableGcpTts === true && Boolean(config.googleTtsApiKey);
  }
}

function normalizeSynthesisText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, AUDIO_MODULE_CONSTANTS.MAX_SYNTHESIS_CHARACTERS);
}

function isMostlyAscii(value: string): boolean {
  return Array.from(value).every((character) => character.charCodeAt(0) <= 0x7f);
}

function createAudioFileName(input: TtsRequest): string {
  const hash = createHash("sha256").update(`${input.language}:${input.text}`).digest("hex");
  return `${hash}.mp3`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
