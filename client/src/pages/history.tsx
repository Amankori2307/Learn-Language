import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/ui/pending-button";
import {
  useHistoryPageViewModel,
} from "@/features/history/use-history-page-view-model";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { HistoryResultsTable } from "@/features/history/history-results-table";
import { HistorySummaryCards } from "@/features/history/history-summary-cards";
import { HistoryFilterPanel } from "@/features/history/history-filter-panel";

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

        <HistorySummaryCards
          total={summary.total}
          correct={summary.correct}
          accuracy={summary.accuracy}
        />

        <HistoryFilterPanel
          search={search}
          setSearch={setSearch}
          resultFilter={resultFilter}
          setResultFilter={setResultFilter}
          directionFilter={directionFilter}
          setDirectionFilter={setDirectionFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          applyFilterReset={applyFilterReset}
        />

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
