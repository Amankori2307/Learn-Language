import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageEnum } from "@shared/domain/enums";

interface IPlayHybridAudioInput {
  key: string;
  audioUrl?: string | null;
  text?: string | null;
  language?: LanguageEnum | null;
}

function resolveSpeechLang(inputLanguage?: LanguageEnum | null): string {
  if (!inputLanguage) return "en-US";
  switch (inputLanguage) {
    case LanguageEnum.TELUGU:
      return "te-IN";
    case LanguageEnum.HINDI:
      return "hi-IN";
    case LanguageEnum.TAMIL:
      return "ta-IN";
    case LanguageEnum.KANNADA:
      return "kn-IN";
    default:
      return "en-US";
  }
}

export function useHybridAudio() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.src = "";
      htmlAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setActiveKey(null);
  }, []);

  const play = useCallback(
    async ({ key, audioUrl, text, language }: IPlayHybridAudioInput): Promise<void> => {
      if (activeKey === key) {
        stop();
        return;
      }

      stop();
      setActiveKey(key);

      const fallbackToSpeech = () => {
        const speechText = text?.trim();
        if (!speechText) {
          setActiveKey(null);
          return;
        }
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          setActiveKey(null);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = resolveSpeechLang(language);
        utterance.rate = 0.95;
        utterance.onend = () => setActiveKey(null);
        utterance.onerror = () => setActiveKey(null);
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      if (!audioUrl) {
        fallbackToSpeech();
        return;
      }

      try {
        const audio = new Audio(audioUrl);
        htmlAudioRef.current = audio;
        audio.onended = () => setActiveKey(null);
        audio.onerror = () => fallbackToSpeech();
        await audio.play();
      } catch {
        fallbackToSpeech();
      }
    },
    [activeKey, stop],
  );

  useEffect(() => stop, [stop]);

  return {
    activeKey,
    play,
    stop,
  };
}

