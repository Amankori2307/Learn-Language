import { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useAttemptHistory } from "@/hooks/use-attempt-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizDirectionEnum } from "@shared/domain/enums";

function toLabel(direction: QuizDirectionEnum | null) {
  if (direction === QuizDirectionEnum.SOURCE_TO_TARGET) return "Source Language -> English";
  if (direction === QuizDirectionEnum.TARGET_TO_SOURCE) return "English -> Source Language";
  return "Mixed";
}

function formatWhen(value: string | null) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

const PAGE_SIZE = 20;
type ResultFilter = "all" | "correct" | "wrong";
type DirectionFilter = "all" | QuizDirectionEnum.SOURCE_TO_TARGET | QuizDirectionEnum.TARGET_TO_SOURCE;
type SortOption = "newest" | "oldest" | "confidence_desc" | "response_time_desc";

export default function HistoryPage() {
  const history = useAttemptHistory(200);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const filteredAttempts = useMemo(() => {
    const raw = history.data ?? [];
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
  }, [directionFilter, history.data, resultFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAttempts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageAttempts = filteredAttempts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Attempt history with filters, trends, and paginated drill-down.
            </p>
          </div>
          <Button variant="outline" onClick={() => history.refetch()} disabled={history.isFetching}>
            {history.isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-xs text-muted-foreground">Filtered Attempts</p>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-xs text-muted-foreground">Correct</p>
            <p className="text-2xl font-semibold">{summary.correct}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-semibold">{summary.accuracy}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="history-search">Search</Label>
            <Input
              id="history-search"
              value={search}
              onChange={(event) => applyFilterReset(setSearch, event.target.value)}
              placeholder="Search by word, transliteration, meaning"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="history-result">Result</Label>
            <select
              id="history-result"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={resultFilter}
              onChange={(event) => applyFilterReset(setResultFilter, event.target.value as ResultFilter)}
            >
              <option value="all">All</option>
              <option value="correct">Correct</option>
              <option value="wrong">Wrong</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="history-direction">Direction</Label>
            <select
              id="history-direction"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={directionFilter}
              onChange={(event) => applyFilterReset(setDirectionFilter, event.target.value as DirectionFilter)}
            >
              <option value="all">All</option>
              <option value={QuizDirectionEnum.SOURCE_TO_TARGET}>Source -&gt; English</option>
              <option value={QuizDirectionEnum.TARGET_TO_SOURCE}>English -&gt; Source</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="history-sort">Sort</Label>
            <select
              id="history-sort"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={sortBy}
              onChange={(event) => applyFilterReset(setSortBy, event.target.value as SortOption)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="confidence_desc">Confidence (High first)</option>
              <option value="response_time_desc">Slowest first</option>
            </select>
          </div>
        </div>

        {history.isLoading ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">Loading attempts...</div>
        ) : history.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-red-700 font-medium">Could not load attempt history.</p>
            <Button variant="outline" className="mt-3" onClick={() => history.refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-muted-foreground">
            No attempts match the selected filters.
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border/60 bg-secondary/30">
              <div className="col-span-3 md:col-span-2">Result</div>
              <div className="col-span-9 md:col-span-4">Word</div>
              <div className="hidden md:block md:col-span-2">Direction</div>
              <div className="hidden md:block md:col-span-1">Confidence</div>
              <div className="hidden md:block md:col-span-1">Time</div>
              <div className="col-span-12 md:col-span-2">When</div>
            </div>
            <div className="divide-y divide-border/50">
              {pageAttempts.map((attempt) => (
                <div key={attempt.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                  <div className="col-span-3 md:col-span-2">
                    <Badge
                      variant={attempt.isCorrect ? "default" : "destructive"}
                      className={attempt.isCorrect ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                    >
                      {attempt.isCorrect ? "Correct" : "Wrong"}
                    </Badge>
                  </div>
                  <div className="col-span-9 md:col-span-4 min-w-0">
                    <p className="font-medium truncate">{attempt.word.transliteration} ({attempt.word.originalScript})</p>
                    <p className="text-sm text-muted-foreground truncate">{attempt.word.english}</p>
                  </div>
                  <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">
                    {toLabel(attempt.direction)}
                  </div>
                  <div className="hidden md:block md:col-span-1 text-sm">
                    {attempt.confidenceLevel ?? "-"}
                  </div>
                  <div className="hidden md:block md:col-span-1 text-sm text-muted-foreground">
                    {attempt.responseTimeMs ? `${Math.round(attempt.responseTimeMs / 1000)}s` : "-"}
                  </div>
                  <div className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
                    {formatWhen(attempt.createdAt)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-secondary/20">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} • {filteredAttempts.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
