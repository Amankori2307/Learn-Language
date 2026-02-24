import { QuizModeEnum } from "@shared/domain/enums";

export type GenerateQuizInput = {
  userId: string;
  mode?: QuizModeEnum;
  clusterId?: number;
  count?: number;
  language?: unknown;
};

export type SubmitQuizInput = {
  userId: string;
  payload: unknown;
};
