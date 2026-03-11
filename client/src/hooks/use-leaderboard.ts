import { useQuery } from "@tanstack/react-query";
import { api, parseSuccessResponse } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";
import { apiClient, buildApiUrl } from "@/services/apiClient";

export type LeaderboardWindow = "daily" | "weekly" | "all_time";

export function leaderboardQueryKey(window: LeaderboardWindow, limit: number, language: string) {
  return [api.leaderboard.list.path, window, limit, language] as const;
}

export function useLeaderboard(window: LeaderboardWindow, limit = 25) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: leaderboardQueryKey(window, limit, language),
    queryFn: async () => {
      const params = new URLSearchParams({
        window,
        limit: String(limit),
        language,
      });
      const res = await apiClient.get(
        buildApiUrl(`${api.leaderboard.list.path}?${params.toString()}`),
      );
      return parseSuccessResponse(api.leaderboard.list.responses[200], res.data);
    },
  });
}
