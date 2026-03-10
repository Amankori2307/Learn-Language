import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ReviewStatusEnum, UserTypeEnum } from "@shared/domain/enums";
import { Link } from "wouter";
import { PendingButton } from "@/components/ui/pending-button";
import { SurfaceMessage, TableSurfaceSkeleton } from "@/components/ui/page-states";
import {
  useReviewPageViewModel,
  REVIEW_STATUS_OPTIONS,
  formatReviewDate,
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
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 font-semibold">Queue Items</div>
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
              <div className="max-h-[560px] overflow-auto">
                {queueItems.map((word) => (
                  <div
                    key={word.id}
                    className={`p-4 border-b border-border/30 last:border-b-0 ${activeWordId === word.id ? "bg-secondary/50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSet.has(word.id)}
                        onCheckedChange={() => toggleSelected(word.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {word.transliteration} ({word.originalScript})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {word.english} • {word.partOfSpeech}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          status: {word.reviewStatus}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          submitted: {word.submittedBy || "n/a"} • {formatReviewDate(word.submittedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          reviewed: {word.reviewedBy || "n/a"} • {formatReviewDate(word.reviewedAt)}
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="sm:w-auto"
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
                            className="sm:w-auto"
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
                            className="sm:w-auto"
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

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50 font-semibold">Review History</div>
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
              <div className="max-h-[560px] space-y-3 overflow-auto p-4">
                <div className="rounded-xl border border-border/50 p-3">
                  <p className="font-medium">
                    {history.word.transliteration} ({history.word.originalScript})
                  </p>
                  <p className="text-sm text-muted-foreground">{history.word.english}</p>
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
                  <p className="text-xs text-muted-foreground mt-2">
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
                    <p className="text-xs text-muted-foreground mt-1">
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
                      <p className="text-xs text-muted-foreground">
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
                      {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
