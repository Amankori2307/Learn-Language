import fs from "fs/promises";
import path from "path";
import { LanguageEnum, PartOfSpeechEnum } from "../shared/domain/enums";
import { isPartOfSpeech } from "../shared/domain/part-of-speech";

type ContentWord = {
  key: string;
  language: LanguageEnum;
  originalScript: string;
  transliteration: string;
  english: string;
  partOfSpeech: PartOfSpeechEnum;
  difficulty: number;
  difficultyLevel: "beginner" | "easy" | "medium" | "hard";
  frequencyScore: number;
  cefrLevel?: string;
  tags?: string[];
  clusters?: string[];
  source?: {
    type?: string;
    generatedAt?: string;
    reviewStatus?: "draft" | "pending_review" | "approved" | "rejected";
    sourceUrl?: string;
  };
};

type ContentSentence = {
  language: LanguageEnum;
  originalScript: string;
  pronunciation: string;
  english: string;
  contextTag: string;
  difficulty: number;
  wordRefs: string[];
};

const TOKEN_PATTERN = /^[a-z0-9-]+$/;
const FORBIDDEN_PLACEHOLDER_PATTERNS = [
  /sample/i,
  /dummy/i,
  /placeholder/i,
  /^word-\d+/i,
  /^padam-/i,
];

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function hasLatin(value: string): boolean {
  return /[a-z]/i.test(value);
}

function isLanguage(value: string | undefined): value is LanguageEnum {
  return Boolean(value) && Object.values(LanguageEnum).includes(value as LanguageEnum);
}

function validateTagLikeCollection(
  values: string[] | undefined,
  label: "tags" | "clusters",
  row: number,
  errors: string[],
) {
  if (!values || values.length === 0) {
    errors.push(`[word ${row}] ${label} must include at least one value`);
    return;
  }

  const seen = new Set<string>();
  values.forEach((rawValue) => {
    const value = rawValue.trim();
    const normalized = normalize(value);

    if (!value) {
      errors.push(`[word ${row}] ${label} cannot contain empty values`);
      return;
    }

    if (!TOKEN_PATTERN.test(value)) {
      errors.push(`[word ${row}] ${label} value "${value}" must be lowercase kebab-case`);
    }

    if (FORBIDDEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) {
      errors.push(`[word ${row}] ${label} value "${value}" looks like placeholder content`);
    }

    if (seen.has(normalized)) {
      errors.push(`[word ${row}] ${label} contains duplicate value "${value}"`);
    }
    seen.add(normalized);
  });
}

function validateWord(word: ContentWord, row: number, errors: string[]) {
  if (!word.key || !word.originalScript || !word.english || !word.transliteration || !word.partOfSpeech) {
    errors.push(`[word ${row}] Missing required lexical fields`);
    return;
  }

  if (word.key !== word.key.trim()) {
    errors.push(`[word ${row}] key cannot have leading/trailing spaces`);
  }

  const language = word.language;
  if (!isLanguage(language)) {
    errors.push(`[word ${row}] Invalid language: ${String(word.language)}`);
  }

  if (word.originalScript !== undefined && !word.originalScript.trim()) {
    errors.push(`[word ${row}] originalScript cannot be empty`);
  }

  if (word.transliteration !== undefined && !word.transliteration.trim()) {
    errors.push(`[word ${row}] transliteration cannot be empty`);
  } else {
    const transliteration = word.transliteration.trim();
    if (transliteration.length < 3) {
      errors.push(`[word ${row}] transliteration is too short`);
    }
    if (!hasLatin(transliteration)) {
      errors.push(`[word ${row}] transliteration must contain latin characters`);
    }
    if (FORBIDDEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(transliteration))) {
      errors.push(`[word ${row}] transliteration "${transliteration}" looks like placeholder content`);
    }
  }

  if (word.frequencyScore < 0 || word.frequencyScore > 1) {
    errors.push(`[word ${row}] frequencyScore must be between 0 and 1`);
  }

  if (!isPartOfSpeech(word.partOfSpeech)) {
    errors.push(`[word ${row}] partOfSpeech "${word.partOfSpeech}" is not supported`);
  }

  validateTagLikeCollection(word.tags, "tags", row, errors);
  validateTagLikeCollection(word.clusters, "clusters", row, errors);
}

function validateSentence(
  sentence: ContentSentence,
  row: number,
  errors: string[],
  wordKeys: Set<string>,
) {
  if (!sentence.originalScript || !sentence.pronunciation || !sentence.english || !sentence.contextTag) {
    errors.push(`[sentence ${row}] Missing originalScript/pronunciation/english/contextTag`);
  }

  if (!isLanguage(sentence.language)) {
    errors.push(`[sentence ${row}] Invalid language: ${String(sentence.language)}`);
  }

  if (!Number.isInteger(sentence.difficulty) || sentence.difficulty < 1) {
    errors.push(`[sentence ${row}] difficulty must be a positive integer`);
  }

  const pronunciation = sentence.pronunciation?.trim() ?? "";
  if (pronunciation.length < 3) {
    errors.push(`[sentence ${row}] pronunciation is too short`);
  }
  if (!hasLatin(pronunciation)) {
    errors.push(`[sentence ${row}] pronunciation must contain latin characters`);
  }
  if (FORBIDDEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(pronunciation))) {
    errors.push(`[sentence ${row}] pronunciation "${pronunciation}" looks like placeholder content`);
  }

  const contextTag = sentence.contextTag?.trim() ?? "";
  if (!TOKEN_PATTERN.test(contextTag)) {
    errors.push(`[sentence ${row}] contextTag must be lowercase kebab-case`);
  }

  if (!sentence.wordRefs || sentence.wordRefs.length === 0) {
    errors.push(`[sentence ${row}] wordRefs must include at least one linked word key`);
    return;
  }

  const uniqueRefs = new Set<string>();
  for (const ref of sentence.wordRefs) {
    const refValue = ref.trim();
    if (!refValue) {
      errors.push(`[sentence ${row}] wordRefs cannot include empty values`);
      continue;
    }

    if (!wordKeys.has(refValue)) {
      errors.push(`[sentence ${row}] wordRef "${refValue}" does not exist in words.json`);
      continue;
    }

    if (uniqueRefs.has(refValue)) {
      errors.push(`[sentence ${row}] wordRefs contains duplicate link "${refValue}"`);
      continue;
    }

    uniqueRefs.add(refValue);
  }
}

async function main() {
  const wordsPath = process.argv[2] ?? "assets/processed/words.json";
  const sentencesPath = process.argv[3] ?? "assets/processed/sentences.json";

  const wordsRaw = await fs.readFile(path.resolve(process.cwd(), wordsPath), "utf-8");
  const sentencesRaw = await fs.readFile(path.resolve(process.cwd(), sentencesPath), "utf-8");
  const words = JSON.parse(wordsRaw) as ContentWord[];
  const sentences = JSON.parse(sentencesRaw) as ContentSentence[];

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error(`No words found in ${wordsPath}`);
  }

  if (!Array.isArray(sentences) || sentences.length === 0) {
    throw new Error(`No sentences found in ${sentencesPath}`);
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const lexicalKeys = new Set<string>();
  const wordKeys = new Set<string>();
  const transliterationToEnglish = new Map<string, Set<string>>();
  const refUsage = new Map<string, number>();

  words.forEach((word, index) => {
    const row = index + 1;
    validateWord(word, row, errors);

    if (wordKeys.has(word.key)) {
      errors.push(`[word ${row}] Duplicate word key "${word.key}"`);
    } else {
      wordKeys.add(word.key);
    }

    const lexicalKey = `${word.language}::${word.originalScript}::${word.english}`;
    if (lexicalKeys.has(lexicalKey)) {
      errors.push(`[word ${row}] Duplicate lexical key ${lexicalKey}`);
    } else {
      lexicalKeys.add(lexicalKey);
    }

    const transliterationKey = `${word.language}::${normalize(word.transliteration)}`;
    const englishSet = transliterationToEnglish.get(transliterationKey) ?? new Set<string>();
    englishSet.add(normalize(word.english));
    transliterationToEnglish.set(transliterationKey, englishSet);
  });

  sentences.forEach((sentence, index) => {
    const row = index + 1;
    validateSentence(sentence, row, errors, wordKeys);
    sentence.wordRefs.forEach((ref) => {
      const refKey = ref.trim();
      if (!refKey) return;
      refUsage.set(refKey, (refUsage.get(refKey) ?? 0) + 1);
    });
  });

  transliterationToEnglish.forEach((englishValues, transliterationKey) => {
    if (englishValues.size > 1) {
      errors.push(
        `[collision] transliteration ${transliterationKey} maps to multiple meanings: ${Array.from(englishValues).join(", ")}`,
      );
    }
  });

  wordKeys.forEach((key) => {
    if (!refUsage.has(key)) {
      warnings.push(`[orphan] word key "${key}" has no linked sentences`);
    }
  });

  console.log("Validation summary");
  console.log(`Words: ${words.length}`);
  console.log(`Sentences: ${sentences.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log("Warnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (errors.length > 0) {
    console.error("Errors:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
