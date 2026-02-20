import fs from "fs/promises";
import path from "path";

type ContentExample = {
  telugu: string;
  english: string;
  pronunciation?: string;
  contextTag?: string;
  difficulty?: number;
};

type ContentWord = {
  telugu: string;
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
};

function parseListField(value?: string): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  out.push(current.trim());
  return out;
}

function parseCsv(raw: string): ContentWord[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? ""]));

    const examples: ContentExample[] = row.exampleTelugu && row.exampleEnglish
      ? [{
          telugu: row.exampleTelugu,
          english: row.exampleEnglish,
          contextTag: row.contextTag || "general",
          difficulty: row.exampleDifficulty ? Number(row.exampleDifficulty) : 1,
        }]
      : [];

    return {
      telugu: row.telugu,
      transliteration: row.transliteration,
      english: row.english,
      partOfSpeech: row.partOfSpeech,
      difficulty: row.difficulty ? Number(row.difficulty) : 1,
      difficultyLevel: (row.difficultyLevel as ContentWord["difficultyLevel"]) || "beginner",
      frequencyScore: row.frequencyScore ? Number(row.frequencyScore) : 0.5,
      cefrLevel: row.cefrLevel || undefined,
      tags: parseListField(row.tags),
      clusters: parseListField(row.clusters),
      examples,
    };
  });
}

function isLikelyTransliteration(input: string): boolean {
  return /^[a-zA-Z\-\s'()]+$/.test(input);
}

async function main() {
  const inputPath = process.argv[2] ?? "assets/processed/seed.json";
  const fullPath = path.resolve(process.cwd(), inputPath);

  const raw = await fs.readFile(fullPath, "utf-8");
  const items: ContentWord[] = inputPath.endsWith(".csv") ? parseCsv(raw) : JSON.parse(raw);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No content rows found in ${inputPath}`);
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const keySeen = new Set<string>();

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const row = i + 1;

    if (!item.telugu || !item.english || !item.transliteration || !item.partOfSpeech) {
      errors.push(`[row ${row}] Missing one or more required fields`);
      continue;
    }

    const key = `${item.telugu}::${item.english}`;
    if (keySeen.has(key)) {
      errors.push(`[row ${row}] Duplicate lexical key ${key}`);
    } else {
      keySeen.add(key);
    }

    if (!isLikelyTransliteration(item.transliteration)) {
      warnings.push(`[row ${row}] Transliteration contains unexpected characters: ${item.transliteration}`);
    }

    const freq = item.frequencyScore ?? 0.5;
    if (freq < 0 || freq > 1) {
      errors.push(`[row ${row}] frequencyScore must be between 0 and 1`);
    }

    if (!item.examples || item.examples.length === 0) {
      warnings.push(`[row ${row}] Missing example sentence`);
    } else {
      for (const [exampleIndex, example] of item.examples.entries()) {
        if (!example.telugu || !example.english) {
          errors.push(`[row ${row}] Example ${exampleIndex + 1} must include telugu and english`);
        }
        if (!example.pronunciation || example.pronunciation.trim().length === 0) {
          errors.push(`[row ${row}] Example ${exampleIndex + 1} must include pronunciation text`);
        }
      }
    }
  }

  console.log(`Validation summary for ${inputPath}`);
  console.log(`Rows: ${items.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error("Errors:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
