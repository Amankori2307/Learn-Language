import { useEffect, useState } from "react";
import { LanguageEnum } from "@shared/domain/enums";
import { APP_STORAGE_KEYS } from "@shared/domain/constants/app-brand";

const STORAGE_KEY = APP_STORAGE_KEYS.selectedLanguage;
const LEGACY_STORAGE_KEY = "learn-language:selected-language";

export type IUserLanguageOption = {
  value: LanguageEnum;
  label: string;
};

export const LANGUAGE_OPTIONS: IUserLanguageOption[] = [
  { value: LanguageEnum.TELUGU, label: "Telugu" },
];

export function getLanguageLabel(language: LanguageEnum | null | undefined) {
  if (!language) {
    return "Your Language";
  }

  return LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? "Your Language";
}

function getInitialLanguage(): LanguageEnum {
  const fallback = LANGUAGE_OPTIONS[0].value;
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored =
    window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  const isValid = stored && LANGUAGE_OPTIONS.some((option) => option.value === stored);
  return isValid ? (stored as LanguageEnum) : fallback;
}

export function useLearningLanguage() {
  const [language, setLanguageState] = useState<LanguageEnum>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [language]);

  const setLanguage = (nextLanguage: LanguageEnum) => {
    setLanguageState(nextLanguage);
  };

  return {
    language,
    setLanguage,
    languageLabel: getLanguageLabel(language),
    options: LANGUAGE_OPTIONS,
  };
}
