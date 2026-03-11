import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { UserTypeEnum } from "@shared/domain/enums";
import { ReviewQueuePanel } from "@/features/review/review-queue-panel";
import { ReviewHistoryPanel } from "@/features/review/review-history-panel";
import { ReviewAccessState } from "@/features/review/review-access-state";
import { ReviewPageHeader } from "@/features/review/review-page-header";
import { ReviewBulkActions } from "@/features/review/review-bulk-actions";
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
        <ReviewAccessState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <ReviewPageHeader
          status={status}
          setStatus={setStatus}
          statusOptions={REVIEW_STATUS_OPTIONS}
        />

        <ReviewBulkActions
          notes={notes}
          setNotes={setNotes}
          selectedCount={selectedIds.length}
          runBulk={runBulk}
          clearSelection={clearSelection}
          isBulkPending={isBulkPending}
        />

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
