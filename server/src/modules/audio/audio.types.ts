import { LanguageEnum } from "@shared/domain/enums";

export type ResolveAudioInput = {
  userId: string;
  payload: unknown;
};

export type ResolveAudioResult = {
  audioUrl: string | null;
  source: "existing" | "cache" | "generated" | "unavailable";
  cached: boolean;
};

export type TtsRequest = {
  text: string;
  language: LanguageEnum;
};
