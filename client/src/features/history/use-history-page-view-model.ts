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
  const historyQuery = useAttemptHistory(200);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<HistoryResultFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<HistoryDirectionFilter>("all");
  const [sortBy, setSortBy] = useState<HistorySortOption>("newest");
  const [page, setPage] = useState(1);

  const filteredAttempts = useMemo(() => {
    const raw = historyQuery.data ?? [];
    const searchTerm = search.trim().toLowerCase();
    const filtered = raw.filter((attempt) => {
      if (resultFilter === "correct" && !attempt.isCorrect) return false;
      if (resultFilter === "wrong" && attempt.isCorrect) return false;
      if (directionFilter !== "all" && attempt.direction !== directionFilter) return false;
      if (!searchTerm) return true;
      const haystack = [
        attempt.word.transliteration,
        attempt.word.originalScript,
        attempt.word.english,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchTerm);
    });

    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      }
      if (sortBy === "oldest") {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return at - bt;
      }
      if (sortBy === "confidence_desc") {
        return (b.confidenceLevel ?? 0) - (a.confidenceLevel ?? 0);
      }
      return (b.responseTimeMs ?? 0) - (a.responseTimeMs ?? 0);
    });

    return filtered;
  }, [directionFilter, historyQuery.data, resultFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAttempts.length / HISTORY_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageAttempts = filteredAttempts.slice(
    (currentPage - 1) * HISTORY_PAGE_SIZE,
    currentPage * HISTORY_PAGE_SIZE,
  );

  const summary = useMemo(() => {
    const total = filteredAttempts.length;
    const correct = filteredAttempts.filter((attempt) => attempt.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, accuracy };
  }, [filteredAttempts]);

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
    filteredAttempts,
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
