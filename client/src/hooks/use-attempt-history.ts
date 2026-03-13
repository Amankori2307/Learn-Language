import { useQuery } from "@tanstack/react-query";
import { api, parseSuccessResponse } from "@shared/routes";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export type AttemptHistoryQueryInput = {
  page: number;
  limit: number;
  search: string;
  result: "all" | "correct" | "wrong";
  direction: "all" | QuizDirectionEnum.SOURCE_TO_TARGET | QuizDirectionEnum.TARGET_TO_SOURCE;
  sort: "newest" | "oldest" | "confidence_desc" | "response_time_desc";
};

export function attemptHistoryQueryKey(input: AttemptHistoryQueryInput, language: string) {
  return [
    api.attempts.history.path,
    input.page,
    input.limit,
    input.search,
    input.result,
    input.direction,
    input.sort,
    language,
  ] as const;
}

export function useAttemptHistory(input: AttemptHistoryQueryInput) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: attemptHistoryQueryKey(input, language),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(input.page),
        limit: String(input.limit),
        search: input.search,
        result: input.result,
        direction: input.direction,
        sort: input.sort,
        language,
      });
      const res = await apiClient.get(
        buildApiUrl(`${api.attempts.history.path}?${params.toString()}`),
      );
      return parseSuccessResponse(api.attempts.history.responses[200], res.data);
    },
  });
}
