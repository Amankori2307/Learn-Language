import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export type LeaderboardWindow = "daily" | "weekly" | "all_time";

export function useLeaderboard(window: LeaderboardWindow, limit = 25) {
  return useQuery({
    queryKey: [api.leaderboard.list.path, window, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        window,
        limit: String(limit),
      });
      const res = await fetch(`${api.leaderboard.list.path}?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
  });
}
