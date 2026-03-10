import { useState } from "react";
import { useLeaderboard, type LeaderboardWindow } from "@/hooks/use-leaderboard";

export const LEADERBOARD_LIMIT = 25;

export const LEADERBOARD_WINDOW_OPTIONS: Array<{ key: LeaderboardWindow; label: string }> = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "all_time", label: "All Time" },
];

export function useLeaderboardPageViewModel() {
  const [window, setWindow] = useState<LeaderboardWindow>("weekly");
  const leaderboardQuery = useLeaderboard(window, LEADERBOARD_LIMIT);

  return {
    window,
    setWindow,
    entries: leaderboardQuery.data ?? [],
    isLoading: leaderboardQuery.isLoading,
    isError: leaderboardQuery.isError,
    isFetching: leaderboardQuery.isFetching,
    retry: () => leaderboardQuery.refetch(),
  };
}
