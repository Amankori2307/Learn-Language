import { useMemo, useState } from "react";
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

export function formatReviewDate(value?: string | null) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function useReviewPageViewModel() {
  const [status, setStatus] = useState<ReviewStatus>(ReviewStatusEnum.PENDING_REVIEW);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeWordId, setActiveWordId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const queueQuery = useReviewQueue(status, 100);
  const historyQuery = useReviewHistory(activeWordId);
  const transition = useTransitionReview();
  const bulk = useBulkTransitionReview();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
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
    setStatus,
    selectedIds,
    selectedSet,
    activeWordId,
    setActiveWordId,
    notes,
    setNotes,
    queueItems: queueQuery.data ?? [],
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
