import { LanguageEnum, ReviewDisagreementStatusEnum, ReviewStatusEnum } from "@shared/domain/enums";

export class ReviewQueueItemEntity {
  id!: number;
  language!: LanguageEnum;
  originalScript!: string;
  transliteration!: string;
  english!: string;
  reviewStatus!: ReviewStatusEnum;
  reviewerConfidenceScore!: number | null;
  requiresSecondaryReview!: boolean;
  disagreementStatus!: ReviewDisagreementStatusEnum;
}

