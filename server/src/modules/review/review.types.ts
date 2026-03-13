import { ReviewStatusEnum } from "@shared/domain/enums";

export type ReviewQueueInput = {
  status?: ReviewStatusEnum;
  page?: number;
  limit?: number;
};

export type ReviewConflictInput = {
  limit?: number;
};
