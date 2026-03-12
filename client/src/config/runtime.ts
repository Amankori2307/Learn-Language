const DEFAULT_API_PORT = "5001";

const runtimeEnv = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim(),
  apiProtocol: (process.env.NEXT_PUBLIC_API_PROTOCOL ?? "").trim(),
  apiPort: (process.env.NEXT_PUBLIC_API_PORT ?? "").trim(),
  analyticsProvider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "").trim().toLowerCase(),
  enableQuizAudio: (process.env.NEXT_PUBLIC_ENABLE_QUIZ_AUDIO ?? "").trim().toLowerCase(),
  audioPlaybackMode: (process.env.NEXT_PUBLIC_AUDIO_PLAYBACK_MODE ?? "").trim().toLowerCase(),
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export function resolveApiBaseUrl(windowLocation?: Location): string {
  if (runtimeEnv.apiBaseUrl) {
    return normalizeBaseUrl(runtimeEnv.apiBaseUrl);
  }

  if (!windowLocation) {
    return "";
  }

  const protocol = runtimeEnv.apiProtocol || windowLocation.protocol;
  const port = runtimeEnv.apiPort || DEFAULT_API_PORT;
  return normalizeBaseUrl(`${protocol}//${windowLocation.hostname}:${port}`);
}

export function getAnalyticsProviderEnv(): string {
  return runtimeEnv.analyticsProvider;
}

export function isQuizAudioEnabled(): boolean {
  return runtimeEnv.enableQuizAudio !== "false";
}

export type AudioPlaybackMode = "hybrid" | "url_only" | "tts_only";

export function getAudioPlaybackMode(): AudioPlaybackMode {
  if (runtimeEnv.audioPlaybackMode === "url_only" || runtimeEnv.audioPlaybackMode === "tts_only") {
    return runtimeEnv.audioPlaybackMode;
  }
  return "hybrid";
}
