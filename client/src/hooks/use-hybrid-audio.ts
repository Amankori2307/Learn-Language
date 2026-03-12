import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageEnum } from "@shared/domain/enums";
import { isMostlyAscii } from "@/lib/text-script";
import { useAudioResolution } from "@/hooks/use-audio-resolution";
import { getAudioPlaybackMode, isQuizAudioEnabled } from "@/config/runtime";

interface IPlayHybridAudioInput {
  key: string;
  audioUrl?: string | null;
  wordId?: number | null;
  text?: string | null;
  speechText?: string | null;
  resolveText?: string | null;
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

export function useHybridAudio() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { resolveAudioUrl } = useAudioResolution();

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
    async ({
      key,
      audioUrl,
      wordId,
      text,
      speechText,
      resolveText,
      language,
    }: IPlayHybridAudioInput): Promise<void> => {
      if (!isQuizAudioEnabled()) {
        setActiveKey(null);
        return;
      }

      if (activeKey === key) {
        stop();
        return;
      }

      stop();
      setActiveKey(key);
      const playbackMode = getAudioPlaybackMode();
      const resolvedAudioUrl = await resolveAudioUrl({
        cachedUrl: audioUrl,
        wordId,
        language,
        text: resolveText ?? text ?? speechText,
      });

      const fallbackToSpeech = () => {
        if (playbackMode === "url_only") {
          setActiveKey(null);
          return;
        }
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

      if (playbackMode === "tts_only" || !resolvedAudioUrl) {
        fallbackToSpeech();
        return;
      }

      try {
        const audio = new Audio(resolvedAudioUrl);
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
    [activeKey, resolveAudioUrl, stop],
  );

  useEffect(() => stop, [stop]);

  return {
    activeKey,
    play,
    stop,
  };
}
