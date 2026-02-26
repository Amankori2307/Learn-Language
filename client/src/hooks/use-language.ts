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
  { value: LanguageEnum.HINDI, label: "Hindi" },
  { value: LanguageEnum.TAMIL, label: "Tamil" },
  { value: LanguageEnum.KANNADA, label: "Kannada" },
  { value: LanguageEnum.MALAYALAM, label: "Malayalam" },
  { value: LanguageEnum.SPANISH, label: "Spanish" },
  { value: LanguageEnum.FRENCH, label: "French" },
  { value: LanguageEnum.GERMAN, label: "German" },
];

function getInitialLanguage(): LanguageEnum {
  const fallback = LANGUAGE_OPTIONS[0].value;
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  const isValid = stored && Object.values(LanguageEnum).includes(stored as LanguageEnum);
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
    options: LANGUAGE_OPTIONS,
  };
}
