import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { LanguageEnum, PartOfSpeechEnum, VocabularyTagEnum } from "@shared/domain/enums";
import { reviewService, type ReviewStatus } from "@/services/reviewService";
import { trackAnalyticsEvent } from "@/lib/analytics";

export type { ReviewStatus };

export function reviewQueueQueryPrefix() {
  return [api.review.queue.path] as const;
}

export function reviewQueueQueryKey(status: ReviewStatus, limit: number) {
  return [api.review.queue.path, status, limit] as const;
}

export function reviewHistoryQueryKey(wordId?: number) {
  return [api.review.history.path, wordId] as const;
}

export function useReviewQueue(status: ReviewStatus, limit = 50) {
  return useQuery({
    queryKey: reviewQueueQueryKey(status, limit),
    queryFn: () => reviewService.getQueue(status, limit),
  });
}

export function useReviewHistory(wordId?: number) {
  return useQuery({
    queryKey: reviewHistoryQueryKey(wordId),
    enabled: Boolean(wordId),
    queryFn: () => reviewService.getHistory(wordId!),
  });
}

export function useTransitionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; toStatus: ReviewStatus; notes?: string }) =>
      reviewService.transition(payload),
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: reviewQueueQueryPrefix() });
      queryClient.invalidateQueries({ queryKey: reviewHistoryQueryKey(payload.id) });
      trackAnalyticsEvent("review_transition_completed", {
        route: "/review",
        wordId: payload.id,
        toStatus: payload.toStatus,
      });
    },
  });
}

export function useBulkTransitionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; toStatus: ReviewStatus; notes?: string }) =>
      reviewService.bulkTransition(payload),
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: reviewQueueQueryPrefix() });
      payload.ids.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: reviewHistoryQueryKey(id) });
      });
      trackAnalyticsEvent("review_bulk_transition_completed", {
        route: "/review",
        count: payload.ids.length,
        toStatus: payload.toStatus,
      });
    },
  });
}

export function useCreateReviewDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      language: LanguageEnum;
      originalScript: string;
      pronunciation: string;
      english: string;
      partOfSpeech: PartOfSpeechEnum;
      audioUrl?: string;
      imageUrl?: string;
      sourceUrl?: string;
      tags?: VocabularyTagEnum[];
      clusterIds?: number[];
      examples: Array<{
        originalScript: string;
        pronunciation: string;
        englishSentence: string;
        contextTag: string;
        difficulty: number;
      }>;
    }) => reviewService.createDraft(payload),
    onSuccess: (result, payload) => {
      queryClient.invalidateQueries({ queryKey: reviewQueueQueryPrefix() });
      trackAnalyticsEvent("review_draft_created", {
        route: "/review/add",
        language: payload.language,
        examplesCreated: result.examplesCreated,
        clusterCount: payload.clusterIds?.length ?? 0,
      });
    },
  });
}
