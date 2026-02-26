import { LanguageEnum } from "@shared/domain/enums";
import { runWithLifecycle } from "../logger/logger";

export function parseLanguage(value: unknown): LanguageEnum | undefined {
  return runWithLifecycle("parseLanguage", () => {
    if (!value || typeof value !== "string") {
      return undefined;
    }
    return Object.values(LanguageEnum).includes(value as LanguageEnum) ? (value as LanguageEnum) : undefined;
  });
}

export function formatPronunciationFirst(word: { transliteration?: string | null; originalScript: string }) {
  return runWithLifecycle("formatPronunciationFirst", () => {
    const transliteration = word.transliteration?.trim();
    if (!transliteration) {
      return word.originalScript;
    }
    return `${transliteration} (${word.originalScript})`;
  });
}
