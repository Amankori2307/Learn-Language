import { LanguageEnum } from "@shared/domain/enums";
import { api, parseSuccessResponse } from "@shared/routes";
import { apiClient, buildApiUrl } from "./apiClient";

export async function resolveAudio(input: {
  wordId?: number | null;
  language: LanguageEnum;
  text: string;
}): Promise<string | null> {
  const response = await apiClient({
    url: buildApiUrl(api.audio.resolve.path),
    method: api.audio.resolve.method,
    data: {
      wordId: input.wordId ?? undefined,
      language: input.language,
      text: input.text,
    },
  });

  const parsed = parseSuccessResponse(api.audio.resolve.responses[200], response.data);
  return parsed.audioUrl;
}
