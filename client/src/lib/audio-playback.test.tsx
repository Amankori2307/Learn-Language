import { describe, expect, it } from "vitest";
import { LanguageEnum } from "@shared/domain/enums";
import {
  isAppleBrowserPlatform,
  resolveSpeechVoiceMatch,
  shouldUseSpeechFallback,
} from "./audio-playback";

describe("audio playback helpers", () => {
  it("allows ascii speech fallback even without a matching voice list", () => {
    expect(
      shouldUseSpeechFallback({
        text: "hello",
        language: LanguageEnum.ENGLISH,
        voices: [],
      }),
    ).toBe(true);
  });

  it("rejects non-ascii speech fallback when no matching voice exists", () => {
    expect(
      shouldUseSpeechFallback({
        text: "నమస్కారం",
        language: LanguageEnum.TELUGU,
        voices: [{ lang: "en-US", name: "Samantha", default: true }],
        platform: "MacIntel",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
      }),
    ).toBe(false);
  });

  it("accepts non-ascii speech fallback when a matching voice exists", () => {
    const match = resolveSpeechVoiceMatch(
      "నమస్కారం",
      LanguageEnum.TELUGU,
      [{ lang: "te-IN", name: "Telugu Voice", default: false }],
      "MacIntel",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
    );

    expect(match.supported).toBe(true);
    expect(match.lang).toBe("te-IN");
    expect(match.voice?.name).toBe("Telugu Voice");
  });

  it("falls back to a preferred Indian voice when Telugu is unavailable", () => {
    const match = resolveSpeechVoiceMatch(
      "నమస్కారం",
      LanguageEnum.TELUGU,
      [
        { lang: "en-US", name: "Samantha", default: true },
        { lang: "hi-IN", name: "Microsoft Natural Hindi", default: false },
      ],
      "Win32",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    );

    expect(match.supported).toBe(true);
    expect(match.lang).toBe("hi-IN");
    expect(match.voice?.name).toContain("Hindi");
  });

  it("prefers higher-quality mac english voices over generic defaults", () => {
    const match = resolveSpeechVoiceMatch(
      "hello",
      LanguageEnum.TELUGU,
      [
        { lang: "en-US", name: "Generic English", default: true },
        { lang: "en-US", name: "Alex", default: false },
      ],
      "MacIntel",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
    );

    expect(match.voice?.name).toBe("Alex");
  });

  it("detects apple browser platforms", () => {
    expect(
      isAppleBrowserPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)"),
    ).toBe(true);
    expect(isAppleBrowserPlatform("Win32", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(
      false,
    );
  });
});
