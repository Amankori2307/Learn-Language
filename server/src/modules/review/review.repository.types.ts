import { storage } from "../../infrastructure/storage";
import { ReviewDisagreementStatusEnum, ReviewStatusEnum } from "@shared/domain/enums";

export type ITransitionOptions = {
  notes?: string;
  reviewerConfidenceScore?: number;
  requiresSecondaryReview?: boolean;
  disagreementStatus?: ReviewDisagreementStatusEnum;
};

export type IResolveConflictOptions = {
  toStatus: ReviewStatusEnum;
  notes?: string;
  reviewerConfidenceScore?: number;
};

export type ICreateWordDraftInput = Parameters<typeof storage.createWordDraft>[0];
