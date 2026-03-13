import { type Dispatch, type SetStateAction, useState } from "react";
import { useLeaderboard, type LeaderboardWindow } from "@/hooks/use-leaderboard";

export const LEADERBOARD_LIMIT = 25;

export const LEADERBOARD_WINDOW_OPTIONS: Array<{ key: LeaderboardWindow; label: string }> = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "all_time", label: "All Time" },
];

export function useLeaderboardPageViewModel() {
  const [window, setWindow] = useState<LeaderboardWindow>("weekly");
  const [page, setPage] = useState(1);
  const leaderboardQuery = useLeaderboard(window, page, LEADERBOARD_LIMIT);

  const total = leaderboardQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LEADERBOARD_LIMIT));
  const currentPage = Math.min(page, totalPages);

  const setWindowAndResetPage: Dispatch<SetStateAction<LeaderboardWindow>> = (nextWindow) => {
    setPage(1);
    setWindow(nextWindow);
  };

  return {
    window,
    setWindow: setWindowAndResetPage,
    currentPage,
    totalPages,
    totalResults: total,
    setPage,
    entries: leaderboardQuery.data?.items ?? [],
    currentUserEntry: leaderboardQuery.data?.currentUserEntry ?? null,
    isLoading: leaderboardQuery.isLoading,
    isError: leaderboardQuery.isError,
    isFetching: leaderboardQuery.isFetching,
    retry: () => leaderboardQuery.refetch(),
  };
}
