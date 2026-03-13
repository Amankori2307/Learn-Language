import { Injectable } from "@nestjs/common";
import { storage } from "../../infrastructure/storage";
import { ReviewStatusEnum } from "@shared/domain/enums";
import {
  ICreateWordDraftInput,
  IResolveConflictOptions,
  ITransitionOptions,
} from "./review.repository.types";
import { ReviewQueueInput } from "./review.types";

@Injectable()
export class ReviewRepository {
  getReviewQueue(input: ReviewQueueInput) {
    return storage.getReviewQueue({
      status: input.status ?? ReviewStatusEnum.PENDING_REVIEW,
      page: input.page,
      limit: input.limit,
    });
  }

  getConflictReviewQueue(limit: number) {
    return storage.getConflictReviewQueue(limit);
  }

  transitionWordReview(
    wordId: number,
    reviewerId: string,
    toStatus: ReviewStatusEnum,
    options?: ITransitionOptions,
  ) {
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
