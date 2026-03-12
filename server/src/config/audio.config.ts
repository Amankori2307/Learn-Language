import { registerAs } from "@nestjs/config";
import { getRuntimeEnv } from "./env.runtime";

export const audioConfig = registerAs("audio", () => {
  const env = getRuntimeEnv();
  return {
    enableGcpTts: Boolean(env.ENABLE_GCP_TTS),
    googleTtsApiKey: env.GOOGLE_TTS_API_KEY,
  };
});
