import { ReviewStatusEnum } from "@shared/domain/enums";

export type ReviewQueueInput = {
  status?: ReviewStatusEnum;
  limit?: number;
};

export type ReviewConflictInput = {
  limit?: number;
};
