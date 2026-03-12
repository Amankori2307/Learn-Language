import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageEnum } from "@shared/domain/enums";
import { useAudioResolution } from "./use-audio-resolution";

const resolveAudioMock = vi.fn();

vi.mock("@/services/audioService", () => ({
  resolveAudio: (...args: unknown[]) => resolveAudioMock(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAudioResolution", () => {
  beforeEach(() => {
    resolveAudioMock.mockReset();
  });

  it("returns cached url immediately without calling the audio service", async () => {
    const { result } = renderHook(() => useAudioResolution(), {
      wrapper: createWrapper(),
    });

    const resolved = await result.current.resolveAudioUrl({
      cachedUrl: " https://cdn.example.com/audio.mp3 ",
      language: LanguageEnum.TELUGU,
      text: "నమస్తే",
    });

    expect(resolved).toBe("https://cdn.example.com/audio.mp3");
    expect(resolveAudioMock).not.toHaveBeenCalled();
  });

  it("skips server resolution for ascii-only text", async () => {
    const { result } = renderHook(() => useAudioResolution(), {
      wrapper: createWrapper(),
    });

    const resolved = await result.current.resolveAudioUrl({
      language: LanguageEnum.TELUGU,
      text: "hello",
    });

    expect(resolved).toBeNull();
    expect(resolveAudioMock).not.toHaveBeenCalled();
  });

  it("caches resolved server audio by word/language/text", async () => {
    resolveAudioMock.mockResolvedValue("https://cdn.example.com/generated.mp3");
    const { result } = renderHook(() => useAudioResolution(), {
      wrapper: createWrapper(),
    });

    const first = await result.current.resolveAudioUrl({
      wordId: 42,
      language: LanguageEnum.TELUGU,
      text: "నమస్తే",
    });
    const second = await result.current.resolveAudioUrl({
      wordId: 42,
      language: LanguageEnum.TELUGU,
      text: "నమస్తే",
    });

    expect(first).toBe("https://cdn.example.com/generated.mp3");
    expect(second).toBe("https://cdn.example.com/generated.mp3");
    expect(resolveAudioMock).toHaveBeenCalledTimes(1);
    expect(resolveAudioMock).toHaveBeenCalledWith({
      wordId: 42,
      language: LanguageEnum.TELUGU,
      text: "నమస్తే",
    });
  });
});
