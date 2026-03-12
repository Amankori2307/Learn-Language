import { useEffect, useState } from "react";
import { APP_STORAGE_KEYS } from "@shared/domain/constants/app-brand";

const STORAGE_KEY = APP_STORAGE_KEYS.quizConfidenceEnabled;
const LEGACY_STORAGE_KEY = "learn-language:quiz-confidence-enabled";

function getInitialState(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const raw =
    window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (raw === null) {
    return false;
  }

  return raw === "true";
}

export function useQuizConfidencePreference() {
  const [enabled, setEnabled] = useState<boolean>(getInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [enabled]);

  return {
    enabled,
    setEnabled,
    toggle: () => setEnabled((prev) => !prev),
  };
}
