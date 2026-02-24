import { LanguageEnum } from "@shared/domain/enums";

export type ListWordsInput = {
  language?: LanguageEnum;
  search?: string;
  clusterId?: number;
  limit?: number;
};
