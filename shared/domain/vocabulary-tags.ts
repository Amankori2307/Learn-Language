import { VocabularyTagEnum } from "./enums";

export const VOCABULARY_TAG_OPTIONS = [
  { value: VocabularyTagEnum.MODEL_SEED, label: "Model Seed" },
  { value: VocabularyTagEnum.HIGH_CONFIDENCE_BASIC, label: "High Confidence Basic" },
  { value: VocabularyTagEnum.MANUAL_DRAFT, label: "Manual Draft" },
  { value: VocabularyTagEnum.REVIEWER_ADDED, label: "Reviewer Added" },
  { value: VocabularyTagEnum.NEEDS_REVIEW, label: "Needs Review" },
] as const;

export const VOCABULARY_TAG_VALUE_SET = new Set<VocabularyTagEnum>(
  VOCABULARY_TAG_OPTIONS.map((option) => option.value),
);

export function isVocabularyTag(value: string): value is VocabularyTagEnum {
  return VOCABULARY_TAG_VALUE_SET.has(value as VocabularyTagEnum);
}
