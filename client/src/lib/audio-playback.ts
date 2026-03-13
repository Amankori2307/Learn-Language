import { LanguageEnum } from "@shared/domain/enums";
import { isMostlyAscii } from "@/lib/text-script";

export type SpeechVoiceMatch = {
  lang: string;
  voice?: SpeechSynthesisVoice;
  supported: boolean;
};

type VoiceLike = Pick<SpeechSynthesisVoice, "lang" | "name" | "default">;

const INDIAN_LANGUAGE_FALLBACKS: Partial<Record<LanguageEnum, readonly string[]>> = {
  [LanguageEnum.TELUGU]: ["te-IN", "hi-IN", "en-IN"],
  [LanguageEnum.HINDI]: ["hi-IN", "en-IN"],
  [LanguageEnum.TAMIL]: ["ta-IN", "hi-IN", "en-IN"],
  [LanguageEnum.KANNADA]: ["kn-IN", "hi-IN", "en-IN"],
  [LanguageEnum.MALAYALAM]: ["ml-IN", "hi-IN", "en-IN"],
};

const PREFERRED_VOICE_NAME_HINTS = ["rishi", "natural", "siri", "apple"];
const ENGLISH_VOICE_NAME_HINTS = ["alex", "samantha", "siri", "daniel", "natural", "zira", "aria"];

export function resolveSpeechLang(inputLanguage?: LanguageEnum | null): string {
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

export function resolveSpeechVoiceMatch(
  text: string,
  inputLanguage?: LanguageEnum | null,
  voices: readonly VoiceLike[] = [],
  platform?: string | null,
  userAgent?: string | null,
): SpeechVoiceMatch {
  if (isMostlyAscii(text)) {
    const englishVoice = resolveBestVoice(
      voices,
      ["en-US", "en-GB", "en-IN", "en-AU"],
      ENGLISH_VOICE_NAME_HINTS,
      platform,
      userAgent,
    );

    return {
      lang: "en-US",
      voice: englishVoice as SpeechSynthesisVoice | undefined,
      supported: true,
    };
  }

  const targetLang = resolveSpeechLang(inputLanguage);
  const exactMatch = resolveBestVoice(voices, [targetLang], [], platform, userAgent, true);
  if (exactMatch) {
    return {
      lang: targetLang,
      voice: exactMatch as SpeechSynthesisVoice,
      supported: true,
    };
  }

  const languagePrefix = targetLang.split("-")[0];
  const prefixMatch = resolveBestVoice(
    voices,
    [`${languagePrefix}-`],
    PREFERRED_VOICE_NAME_HINTS,
    platform,
    userAgent,
    false,
    true,
  );
  if (prefixMatch) {
    return {
      lang: targetLang,
      voice: prefixMatch as SpeechSynthesisVoice,
      supported: true,
    };
  }

  const fallbackVoice = resolveFallbackVoice(inputLanguage, voices, platform, userAgent);
  if (fallbackVoice) {
    return {
      lang: fallbackVoice.lang,
      voice: fallbackVoice as SpeechSynthesisVoice,
      supported: true,
    };
  }

  return {
    lang: targetLang,
    supported: false,
  };
}

function resolveFallbackVoice(
  inputLanguage: LanguageEnum | null | undefined,
  voices: readonly VoiceLike[],
  platform?: string | null,
  userAgent?: string | null,
): VoiceLike | undefined {
  if (!inputLanguage) {
    return undefined;
  }

  const fallbackLangs = INDIAN_LANGUAGE_FALLBACKS[inputLanguage];
  if (!fallbackLangs || fallbackLangs.length === 0) {
    return undefined;
  }

  for (const fallbackLang of fallbackLangs) {
    const exactLangVoice = resolveBestVoice(
      voices,
      [fallbackLang],
      PREFERRED_VOICE_NAME_HINTS,
      platform,
      userAgent,
      true,
    );
    if (exactLangVoice) {
      return exactLangVoice;
    }

    const prefix = fallbackLang.split("-")[0];
    const prefixVoice =
      fallbackLang === "en-IN"
        ? undefined
        : resolveBestVoice(
            voices,
            [`${prefix}-`],
            PREFERRED_VOICE_NAME_HINTS,
            platform,
            userAgent,
            false,
            true,
          );
    if (prefixVoice) {
      return prefixVoice;
    }
  }

  return undefined;
}

function resolveBestVoice(
  voices: readonly VoiceLike[],
  languageMatchers: readonly string[],
  nameHints: readonly string[],
  platform?: string | null,
  userAgent?: string | null,
  exactLangOnly = false,
  prefixLang = false,
): VoiceLike | undefined {
  const candidates = voices.filter((voice) =>
    languageMatchers.some((matcher) => {
      if (prefixLang) {
        return voice.lang.startsWith(matcher);
      }
      if (exactLangOnly) {
        return voice.lang === matcher;
      }
      return voice.lang === matcher;
    }),
  );

  if (candidates.length === 0) {
    return undefined;
  }

  return [...candidates].sort((left, right) => {
    return scoreVoice(right, nameHints, platform, userAgent) - scoreVoice(left, nameHints, platform, userAgent);
  })[0];
}

function scoreVoice(
  voice: VoiceLike,
  nameHints: readonly string[],
  platform?: string | null,
  userAgent?: string | null,
): number {
  const name = voice.name.toLowerCase();
  let score = 0;

  if (voice.default) {
    score += 10;
  }

  if (name.includes("natural")) {
    score += 40;
  }

  if (nameHints.some((hint) => name.includes(hint))) {
    score += 30;
  }

  if (isAppleBrowserPlatform(platform, userAgent)) {
    if (name.includes("alex") || name.includes("samantha") || name.includes("siri")) {
      score += 35;
    }
    if (name.includes("compact")) {
      score -= 10;
    }
  } else {
    if (name.includes("aria") || name.includes("zira") || name.includes("david")) {
      score += 20;
    }
  }

  if (name.includes("enhanced") || name.includes("premium")) {
    score += 15;
  }

  return score;
}

export function isAppleBrowserPlatform(platform?: string | null, userAgent?: string | null): boolean {
  const normalizedPlatform = (platform ?? "").toLowerCase();
  const normalizedUserAgent = (userAgent ?? "").toLowerCase();
  return (
    normalizedPlatform.includes("mac") ||
    normalizedPlatform.includes("iphone") ||
    normalizedPlatform.includes("ipad") ||
    normalizedUserAgent.includes("mac os") ||
    normalizedUserAgent.includes("iphone") ||
    normalizedUserAgent.includes("ipad")
  );
}

export function shouldUseSpeechFallback(params: {
  text: string;
  language?: LanguageEnum | null;
  voices?: readonly VoiceLike[];
  platform?: string | null;
  userAgent?: string | null;
}): boolean {
  const { text, language, voices = [], platform, userAgent } = params;
  const voiceMatch = resolveSpeechVoiceMatch(text, language, voices, platform, userAgent);

  if (isMostlyAscii(text)) {
    return true;
  }

  if (!voiceMatch.supported) {
    return false;
  }

  if (isAppleBrowserPlatform(platform, userAgent)) {
    return true;
  }

  return true;
}
