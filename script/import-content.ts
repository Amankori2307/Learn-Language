import fs from "fs/promises";
import path from "path";
import { and, eq } from "drizzle-orm";
import { db } from "../server/db";
import { clusters, wordClusters, wordExamples, words } from "../shared/schema";

type ContentExample = {
  telugu: string;
  english: string;
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

function assertWord(word: ContentWord, idx: number) {
  const missing: string[] = [];

  if (!word.telugu) missing.push("telugu");
  if (!word.english) missing.push("english");
  if (!word.transliteration) missing.push("transliteration");
  if (!word.partOfSpeech) missing.push("partOfSpeech");

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
  const [existing] = await db
    .select()
    .from(words)
    .where(and(eq(words.telugu, input.telugu), eq(words.english, input.english)));

  if (existing) {
    const [updated] = await db
      .update(words)
      .set({
        transliteration: input.transliteration,
        partOfSpeech: input.partOfSpeech,
        difficulty: input.difficulty ?? 1,
        difficultyLevel: input.difficultyLevel ?? "beginner",
        frequencyScore: input.frequencyScore ?? 0.5,
        cefrLevel: input.cefrLevel ?? null,
        tags: input.tags ?? [],
      })
      .where(eq(words.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(words)
    .values({
      telugu: input.telugu,
      english: input.english,
      transliteration: input.transliteration,
      partOfSpeech: input.partOfSpeech,
      difficulty: input.difficulty ?? 1,
      difficultyLevel: input.difficultyLevel ?? "beginner",
      frequencyScore: input.frequencyScore ?? 0.5,
      cefrLevel: input.cefrLevel ?? null,
      tags: input.tags ?? [],
      exampleSentences: (input.examples ?? []).map((e) => e.telugu),
    })
    .returning();

  return created;
}

async function ensureWordExample(wordId: number, example: ContentExample) {
  const [existing] = await db
    .select()
    .from(wordExamples)
    .where(and(eq(wordExamples.wordId, wordId), eq(wordExamples.teluguSentence, example.telugu)));

  if (existing) {
    return;
  }

  await db.insert(wordExamples).values({
    wordId,
    teluguSentence: example.telugu,
    englishSentence: example.english,
    contextTag: example.contextTag ?? "general",
    difficulty: example.difficulty ?? 1,
  });
}

async function linkWordToCluster(wordId: number, clusterId: number) {
  await db.insert(wordClusters).values({ wordId, clusterId }).onConflictDoNothing();
}

async function main() {
  const inputPath = process.argv[2] ?? "content/seed/words.sample.json";
  const fullPath = path.resolve(process.cwd(), inputPath);

  const raw = await fs.readFile(fullPath, "utf-8");
  const items: ContentWord[] = inputPath.endsWith(".csv") ? parseCsv(raw) : JSON.parse(raw);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No content rows found in ${inputPath}`);
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
      await ensureWordExample(word.id, example);
      exampleCount += 1;
    }
  }

  console.log(`Imported ${wordCount} words, ${clusterLinks} cluster links, ${exampleCount} examples from ${inputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
