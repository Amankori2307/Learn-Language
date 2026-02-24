import { registerAs } from "@nestjs/config";

export const audioConfig = registerAs("audio", () => ({
  enableGcpTts: process.env.ENABLE_GCP_TTS === "true",
  googleTtsApiKey: process.env.GOOGLE_TTS_API_KEY,
}));
