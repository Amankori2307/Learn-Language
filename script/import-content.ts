import fs from "fs/promises";
import path from "path";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../server/db";
import { LanguageEnum } from "../shared/domain/enums";
import {
  clusters,
  quizAttempts,
  userWordProgress,
  wordClusters,
  wordExamples,
  wordReviewEvents,
  words,
} from "../shared/schema";

type ContentExample = {
  language: LanguageEnum;
  originalScript: string;
  english: string;
  pronunciation: string;
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

function assertLanguage(value: string): LanguageEnum {
  if (!Object.values(LanguageEnum).includes(value as LanguageEnum)) {
    throw new Error(`Invalid language value: ${value}`);
  }
  return value as LanguageEnum;
}

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

    const examples: ContentExample[] = row.exampleSourceText && row.exampleEnglish
      ? [{
          language: assertLanguage(row.language),
          originalScript: row.exampleSourceText,
          english: row.exampleEnglish,
          pronunciation: row.examplePronunciation,
          contextTag: row.contextTag,
          difficulty: Number(row.exampleDifficulty),
        }]
      : [];

    return {
      language: assertLanguage(row.language),
      originalScript: row.originalScript,
      transliteration: row.transliteration,
      english: row.english,
      partOfSpeech: row.partOfSpeech,
      difficulty: Number(row.difficulty),
      difficultyLevel: row.difficultyLevel as ContentWord["difficultyLevel"],
      frequencyScore: Number(row.frequencyScore),
      cefrLevel: row.cefrLevel || undefined,
      tags: parseListField(row.tags),
      clusters: parseListField(row.clusters),
      examples,
    };
  });
}

function assertWord(word: ContentWord, idx: number) {
  const missing: string[] = [];

  if (!word.language) missing.push("language");
  if (!word.originalScript) missing.push("originalScript");
  if (!word.english) missing.push("english");
  if (!word.transliteration) missing.push("transliteration");
  if (!word.partOfSpeech) missing.push("partOfSpeech");
  if (!word.difficulty) missing.push("difficulty");
  if (!word.difficultyLevel) missing.push("difficultyLevel");
  if (word.frequencyScore === undefined || word.frequencyScore === null) missing.push("frequencyScore");

  if (missing.length > 0) {
    throw new Error(`Invalid word at row ${idx + 1}: missing ${missing.join(", ")}`);
  }
}

async function ensureCluster(name: string) {
  const [existing] = await db.select().from(clusters).where(eq(clusters.name, name));

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(clusters)
    .values({
      name,
      type: "semantic",
      description: `${name} imported cluster`,
    })
    .returning();

  return created;
}

async function upsertWord(input: ContentWord) {
  const language = assertLanguage(input.language);
  const originalScript = input.originalScript.trim();
  const reviewStatus = input.source?.reviewStatus ?? ((input.tags ?? []).includes("needs-review") ? "pending_review" : "approved");
  const [existing] = await db
    .select()
    .from(words)
    .where(and(eq(words.language, language), eq(words.originalScript, input.originalScript), eq(words.english, input.english)));

  if (existing) {
    const [updated] = await db
      .update(words)
      .set({
        language,
        originalScript,
        transliteration: input.transliteration,
        partOfSpeech: input.partOfSpeech,
        difficulty: input.difficulty,
        difficultyLevel: input.difficultyLevel,
        frequencyScore: input.frequencyScore,
        cefrLevel: input.cefrLevel ?? null,
        tags: input.tags ?? [],
        reviewStatus,
        sourceUrl: input.source?.sourceUrl ?? null,
        sourceCapturedAt: input.source?.generatedAt ? new Date(input.source.generatedAt) : null,
      })
      .where(eq(words.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(words)
    .values({
      language,
      originalScript,
      english: input.english,
      transliteration: input.transliteration,
      partOfSpeech: input.partOfSpeech,
      difficulty: input.difficulty,
      difficultyLevel: input.difficultyLevel,
      frequencyScore: input.frequencyScore,
      cefrLevel: input.cefrLevel ?? null,
      tags: input.tags ?? [],
      reviewStatus,
      sourceUrl: input.source?.sourceUrl ?? null,
      sourceCapturedAt: input.source?.generatedAt ? new Date(input.source.generatedAt) : null,
      exampleSentences: (input.examples ?? []).map((e) => e.originalScript),
    })
    .returning();

  return created;
}

async function ensureWordExample(wordId: number, example: ContentExample) {
  const language = assertLanguage(example.language);
  const [existing] = await db
    .select()
    .from(wordExamples)
    .where(
      and(
        eq(wordExamples.wordId, wordId),
        eq(wordExamples.language, language),
        eq(wordExamples.originalScript, example.originalScript),
      ),
    );

  if (existing) {
    await db
      .update(wordExamples)
      .set({
        language,
        pronunciation: example.pronunciation,
        englishSentence: example.english,
        contextTag: example.contextTag,
        difficulty: example.difficulty,
      })
      .where(eq(wordExamples.id, existing.id));
    return;
  }

  await db.insert(wordExamples).values({
    wordId,
    language,
    originalScript: example.originalScript,
    pronunciation: example.pronunciation,
    englishSentence: example.english,
    contextTag: example.contextTag,
    difficulty: example.difficulty,
  });
}

async function linkWordToCluster(wordId: number, clusterId: number) {
  await db.insert(wordClusters).values({ wordId, clusterId }).onConflictDoNothing();
}

async function purgeLegacyPlaceholderWords() {
  const placeholderRows = await db
    .select({ id: words.id })
    .from(words)
    .where(
      sql`${words.originalScript} LIKE 'పదం%'
        OR ${words.english} LIKE 'word-%'
        OR ${words.transliteration} LIKE 'padam-%'`,
    );

  const ids = placeholderRows.map((row) => row.id);
  if (ids.length === 0) {
    return 0;
  }

  await db.delete(userWordProgress).where(inArray(userWordProgress.wordId, ids));
  await db.delete(quizAttempts).where(inArray(quizAttempts.wordId, ids));
  await db.delete(wordClusters).where(inArray(wordClusters.wordId, ids));
  await db.delete(wordExamples).where(inArray(wordExamples.wordId, ids));
  await db.delete(wordReviewEvents).where(inArray(wordReviewEvents.wordId, ids));
  await db.delete(words).where(inArray(words.id, ids));

  return ids.length;
}

async function main() {
  const inputPath = process.argv[2] ?? "assets/processed/seed.json";
  const fullPath = path.resolve(process.cwd(), inputPath);

  const raw = await fs.readFile(fullPath, "utf-8");
  const items: ContentWord[] = inputPath.endsWith(".csv") ? parseCsv(raw) : JSON.parse(raw);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No content rows found in ${inputPath}`);
  }

  const shouldPurgePlaceholders =
    path.basename(inputPath) === "seed.json" &&
    process.env.SKIP_PLACEHOLDER_PURGE !== "true";

  if (shouldPurgePlaceholders) {
    const removed = await purgeLegacyPlaceholderWords();
    if (removed > 0) {
      console.log(`Removed ${removed} legacy placeholder words before import.`);
    }
  }

  let wordCount = 0;
  let clusterLinks = 0;
  let exampleCount = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    assertWord(item, i);

    const word = await upsertWord(item);
    wordCount += 1;

    for (const clusterName of item.clusters ?? []) {
      const cluster = await ensureCluster(clusterName);
      await linkWordToCluster(word.id, cluster.id);
      clusterLinks += 1;
    }

    for (const example of item.examples ?? []) {
      const normalizedPronunciation = example.pronunciation?.trim();
      if (!normalizedPronunciation) {
        throw new Error(
          `Missing sentence pronunciation for word "${item.transliteration}" example "${example.originalScript}"`,
        );
      }
      await ensureWordExample(word.id, {
        ...example,
        language: example.language,
        pronunciation: normalizedPronunciation,
      });
      exampleCount += 1;
    }
  }

  console.log(`Imported ${wordCount} words, ${clusterLinks} cluster links, ${exampleCount} examples from ${inputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
