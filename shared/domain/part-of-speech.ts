import { PartOfSpeechEnum } from "./enums";

export const PART_OF_SPEECH_OPTIONS = [
  { value: PartOfSpeechEnum.NOUN, label: "Noun" },
  { value: PartOfSpeechEnum.VERB, label: "Verb" },
  { value: PartOfSpeechEnum.ADJECTIVE, label: "Adjective" },
  { value: PartOfSpeechEnum.ADVERB, label: "Adverb" },
  { value: PartOfSpeechEnum.PRONOUN, label: "Pronoun" },
  { value: PartOfSpeechEnum.PHRASE, label: "Phrase" },
  { value: PartOfSpeechEnum.NUMERAL, label: "Numeral" },
  { value: PartOfSpeechEnum.PREPOSITION, label: "Preposition" },
  { value: PartOfSpeechEnum.CONJUNCTION, label: "Conjunction" },
  { value: PartOfSpeechEnum.INTERJECTION, label: "Interjection" },
] as const;

export const PART_OF_SPEECH_VALUE_SET = new Set<PartOfSpeechEnum>(
  PART_OF_SPEECH_OPTIONS.map((option) => option.value),
);

export function isPartOfSpeech(value: string): value is PartOfSpeechEnum {
  return PART_OF_SPEECH_VALUE_SET.has(value as PartOfSpeechEnum);
}
