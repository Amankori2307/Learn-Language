import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { QuizDirectionEnum } from "@shared/domain/enums";
import {
  useHistoryPageViewModel,
  type HistoryDirectionFilter,
  type HistoryResultFilter,
  type HistorySortOption,
} from "@/features/history/use-history-page-view-model";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { HistoryResultsTable } from "@/features/history/history-results-table";

export default function HistoryPage() {
  const {
    search,
    setSearch,
    resultFilter,
    setResultFilter,
    directionFilter,
    setDirectionFilter,
    sortBy,
    setSortBy,
    setPage,
    filteredAttempts,
    currentPage,
    totalPages,
    pageAttempts,
    summary,
    applyFilterReset,
    isLoading,
    isError,
    isFetching,
    refresh,
    retry,
  } = useHistoryPageViewModel();

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
          <PendingButton
            variant="outline"
            onClick={refresh}
            pending={isFetching}
            pendingLabel="Refreshing..."
          >
            Refresh
          </PendingButton>
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
              onChange={(event) =>
                applyFilterReset(setResultFilter, event.target.value as HistoryResultFilter)
              }
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
              onChange={(event) =>
                applyFilterReset(setDirectionFilter, event.target.value as HistoryDirectionFilter)
              }
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
              onChange={(event) => applyFilterReset(setSortBy, event.target.value as HistorySortOption)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="confidence_desc">Confidence (High first)</option>
              <option value="response_time_desc">Slowest first</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <TableSurfaceSkeleton rows={8} columns={6} />
        ) : isError ? (
          <SurfaceMessage
            title="Could not load attempt history"
            description="The analytics history request failed. Try the request again."
            tone="error"
            action={
              <Button variant="outline" onClick={retry}>
                Retry
              </Button>
            }
          />
        ) : filteredAttempts.length === 0 ? (
          <SurfaceMessage
            title="No attempts match these filters"
            description="Adjust the search term or filters to widen the result set."
            tone="empty"
          />
        ) : (
          <HistoryResultsTable
            pageAttempts={pageAttempts}
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={filteredAttempts.length}
            setPage={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
