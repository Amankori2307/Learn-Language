import { type SetStateAction, useMemo, useState } from "react";
import {
  useReviewQueue,
  useTransitionReview,
  useBulkTransitionReview,
  useReviewHistory,
  type ReviewStatus,
} from "@/hooks/use-review";
import { ReviewStatusEnum } from "@shared/domain/enums";

export const REVIEW_STATUS_OPTIONS: ReviewStatus[] = [
  ReviewStatusEnum.PENDING_REVIEW,
  ReviewStatusEnum.DRAFT,
  ReviewStatusEnum.APPROVED,
  ReviewStatusEnum.REJECTED,
];

export function getReviewStatusDescription(status: ReviewStatus) {
  switch (status) {
    case ReviewStatusEnum.DRAFT:
      return "Draft items are created but not yet ready for reviewer sign-off. Edit them in Add Vocabulary, then move them into review when the content is ready.";
    case ReviewStatusEnum.APPROVED:
      return "Approved items are already cleared for learner-facing use. Review here is for reversal only.";
    case ReviewStatusEnum.REJECTED:
      return "Rejected items should be revised before another review pass. Create a revised draft, then move the item back for approval when ready.";
    case ReviewStatusEnum.PENDING_REVIEW:
    default:
      return "Pending review items are ready for reviewer decision before learner exposure.";
  }
}

export function formatReviewDate(value?: string | null) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function useReviewPageViewModel() {
  const [status, setStatus] = useState<ReviewStatus>(ReviewStatusEnum.PENDING_REVIEW);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeWordId, setActiveWordId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const queueQuery = useReviewQueue(status, page, 50);
  const historyQuery = useReviewHistory(activeWordId);
  const transition = useTransitionReview();
  const bulk = useBulkTransitionReview();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const totalResults = queueQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / 50));
  const currentPage = Math.min(page, totalPages);

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const setStatusAndResetPage = (nextStatus: SetStateAction<ReviewStatus>) => {
    setSelectedIds([]);
    setActiveWordId(undefined);
    setPage(1);
    setStatus(nextStatus);
  };

  const runBulk = async (toStatus: ReviewStatus) => {
    if (selectedIds.length === 0) return;
    await bulk.mutateAsync({ ids: selectedIds, toStatus, notes: notes || undefined });
    setSelectedIds([]);
  };

  const transitionWord = (payload: { id: number; toStatus: ReviewStatus }) => {
    transition.mutate({
      id: payload.id,
      toStatus: payload.toStatus,
      notes: notes || undefined,
    });
  };

  return {
    status,
    setStatus: setStatusAndResetPage,
    currentPage,
    totalPages,
    totalResults,
    setPage,
    selectedIds,
    selectedSet,
    activeWordId,
    setActiveWordId,
    notes,
    setNotes,
    queueItems: queueQuery.data?.items ?? [],
    queueLoading: queueQuery.isLoading,
    queueError: queueQuery.isError,
    retryQueue: () => queueQuery.refetch(),
    history: historyQuery.data ?? null,
    historyLoading: historyQuery.isLoading,
    historyError: historyQuery.isError || (Boolean(activeWordId) && !historyQuery.data),
    isTransitionPending: transition.isPending,
    isBulkPending: bulk.isPending,
    toggleSelected,
    clearSelection,
    runBulk,
    transitionWord,
  };
}
