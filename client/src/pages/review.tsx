import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ReviewStatusEnum, UserTypeEnum } from "@shared/domain/enums";
import { Link } from "wouter";
import { PendingButton } from "@/components/ui/pending-button";
import { ReviewQueuePanel } from "@/features/review/review-queue-panel";
import { ReviewHistoryPanel } from "@/features/review/review-history-panel";
import {
  useReviewPageViewModel,
  REVIEW_STATUS_OPTIONS,
} from "@/features/review/use-review-page-view-model";

export default function ReviewPage() {
  const { user } = useAuth();
  const canReview = user?.role === UserTypeEnum.REVIEWER || user?.role === UserTypeEnum.ADMIN;
  const {
    status,
    setStatus,
    selectedIds,
    selectedSet,
    activeWordId,
    setActiveWordId,
    notes,
    setNotes,
    queueItems,
    queueLoading,
    queueError,
    retryQueue,
    history,
    historyLoading,
    historyError,
    isTransitionPending,
    isBulkPending,
    toggleSelected,
    clearSelection,
    runBulk,
    transitionWord,
  } = useReviewPageViewModel();

  if (!canReview) {
    return (
      <Layout>
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Review Access Required</h1>
          <p className="text-muted-foreground mt-2">
            Only reviewer/admin roles can access vocabulary review tools.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground">
              Approve or reject vocabulary before learner exposure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {REVIEW_STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "outline"}
                onClick={() => setStatus(s)}
              >
                {s}
              </Button>
            ))}
            <Link href="/review/add">
              <Button variant="secondary">Go to Add Vocabulary</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 md:p-6 space-y-3">
          <Label htmlFor="review-notes">Review Notes (applied to bulk action)</Label>
          <Input
            id="review-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for audit trail"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <PendingButton
              onClick={() => runBulk(ReviewStatusEnum.APPROVED)}
              disabled={selectedIds.length === 0}
              pending={isBulkPending}
              pendingLabel="Approving..."
            >
              Bulk Approve
            </PendingButton>
            <PendingButton
              variant="destructive"
              onClick={() => runBulk(ReviewStatusEnum.REJECTED)}
              disabled={selectedIds.length === 0}
              pending={isBulkPending}
              pendingLabel="Rejecting..."
            >
              Bulk Reject
            </PendingButton>
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={selectedIds.length === 0}
            >
              Clear Selection
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <ReviewQueuePanel
            queueItems={queueItems}
            queueLoading={queueLoading}
            queueError={queueError}
            retryQueue={retryQueue}
            activeWordId={activeWordId}
            selectedSet={selectedSet}
            toggleSelected={toggleSelected}
            setActiveWordId={setActiveWordId}
            isTransitionPending={isTransitionPending}
            transitionWord={transitionWord}
          />

          <ReviewHistoryPanel
            activeWordId={activeWordId}
            history={history}
            historyLoading={historyLoading}
            historyError={historyError}
          />
        </div>
      </div>
    </Layout>
  );
}
