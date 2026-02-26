import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { LanguageEnum, PartOfSpeechEnum, VocabularyTagEnum } from "@shared/domain/enums";
import { reviewService, type ReviewStatus } from "@/services/reviewService";

export type { ReviewStatus };

export function useReviewQueue(status: ReviewStatus, limit = 50) {
  return useQuery({
    queryKey: [api.review.queue.path, status, limit],
    queryFn: () => reviewService.getQueue(status, limit),
  });
}

export function useReviewHistory(wordId?: number) {
  return useQuery({
    queryKey: [api.review.history.path, wordId],
    enabled: Boolean(wordId),
    queryFn: () => reviewService.getHistory(wordId!),
  });
}

export function useTransitionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; toStatus: ReviewStatus; notes?: string }) => reviewService.transition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.review.queue.path] });
      queryClient.invalidateQueries({ queryKey: [api.review.history.path] });
    },
  });
}

export function useBulkTransitionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; toStatus: ReviewStatus; notes?: string }) => reviewService.bulkTransition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.review.queue.path] });
      queryClient.invalidateQueries({ queryKey: [api.review.history.path] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.review.queue.path] });
    },
  });
}
