import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageEnum } from "@shared/domain/enums";
import {
  resolveSpeechVoiceMatch,
  shouldUseSpeechFallback,
} from "@/lib/audio-playback";
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

export function useHybridAudio() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const speechKeepAliveRef = useRef<number | null>(null);
  const { resolveAudioUrl } = useAudioResolution();

  const ensureHtmlAudio = useCallback(() => {
    if (htmlAudioRef.current) {
      return htmlAudioRef.current;
    }

    const audio = new Audio();
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    htmlAudioRef.current = audio;
    return audio;
  }, []);

  const stop = useCallback(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.src = "";
      htmlAudioRef.current.load();
    }
    if (speechTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (speechKeepAliveRef.current !== null && typeof window !== "undefined") {
      window.clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
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

        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        if (
          !shouldUseSpeechFallback({
            text: resolvedSpeechText,
            language,
            voices: availableVoices,
            platform: window.navigator.platform,
            userAgent: window.navigator.userAgent,
          })
        ) {
          setActiveKey(null);
          return;
        }

        const voiceMatch = resolveSpeechVoiceMatch(
          resolvedSpeechText,
          language,
          availableVoices,
          window.navigator.platform,
          window.navigator.userAgent,
        );

        const utterance = new SpeechSynthesisUtterance(resolvedSpeechText);
        utterance.lang = voiceMatch.lang;
        if (voiceMatch.voice) {
          utterance.voice = voiceMatch.voice;
        }
        utterance.rate = 0.95;
        utterance.onend = () => {
          if (speechKeepAliveRef.current !== null && typeof window !== "undefined") {
            window.clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = null;
          }
          setActiveKey(null);
        };
        utterance.onerror = () => {
          if (speechKeepAliveRef.current !== null && typeof window !== "undefined") {
            window.clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = null;
          }
          setActiveKey(null);
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        speechTimeoutRef.current = window.setTimeout(() => {
          speechKeepAliveRef.current = window.setInterval(() => {
            if (!window.speechSynthesis.speaking) {
              if (speechKeepAliveRef.current !== null) {
                window.clearInterval(speechKeepAliveRef.current);
                speechKeepAliveRef.current = null;
              }
              return;
            }
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }, 14_000);
          window.speechSynthesis.speak(utterance);
          speechTimeoutRef.current = null;
        }, 0);
      };

      if (playbackMode === "tts_only" || !resolvedAudioUrl) {
        fallbackToSpeech();
        return;
      }

      try {
        const audio = ensureHtmlAudio();
        audio.onended = null;
        audio.onerror = null;
        audio.onabort = null;
        audio.pause();
        audio.src = "";
        audio.load();
        if (typeof window !== "undefined") {
          const audioUrlObject = new URL(resolvedAudioUrl, window.location.href);
          audio.crossOrigin = audioUrlObject.origin !== window.location.origin ? "anonymous" : null;
        }
        audio.onended = () => setActiveKey(null);
        audio.onerror = () => fallbackToSpeech();
        audio.onabort = () => fallbackToSpeech();
        audio.src = resolvedAudioUrl;
        audio.load();
        await audio.play();
      } catch {
        fallbackToSpeech();
      }
    },
    [activeKey, ensureHtmlAudio, resolveAudioUrl, stop, voices],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const hydrateVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      if (nextVoices.length > 0) {
        setVoices(nextVoices);
      }
    };

    hydrateVoices();
    window.speechSynthesis.onvoiceschanged = hydrateVoices;

    return () => {
      if (window.speechSynthesis.onvoiceschanged === hydrateVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => stop, [stop]);

  return {
    activeKey,
    play,
    stop,
  };
}
