import { LanguageEnum } from "@shared/domain/enums";

export type ListWordsInput = {
  language?: LanguageEnum;
  search?: string;
  clusterId?: number;
  limit?: number;
};

export type ListClustersInput = {
  language?: LanguageEnum;
  q?: string;
  type?: string;
  sort?: "name_asc" | "name_desc" | "type_asc" | "words_desc" | "words_asc";
  page?: number;
  limit?: number;
};
