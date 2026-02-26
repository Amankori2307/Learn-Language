import { api } from "@shared/routes";
import { LanguageEnum, PartOfSpeechEnum, ReviewStatusEnum, VocabularyTagEnum } from "@shared/domain/enums";
import { apiClient, buildApiUrl } from "./apiClient";

export type ReviewStatus = ReviewStatusEnum;

export type CreateReviewDraftPayload = {
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
};

export const reviewService = {
  async getQueue(status: ReviewStatus, limit: number) {
    const params = new URLSearchParams({ status, limit: String(limit) });
    const response = await apiClient.get(buildApiUrl(`${api.review.queue.path}?${params.toString()}`));
    return api.review.queue.responses[200].parse(response.data);
  },
  async getHistory(wordId: number) {
    const response = await apiClient.get(buildApiUrl(`/api/review/words/${wordId}/history`));
    return api.review.history.responses[200].parse(response.data);
  },
  async transition(payload: { id: number; toStatus: ReviewStatus; notes?: string }) {
    const response = await apiClient.patch(buildApiUrl(`/api/review/words/${payload.id}`), {
      toStatus: payload.toStatus,
      notes: payload.notes,
    });
    return api.review.transition.responses[200].parse(response.data);
  },
  async bulkTransition(payload: { ids: number[]; toStatus: ReviewStatus; notes?: string }) {
    const response = await apiClient.patch(buildApiUrl(api.review.bulkTransition.path), payload);
    return api.review.bulkTransition.responses[200].parse(response.data);
  },
  async createDraft(payload: CreateReviewDraftPayload) {
    const response = await apiClient.post(buildApiUrl(api.review.submitDraft.path), payload);
    return api.review.submitDraft.responses[200].parse(response.data);
  },
};

