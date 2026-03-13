import { useMemo, useState } from "react";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { useAttemptHistory } from "@/hooks/use-attempt-history";
import { HISTORY_PAGE_SIZE } from "./history.constants";

export type HistoryResultFilter = "all" | "correct" | "wrong";
export type HistoryDirectionFilter =
  | "all"
  | QuizDirectionEnum.SOURCE_TO_TARGET
  | QuizDirectionEnum.TARGET_TO_SOURCE;
export type HistorySortOption = "newest" | "oldest" | "confidence_desc" | "response_time_desc";

export function useHistoryPageViewModel() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<HistoryResultFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<HistoryDirectionFilter>("all");
  const [sortBy, setSortBy] = useState<HistorySortOption>("newest");
  const [page, setPage] = useState(1);
  const historyQuery = useAttemptHistory({
    page,
    limit: HISTORY_PAGE_SIZE,
    search,
    result: resultFilter,
    direction: directionFilter,
    sort: sortBy,
  });

  const totalPages = Math.max(1, Math.ceil((historyQuery.data?.total ?? 0) / HISTORY_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageAttempts = historyQuery.data?.items ?? [];
  const totalResults = historyQuery.data?.total ?? 0;
  const summary = useMemo(
    () => historyQuery.data?.summary ?? { total: 0, correct: 0, accuracy: 0 },
    [historyQuery.data],
  );

  const applyFilterReset = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  return {
    search,
    setSearch,
    resultFilter,
    setResultFilter,
    directionFilter,
    setDirectionFilter,
    sortBy,
    setSortBy,
    page,
    setPage,
    totalResults,
    currentPage,
    totalPages,
    pageAttempts,
    summary,
    applyFilterReset,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    isFetching: historyQuery.isFetching,
    refresh: () => historyQuery.refetch(),
    retry: () => historyQuery.refetch(),
  };
}
