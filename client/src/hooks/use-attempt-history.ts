import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export function useAttemptHistory(limit: number = 100) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.attempts.history.path, limit, language],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), language });
      const res = await apiClient.get(buildApiUrl(`${api.attempts.history.path}?${params.toString()}`));
      return api.attempts.history.responses[200].parse(res.data);
    },
  });
}
