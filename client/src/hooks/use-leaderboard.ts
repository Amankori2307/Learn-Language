import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLearningLanguage } from "@/hooks/use-language";

export type LeaderboardWindow = "daily" | "weekly" | "all_time";

export function useLeaderboard(window: LeaderboardWindow, limit = 25) {
  const { language } = useLearningLanguage();
  return useQuery({
    queryKey: [api.leaderboard.list.path, window, limit, language],
    queryFn: async () => {
      const params = new URLSearchParams({
        window,
        limit: String(limit),
        language,
      });
      const res = await fetch(`${api.leaderboard.list.path}?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
  });
}
