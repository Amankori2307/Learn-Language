import { useEffect, useState } from "react";

const STORAGE_KEY = "learn-language:feedback-effects-enabled";

function getInitialState(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return true;
  }
  return raw === "true";
}

export function useFeedbackEffects() {
  const [enabled, setEnabled] = useState<boolean>(getInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  return {
    enabled,
    setEnabled,
    toggle: () => setEnabled((prev) => !prev),
  };
}
