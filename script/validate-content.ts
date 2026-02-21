import fs from "fs/promises";
import path from "path";
import { LanguageEnum } from "../shared/domain/enums";

type ContentExample = {
  language: LanguageEnum;
  originalScript: string;
  pronunciation: string;
  english: string;
  contextTag: string;
  difficulty: number;
};

type ContentWord = {
  language: LanguageEnum;
  originalScript: string;
  transliteration: string;
  english: string;
  partOfSpeech: string;
  difficulty: number;
  difficultyLevel: "beginner" | "easy" | "medium" | "hard";
  frequencyScore: number;
  cefrLevel?: string;
  tags?: string[];
  clusters?: string[];
  examples?: ContentExample[];
  source?: {
    type?: string;
    generatedAt?: string;
    reviewStatus?: "draft" | "pending_review" | "approved" | "rejected";
    sourceUrl?: string;
  };
};

function isLanguage(value: string | undefined): value is LanguageEnum {
  return Boolean(value) && Object.values(LanguageEnum).includes(value as LanguageEnum);
}

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

function validateTagLikeCollection(
  values: string[] | undefined,
  label: "tags" | "clusters",
  row: number,
  errors: string[],
) {
  if (!values || values.length === 0) {
    errors.push(`[row ${row}] ${label} must include at least one value`);
    return;
  }

  const seen = new Set<string>();
  values.forEach((rawValue) => {
    const value = rawValue.trim();
    const normalized = normalize(value);

    if (!value) {
      errors.push(`[row ${row}] ${label} cannot contain empty values`);
      return;
    }

    if (!TOKEN_PATTERN.test(value)) {
      errors.push(`[row ${row}] ${label} value "${value}" must be lowercase kebab-case`);
    }

    if (FORBIDDEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) {
      errors.push(`[row ${row}] ${label} value "${value}" looks like placeholder content`);
    }

    if (seen.has(normalized)) {
      errors.push(`[row ${row}] ${label} contains duplicate value "${value}"`);
    }
    seen.add(normalized);
  });
}

async function main() {
  const inputPath = process.argv[2] ?? "assets/processed/seed.json";
  const fullPath = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(fullPath, "utf-8");
  const words = JSON.parse(raw) as ContentWord[];

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error(`No content words found in ${inputPath}`);
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const keys = new Set<string>();
  const transliterationToEnglish = new Map<string, Set<string>>();
  const lexicalMetadata = new Map<string, { tags: string[]; clusters: string[] }>();

  words.forEach((word, idx) => {
    const row = idx + 1;
    if (!word.originalScript || !word.english || !word.transliteration || !word.partOfSpeech) {
      errors.push(`[row ${row}] Missing required lexical fields`);
      return;
    }
    if (word.originalScript !== undefined && !word.originalScript.trim()) {
      errors.push(`[row ${row}] originalScript cannot be empty`);
    }

    if (word.transliteration !== undefined && !word.transliteration.trim()) {
      errors.push(`[row ${row}] transliteration cannot be empty`);
    } else {
      const transliteration = word.transliteration.trim();
      if (transliteration.length < 3) {
        errors.push(`[row ${row}] transliteration is too short`);
      }
      if (!hasLatin(transliteration)) {
        errors.push(`[row ${row}] transliteration must contain latin characters`);
      }
      if (FORBIDDEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(transliteration))) {
        errors.push(`[row ${row}] transliteration "${transliteration}" looks like placeholder content`);
      }
    }

    const language = word.language;
    if (!isLanguage(language)) {
      errors.push(`[row ${row}] Invalid language: ${String(word.language)}`);
    }

    const key = `${language}::${word.originalScript}::${word.english}`;
    if (keys.has(key)) {
      errors.push(`[row ${row}] Duplicate lexical key ${key}`);
    } else {
      keys.add(key);
    }

    const frequency = word.frequencyScore;
    if (frequency < 0 || frequency > 1) {
      errors.push(`[row ${row}] frequencyScore must be between 0 and 1`);
    }

    validateTagLikeCollection(word.tags, "tags", row, errors);
    validateTagLikeCollection(word.clusters, "clusters", row, errors);

    const transliterationKey = `${language}::${normalize(word.transliteration)}`;
    const englishSet = transliterationToEnglish.get(transliterationKey) ?? new Set<string>();
    englishSet.add(normalize(word.english));
    transliterationToEnglish.set(transliterationKey, englishSet);

    const lexicalConsistencyKey = `${language}::${normalize(word.transliteration)}::${normalize(word.english)}`;
    const normalizedTags = [...new Set((word.tags ?? []).map((v) => normalize(v)))].sort();
    const normalizedClusters = [...new Set((word.clusters ?? []).map((v) => normalize(v)))].sort();
    const existingLexicalMetadata = lexicalMetadata.get(lexicalConsistencyKey);
    if (!existingLexicalMetadata) {
      lexicalMetadata.set(lexicalConsistencyKey, { tags: normalizedTags, clusters: normalizedClusters });
    } else {
      const tagsMatch = JSON.stringify(existingLexicalMetadata.tags) === JSON.stringify(normalizedTags);
      const clustersMatch = JSON.stringify(existingLexicalMetadata.clusters) === JSON.stringify(normalizedClusters);
      if (!tagsMatch || !clustersMatch) {
        errors.push(
          `[row ${row}] inconsistent tags/clusters for lexical entry ${lexicalConsistencyKey}`,
        );
      }
    }

    const examples = word.examples ?? [];
    if (examples.length === 0) {
      warnings.push(`[row ${row}] No examples provided`);
    }

    examples.forEach((example, exampleIdx) => {
      const position = `${row}.${exampleIdx + 1}`;
      if (!example.originalScript || !example.pronunciation || !example.english || !example.contextTag) {
        errors.push(`[example ${position}] Missing originalScript/pronunciation/english/contextTag`);
      }
      const exampleLanguage = example.language;
      if (!isLanguage(exampleLanguage)) {
        errors.push(`[example ${position}] Invalid language: ${String(example.language)}`);
      }
      if (!Number.isInteger(example.difficulty) || example.difficulty < 1) {
        errors.push(`[example ${position}] difficulty must be a positive integer`);
      }
      if (exampleLanguage && language && exampleLanguage !== language) {
        errors.push(`[example ${position}] language must match word language`);
      }

      const pronunciation = example.pronunciation?.trim() ?? "";
      if (pronunciation.length < 3) {
        errors.push(`[example ${position}] pronunciation is too short`);
      }
      if (!hasLatin(pronunciation)) {
        errors.push(`[example ${position}] pronunciation must contain latin characters`);
      }
      if (FORBIDDEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(pronunciation))) {
        errors.push(`[example ${position}] pronunciation "${pronunciation}" looks like placeholder content`);
      }

      const contextTag = example.contextTag?.trim() ?? "";
      if (!TOKEN_PATTERN.test(contextTag)) {
        errors.push(`[example ${position}] contextTag must be lowercase kebab-case`);
      }
    });
  });

  transliterationToEnglish.forEach((englishValues, transliterationKey) => {
    if (englishValues.size > 1) {
      errors.push(
        `[collision] transliteration ${transliterationKey} maps to multiple meanings: ${Array.from(englishValues).join(", ")}`,
      );
    }
  });

  console.log(`Validation summary`);
  console.log(`Rows: ${words.length}`);
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
