import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PendingButton } from "@/components/ui/pending-button";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import { ReviewStatusEnum } from "@shared/domain/enums";
import { formatReviewDate } from "@/features/review/use-review-page-view-model";

type ReviewWord = {
  id: number;
  transliteration: string;
  originalScript: string;
  english: string;
  partOfSpeech: string;
  reviewStatus: string;
  submittedBy?: string | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
};

export function ReviewQueuePanel({
  queueItems,
  queueLoading,
  queueError,
  retryQueue,
  activeWordId,
  selectedSet,
  toggleSelected,
  setActiveWordId,
  isTransitionPending,
  transitionWord,
}: {
  queueItems: ReviewWord[];
  queueLoading: boolean;
  queueError: boolean;
  retryQueue: () => void;
  activeWordId?: number;
  selectedSet: Set<number>;
  toggleSelected: (id: number) => void;
  setActiveWordId: (id: number) => void;
  isTransitionPending: boolean;
  transitionWord: (payload: { id: number; toStatus: ReviewStatusEnum }) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="border-b border-border/50 p-4 font-semibold">Queue Items</div>
      {queueLoading ? (
        <div className="p-4">
          <TableSurfaceSkeleton rows={6} columns={4} className="border-0" />
        </div>
      ) : queueError ? (
        <div className="p-4">
          <SurfaceMessage
            title="Failed to load queue"
            description="The review queue request failed."
            tone="error"
            action={
              <Button variant="outline" onClick={retryQueue}>
                Retry
              </Button>
            }
            className="p-6"
          />
        </div>
      ) : queueItems.length === 0 ? (
        <div className="p-4">
          <SurfaceMessage
            title="Queue is empty"
            description="There are no items in this review state right now."
            tone="empty"
            className="p-6"
          />
        </div>
      ) : (
        <div className="overflow-auto md:max-h-[var(--pane-review-max-height)]">
          {queueItems.map((word) => (
            <div
              key={word.id}
              className={`border-b border-border/30 p-4 last:border-b-0 ${activeWordId === word.id ? "bg-secondary/50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedSet.has(word.id)}
                  onCheckedChange={() => toggleSelected(word.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium">
                    {word.transliteration} ({word.originalScript})
                  </p>
                  <p className="break-words text-sm text-muted-foreground">
                    {word.english} • {word.partOfSpeech}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">status: {word.reviewStatus}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    submitted: {word.submittedBy || "n/a"} • {formatReviewDate(word.submittedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    reviewed: {word.reviewedBy || "n/a"} • {formatReviewDate(word.reviewedAt)}
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setActiveWordId(word.id)}
                    >
                      View History
                    </Button>
                    <PendingButton
                      size="sm"
                      onClick={() =>
                        transitionWord({
                          id: word.id,
                          toStatus: ReviewStatusEnum.APPROVED,
                        })
                      }
                      pending={isTransitionPending}
                      pendingLabel="Approving..."
                      className="w-full sm:w-auto"
                    >
                      Approve
                    </PendingButton>
                    <PendingButton
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        transitionWord({
                          id: word.id,
                          toStatus: ReviewStatusEnum.REJECTED,
                        })
                      }
                      pending={isTransitionPending}
                      pendingLabel="Rejecting..."
                      className="w-full sm:w-auto"
                    >
                      Reject
                    </PendingButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
