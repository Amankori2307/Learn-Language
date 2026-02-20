import fs from "fs/promises";
import path from "path";
import { DEFAULT_LANGUAGE, LanguageEnum } from "../shared/domain/enums";

type ContentExample = {
  language?: LanguageEnum;
  originalScript: string;
  pronunciation: string;
  english: string;
  contextTag?: string;
  difficulty?: number;
};

type ContentWord = {
  language?: LanguageEnum;
  originalScript?: string;
  originalScript: string;
  transliteration: string;
  english: string;
  partOfSpeech: string;
  difficulty?: number;
  difficultyLevel?: "beginner" | "easy" | "medium" | "hard";
  frequencyScore?: number;
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

  words.forEach((word, idx) => {
    const row = idx + 1;
    if (!word.originalScript || !word.english || !word.transliteration || !word.partOfSpeech) {
      errors.push(`[row ${row}] Missing required lexical fields`);
      return;
    }
    if (word.originalScript !== undefined && !word.originalScript.trim()) {
      errors.push(`[row ${row}] originalScript cannot be empty`);
    }

    const language = word.language ?? DEFAULT_LANGUAGE;
    if (!isLanguage(language)) {
      errors.push(`[row ${row}] Invalid language: ${String(word.language)}`);
    }

    const key = `${language}::${word.originalScript}::${word.english}`;
    if (keys.has(key)) {
      errors.push(`[row ${row}] Duplicate lexical key ${key}`);
    } else {
      keys.add(key);
    }

    const frequency = word.frequencyScore ?? 0.5;
    if (frequency < 0 || frequency > 1) {
      errors.push(`[row ${row}] frequencyScore must be between 0 and 1`);
    }

    const examples = word.examples ?? [];
    if (examples.length === 0) {
      warnings.push(`[row ${row}] No examples provided`);
    }

    examples.forEach((example, exampleIdx) => {
      const position = `${row}.${exampleIdx + 1}`;
      if (!example.originalScript || !example.pronunciation || !example.english) {
        errors.push(`[example ${position}] Missing originalScript/pronunciation/english`);
      }
      const exampleLanguage = example.language ?? language;
      if (!isLanguage(exampleLanguage)) {
        errors.push(`[example ${position}] Invalid language: ${String(example.language)}`);
      }
    });
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
