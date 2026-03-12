import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { formatReviewDate } from "@/features/review/use-review-page-view-model";

type ReviewHistoryData = {
  word: {
    transliteration: string;
    originalScript: string;
    english: string;
    sourceUrl?: string | null;
    sourceCapturedAt?: string | null;
  };
  clusters: Array<{ id: number; name: string }>;
  relatedClusterWords: Array<{
    id: number;
    transliteration: string;
    originalScript: string;
    english: string;
    reviewStatus: string;
  }>;
  events: Array<{
    id: number;
    fromStatus: string;
    toStatus: string;
    changedBy: string;
    createdAt: string | null;
    sourceUrl?: string | null;
    sourceCapturedAt?: string | null;
    notes?: string | null;
  }>;
};

export function ReviewHistoryPanel({
  activeWordId,
  history,
  historyLoading,
  historyError,
}: {
  activeWordId?: number;
  history: ReviewHistoryData | null;
  historyLoading: boolean;
  historyError: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="border-b border-border/50 p-4 font-semibold">Review History</div>
      {!activeWordId ? (
        <div className="p-6 text-muted-foreground">
          Select an item to inspect source and transition history.
        </div>
      ) : historyLoading ? (
        <div className="p-4">
          <TableSurfaceSkeleton rows={4} columns={2} className="border-0" />
        </div>
      ) : historyError || !history ? (
        <div className="p-4">
          <SurfaceMessage
            title="Failed to load history"
            description="The selected word history could not be loaded."
            tone="error"
            className="p-6"
          />
        </div>
      ) : (
        <div className="space-y-3 overflow-auto p-4 md:max-h-[var(--pane-review-max-height)]">
          <div className="rounded-xl border border-border/50 p-3">
            <p className="break-words font-medium">
              {history.word.transliteration} ({history.word.originalScript})
            </p>
            <p className="break-words text-sm text-muted-foreground">{history.word.english}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {history.clusters.length > 0 ? (
                history.clusters.map((cluster) => (
                  <span
                    key={cluster.id}
                    className="inline-flex items-center rounded-full border border-border/60 bg-secondary px-2 py-1 text-xs"
                  >
                    {cluster.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No clusters linked</span>
              )}
            </div>
            <p className="mt-2 break-all text-xs text-muted-foreground">
              Source:{" "}
              {history.word.sourceUrl ? (
                <a
                  className="underline"
                  href={history.word.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {history.word.sourceUrl}
                </a>
              ) : (
                "n/a"
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Source captured: {formatReviewDate(history.word.sourceCapturedAt)}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 p-3">
            <p className="text-sm font-medium">Related Cluster Words</p>
            {history.relatedClusterWords.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                No related words found for linked clusters.
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {history.relatedClusterWords.map((item) => (
                  <p key={item.id} className="text-xs text-muted-foreground">
                    {item.transliteration} ({item.originalScript}) • {item.english} •{" "}
                    {item.reviewStatus}
                  </p>
                ))}
              </div>
            )}
          </div>
          {history.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No review events yet.</p>
          ) : (
            history.events.map((event) => (
              <div key={event.id} className="rounded-xl border border-border/40 p-3">
                <p className="text-sm font-medium">
                  {event.fromStatus} {"->"} {event.toStatus}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {event.changedBy} • {formatReviewDate(event.createdAt)}
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  source:{" "}
                  {event.sourceUrl ? (
                    <a
                      className="underline"
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {event.sourceUrl}
                    </a>
                  ) : (
                    "n/a"
                  )}
                  {" • "}captured: {formatReviewDate(event.sourceCapturedAt)}
                </p>
                {event.notes ? <p className="mt-1 text-sm">{event.notes}</p> : null}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
