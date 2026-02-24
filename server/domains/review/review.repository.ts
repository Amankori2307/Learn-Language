import { Injectable } from "@nestjs/common";
import { storage } from "../../storage";
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

export interface IReviewRepository {
  getReviewQueue(status: ReviewStatusEnum, limit: number): Promise<Awaited<ReturnType<typeof storage.getReviewQueue>>>;
  getConflictReviewQueue(limit: number): Promise<Awaited<ReturnType<typeof storage.getConflictReviewQueue>>>;
  transitionWordReview(
    wordId: number,
    reviewerId: string,
    toStatus: ReviewStatusEnum,
    options?: ITransitionOptions,
  ): Promise<Awaited<ReturnType<typeof storage.transitionWordReview>>>;
  resolveWordReviewConflict(
    wordId: number,
    reviewerId: string,
    options: IResolveConflictOptions,
  ): Promise<Awaited<ReturnType<typeof storage.resolveWordReviewConflict>>>;
  getWordWithReviewHistory(wordId: number): Promise<Awaited<ReturnType<typeof storage.getWordWithReviewHistory>>>;
  createWordDraft(input: ICreateWordDraftInput): Promise<Awaited<ReturnType<typeof storage.createWordDraft>>>;
}

@Injectable()
export class ReviewRepository implements IReviewRepository {
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
