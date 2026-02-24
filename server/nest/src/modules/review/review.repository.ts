import { Injectable } from "@nestjs/common";
import { storage } from "../../../../storage";
import { ReviewDisagreementStatusEnum, ReviewStatusEnum } from "@shared/domain/enums";

type ITransitionOptions = {
  notes?: string;
  reviewerConfidenceScore?: number;
  requiresSecondaryReview?: boolean;
  disagreementStatus?: ReviewDisagreementStatusEnum;
};

type IResolveConflictOptions = {
  toStatus: ReviewStatusEnum;
  notes?: string;
  reviewerConfidenceScore?: number;
};

type ICreateWordDraftInput = Parameters<typeof storage.createWordDraft>[0];

@Injectable()
export class ReviewRepository {
  getReviewQueue(status: ReviewStatusEnum, limit: number) {
    return storage.getReviewQueue(status, limit);
  }

  getConflictReviewQueue(limit: number) {
    return storage.getConflictReviewQueue(limit);
  }

  transitionWordReview(wordId: number, reviewerId: string, toStatus: ReviewStatusEnum, options?: ITransitionOptions) {
    return storage.transitionWordReview(wordId, reviewerId, toStatus, options);
  }

  resolveWordReviewConflict(wordId: number, reviewerId: string, options: IResolveConflictOptions) {
    return storage.resolveWordReviewConflict(wordId, reviewerId, options);
  }

  getWordWithReviewHistory(wordId: number) {
    return storage.getWordWithReviewHistory(wordId);
  }

  createWordDraft(input: ICreateWordDraftInput) {
    return storage.createWordDraft(input);
  }
}
