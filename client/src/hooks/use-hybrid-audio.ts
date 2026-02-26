import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageEnum } from "@shared/domain/enums";
import { api } from "@shared/routes";
import { toApiUrl } from "@/lib/api-base";

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

function isMostlyAscii(value: string): boolean {
  return Array.from(value).every((character) => character.charCodeAt(0) <= 0x7f);
}

function getPublicClientEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
}

function isQuizAudioEnabled(): boolean {
  return getPublicClientEnv("NEXT_PUBLIC_ENABLE_QUIZ_AUDIO") !== "false";
}

type AudioPlaybackMode = "hybrid" | "url_only" | "tts_only";

function getAudioPlaybackMode(): AudioPlaybackMode {
  const mode = String(getPublicClientEnv("NEXT_PUBLIC_AUDIO_PLAYBACK_MODE") ?? "hybrid").toLowerCase();
  if (mode === "url_only" || mode === "tts_only") {
    return mode;
  }
  return "hybrid";
}

export function useHybridAudio() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resolvedAudioRef = useRef<Map<string, string>>(new Map());

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
    async ({ key, audioUrl, wordId, text, speechText, resolveText, language }: IPlayHybridAudioInput): Promise<void> => {
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
      const resolvedAudioUrl = await resolveServerAudioUrl({
        cachedUrl: audioUrl,
        cacheRef: resolvedAudioRef.current,
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
    [activeKey, stop],
  );

  useEffect(() => stop, [stop]);

  return {
    activeKey,
    play,
    stop,
  };
}

async function resolveServerAudioUrl(input: {
  cachedUrl?: string | null;
  cacheRef: Map<string, string>;
  wordId?: number | null;
  language?: LanguageEnum | null;
  text?: string | null;
}): Promise<string | null> {
  if (input.cachedUrl?.trim()) {
    return input.cachedUrl.trim();
  }

  const normalizedText = input.text?.trim();
  if (!normalizedText || !input.language || isMostlyAscii(normalizedText)) {
    return null;
  }

  const cacheKey = `${input.wordId ?? "text"}:${input.language}:${normalizedText}`;
  const cached = input.cacheRef.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(toApiUrl(api.audio.resolve.path), {
      method: api.audio.resolve.method,
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        wordId: input.wordId ?? undefined,
        language: input.language,
        text: normalizedText,
      }),
    });
    if (!response.ok) {
      return null;
    }
    const parsed = api.audio.resolve.responses[200].parse(await response.json());
    if (!parsed.audioUrl) {
      return null;
    }
    input.cacheRef.set(cacheKey, parsed.audioUrl);
    return parsed.audioUrl;
  } catch {
    return null;
  }
}
