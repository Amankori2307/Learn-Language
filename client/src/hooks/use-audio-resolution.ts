import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { LanguageEnum } from "@shared/domain/enums";
import { resolveAudio } from "@/services/audioService";
import { isMostlyAscii } from "@/lib/text-script";

type ResolveAudioUrlInput = {
  cachedUrl?: string | null;
  wordId?: number | null;
  language?: LanguageEnum | null;
  text?: string | null;
};

export function useAudioResolution() {
  const resolvedAudioRef = useRef<Map<string, string>>(new Map());
  const mutation = useMutation({
    mutationFn: async (input: { wordId?: number; language: LanguageEnum; text: string }) =>
      resolveAudio(input),
  });

  const resolveAudioUrl = async (input: ResolveAudioUrlInput): Promise<string | null> => {
    if (input.cachedUrl?.trim()) {
      return input.cachedUrl.trim();
    }

    const normalizedText = input.text?.trim();
    if (!normalizedText || !input.language || isMostlyAscii(normalizedText)) {
      return null;
    }

    const cacheKey = `${input.wordId ?? "text"}:${input.language}:${normalizedText}`;
    const cached = resolvedAudioRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const audioUrl = await mutation.mutateAsync({
        wordId: input.wordId ?? undefined,
        language: input.language,
        text: normalizedText,
      });
      if (!audioUrl) {
        return null;
      }
      resolvedAudioRef.current.set(cacheKey, audioUrl);
      return audioUrl;
    } catch {
      return null;
    }
  };

  return {
    resolveAudioUrl,
    isResolving: mutation.isPending,
    resolutionError: mutation.error,
  };
}
