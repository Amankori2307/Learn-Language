import { LanguageEnum } from "@shared/domain/enums";

export const AUDIO_MODULE_CONSTANTS = {
  GENERATED_AUDIO_DIR: "assets/audio",
  GENERATED_AUDIO_PUBLIC_PATH: "/audio/generated",
  MAX_SYNTHESIS_CHARACTERS: 280,
  MAX_TTS_RETRIES: 3,
  RETRY_BACKOFF_MS: 300,
  DEFAULT_SPEAKING_RATE: 0.95,
  DEFAULT_PITCH: 0,
} as const;

export const LANGUAGE_TO_VOICE_CODE: Record<LanguageEnum, string> = {
  [LanguageEnum.TELUGU]: "te-IN",
  [LanguageEnum.HINDI]: "hi-IN",
  [LanguageEnum.TAMIL]: "ta-IN",
  [LanguageEnum.KANNADA]: "kn-IN",
  [LanguageEnum.MALAYALAM]: "ml-IN",
  [LanguageEnum.SPANISH]: "es-ES",
  [LanguageEnum.FRENCH]: "fr-FR",
  [LanguageEnum.GERMAN]: "de-DE",
};
