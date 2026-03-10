import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import {
  LEADERBOARD_WINDOW_OPTIONS,
  useLeaderboardPageViewModel,
} from "@/features/analytics/use-leaderboard-page-view-model";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { LeaderboardPanel } from "@/features/analytics/leaderboard-panel";

export default function LeaderboardPage() {
  const { window, setWindow, entries, isLoading, isError, isFetching, retry } =
    useLeaderboardPageViewModel();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track top learners by XP, streak, and accuracy.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {LEADERBOARD_WINDOW_OPTIONS.map((option) => (
              <Button
                key={option.key}
                variant={option.key === window ? "default" : "outline"}
                onClick={() => setWindow(option.key)}
                disabled={isFetching}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

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
          <LeaderboardPanel entries={entries} />
        )}
      </div>
    </Layout>
  );
}
