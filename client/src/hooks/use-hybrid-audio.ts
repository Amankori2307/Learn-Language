import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageEnum } from "@shared/domain/enums";

interface IPlayHybridAudioInput {
  key: string;
  audioUrl?: string | null;
  text?: string | null;
  speechText?: string | null;
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
    case LanguageEnum.MALAYALAM:
      return "ml-IN";
    case LanguageEnum.SPANISH:
      return "es-ES";
    case LanguageEnum.FRENCH:
      return "fr-FR";
    case LanguageEnum.GERMAN:
      return "de-DE";
    default:
      return "en-US";
  }
}

function isMostlyAscii(value: string): boolean {
  return Array.from(value).every((character) => character.charCodeAt(0) <= 0x7f);
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
    async ({ key, audioUrl, text, speechText, language }: IPlayHybridAudioInput): Promise<void> => {
      if (activeKey === key) {
        stop();
        return;
      }

      stop();
      setActiveKey(key);

      const fallbackToSpeech = () => {
        const resolvedSpeechText = (speechText ?? text)?.trim();
        if (!resolvedSpeechText) {
          setActiveKey(null);
          return;
        }
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          setActiveKey(null);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(resolvedSpeechText);
        utterance.lang = isMostlyAscii(resolvedSpeechText) ? "en-US" : resolveSpeechLang(language);
        utterance.rate = 0.95;
        utterance.onend = () => setActiveKey(null);
        utterance.onerror = () => setActiveKey(null);
        utteranceRef.current = utterance;
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      };

      if (!audioUrl) {
        fallbackToSpeech();
        return;
      }

      try {
        const audio = new Audio(audioUrl);
        audio.preload = "auto";
        audio.crossOrigin = "anonymous";
        htmlAudioRef.current = audio;
        audio.onended = () => setActiveKey(null);
        audio.onerror = () => fallbackToSpeech();
        audio.onabort = () => fallbackToSpeech();
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
