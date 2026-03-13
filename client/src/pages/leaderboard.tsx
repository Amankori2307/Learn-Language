import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  LEADERBOARD_WINDOW_OPTIONS,
  useLeaderboardPageViewModel,
} from "@/features/analytics/use-leaderboard-page-view-model";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { LeaderboardPanel } from "@/features/analytics/leaderboard-panel";
import { LeaderboardHeader } from "@/features/analytics/leaderboard-header";

export default function LeaderboardPage() {
  const {
    window,
    setWindow,
    currentPage,
    totalPages,
    totalResults,
    setPage,
    entries,
    currentUserEntry,
    isLoading,
    isError,
    isFetching,
    retry,
  } = useLeaderboardPageViewModel();

  return (
    <Layout>
      <div className="space-y-6">
        <LeaderboardHeader
          window={window}
          setWindow={setWindow}
          options={LEADERBOARD_WINDOW_OPTIONS}
          isFetching={isFetching}
          currentUserEntry={currentUserEntry}
        />

        {isLoading ? (
          <TableSurfaceSkeleton rows={8} columns={5} />
        ) : isError ? (
          <SurfaceMessage
            title="Failed to load leaderboard"
            description="The leaderboard request failed before rankings could be displayed."
            tone="error"
            action={
              <Button variant="outline" onClick={retry}>
                Retry
              </Button>
            }
          />
        ) : entries.length === 0 ? (
          <SurfaceMessage
            title="No leaderboard data yet"
            description="Complete quiz attempts to appear in the leaderboard."
            tone="empty"
          />
        ) : (
          <LeaderboardPanel
            entries={entries}
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            setPage={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
