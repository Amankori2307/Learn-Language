import fs from "fs/promises";
import path from "path";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../server/src/infrastructure/db";
import { LanguageEnum, PartOfSpeechEnum, VocabularyTagEnum } from "../shared/domain/enums";
import { getClusterDescription } from "../shared/domain/cluster-metadata";
import { isPartOfSpeech } from "../shared/domain/part-of-speech";
import { isVocabularyTag } from "../shared/domain/vocabulary-tags";
import {
  clusters,
  quizAttempts,
  userWordProgress,
  wordClusters,
  wordExamples,
  wordReviewEvents,
  words,
} from "../server/src/infrastructure/schema";

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
  tags?: VocabularyTagEnum[];
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

function assertLanguage(value: string): LanguageEnum {
  if (!Object.values(LanguageEnum).includes(value as LanguageEnum)) {
    throw new Error(`Invalid language value: ${value}`);
  }
  return value as LanguageEnum;
}

function assertPartOfSpeech(value: string): PartOfSpeechEnum {
  if (!isPartOfSpeech(value)) {
    throw new Error(`Invalid partOfSpeech value: ${value}`);
  }
  return value;
}

function assertVocabularyTags(values: string[] | undefined): VocabularyTagEnum[] {
  if (!values || values.length === 0) {
    return [];
  }

  return values.map((value) => {
    if (!isVocabularyTag(value)) {
      throw new Error(`Invalid tag value: ${value}`);
    }
    return value;
  });
}

function assertWord(word: ContentWord, idx: number) {
  const missing: string[] = [];
  if (!word.key) missing.push("key");
  if (!word.language) missing.push("language");
  if (!word.originalScript) missing.push("originalScript");
  if (!word.english) missing.push("english");
  if (!word.transliteration) missing.push("transliteration");
  if (!word.partOfSpeech) missing.push("partOfSpeech");
  if (!word.difficulty) missing.push("difficulty");
  if (!word.difficultyLevel) missing.push("difficultyLevel");
  if (word.frequencyScore === undefined || word.frequencyScore === null) missing.push("frequencyScore");
  if (!word.tags || word.tags.length === 0) missing.push("tags");
  if (!word.clusters || word.clusters.length === 0) missing.push("clusters");
  if (missing.length > 0) {
    throw new Error(`Invalid word at row ${idx + 1}: missing ${missing.join(", ")}`);
  }
}

function assertSentence(sentence: ContentSentence, idx: number) {
  const missing: string[] = [];
  if (!sentence.language) missing.push("language");
  if (!sentence.originalScript) missing.push("originalScript");
  if (!sentence.pronunciation) missing.push("pronunciation");
  if (!sentence.english) missing.push("english");
  if (!sentence.contextTag) missing.push("contextTag");
  if (!sentence.wordRefs || sentence.wordRefs.length === 0) missing.push("wordRefs");
  if (missing.length > 0) {
    throw new Error(`Invalid sentence at row ${idx + 1}: missing ${missing.join(", ")}`);
  }
}

async function ensureCluster(name: string) {
  const [existing] = await db.select().from(clusters).where(eq(clusters.name, name));
  if (existing) return existing;

  const [created] = await db
    .insert(clusters)
    .values({
      name,
      type: "semantic",
      description: getClusterDescription(name),
    })
    .returning();

  return created;
}

async function upsertWord(input: ContentWord, exampleSentences: string[]) {
  const language = assertLanguage(input.language);
  const partOfSpeech = assertPartOfSpeech(input.partOfSpeech);
  const tags = assertVocabularyTags(input.tags);
  const originalScript = input.originalScript.trim();
  const reviewStatus =
    input.source?.reviewStatus ??
    (tags.includes(VocabularyTagEnum.NEEDS_REVIEW) ? "pending_review" : "approved");
  const [existing] = await db
    .select()
    .from(words)
    .where(
      and(
        eq(words.language, language),
        eq(words.originalScript, input.originalScript),
        eq(words.english, input.english),
      ),
    );

  if (existing) {
    const [updated] = await db
      .update(words)
      .set({
        language,
        originalScript,
        transliteration: input.transliteration,
        partOfSpeech,
        difficulty: input.difficulty,
        difficultyLevel: input.difficultyLevel,
        frequencyScore: input.frequencyScore,
        cefrLevel: input.cefrLevel ?? null,
        tags,
        reviewStatus,
        sourceUrl: input.source?.sourceUrl ?? null,
        sourceCapturedAt: input.source?.generatedAt ? new Date(input.source.generatedAt) : null,
        exampleSentences,
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
      partOfSpeech,
      difficulty: input.difficulty,
      difficultyLevel: input.difficultyLevel,
      frequencyScore: input.frequencyScore,
      cefrLevel: input.cefrLevel ?? null,
      tags,
      reviewStatus,
      sourceUrl: input.source?.sourceUrl ?? null,
      sourceCapturedAt: input.source?.generatedAt ? new Date(input.source.generatedAt) : null,
      exampleSentences,
    })
    .returning();
  return created;
}

async function ensureWordExample(wordId: number, sentence: ContentSentence) {
  const language = assertLanguage(sentence.language);
  const [existing] = await db
    .select()
    .from(wordExamples)
    .where(
      and(
        eq(wordExamples.wordId, wordId),
        eq(wordExamples.language, language),
        eq(wordExamples.originalScript, sentence.originalScript),
      ),
    );

  if (existing) {
    await db
      .update(wordExamples)
      .set({
        language,
        pronunciation: sentence.pronunciation,
        englishSentence: sentence.english,
        contextTag: sentence.contextTag,
        difficulty: sentence.difficulty,
      })
      .where(eq(wordExamples.id, existing.id));
    return;
  }

  await db.insert(wordExamples).values({
    wordId,
    language,
    originalScript: sentence.originalScript,
    pronunciation: sentence.pronunciation,
    englishSentence: sentence.english,
    contextTag: sentence.contextTag,
    difficulty: sentence.difficulty,
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
      sql`${words.originalScript} LIKE 'sample-word-%'
        OR ${words.english} LIKE 'word-%'
        OR ${words.transliteration} LIKE 'padam-%'`,
    );

  const ids = placeholderRows.map((row) => row.id);
  if (ids.length === 0) return 0;

  await db.delete(userWordProgress).where(inArray(userWordProgress.wordId, ids));
  await db.delete(quizAttempts).where(inArray(quizAttempts.wordId, ids));
  await db.delete(wordClusters).where(inArray(wordClusters.wordId, ids));
  await db.delete(wordExamples).where(inArray(wordExamples.wordId, ids));
  await db.delete(wordReviewEvents).where(inArray(wordReviewEvents.wordId, ids));
  await db.delete(words).where(inArray(words.id, ids));
  return ids.length;
}

async function main() {
  const wordsPath = process.argv[2] ?? "assets/processed/words.json";
  const sentencesPath = process.argv[3] ?? "assets/processed/sentences.json";
  const wordsRaw = await fs.readFile(path.resolve(process.cwd(), wordsPath), "utf-8");
  const sentencesRaw = await fs.readFile(path.resolve(process.cwd(), sentencesPath), "utf-8");
  const wordItems = JSON.parse(wordsRaw) as ContentWord[];
  const sentenceItems = JSON.parse(sentencesRaw) as ContentSentence[];

  if (!Array.isArray(wordItems) || wordItems.length === 0) {
    throw new Error(`No content rows found in ${wordsPath}`);
  }

  if (!Array.isArray(sentenceItems) || sentenceItems.length === 0) {
    throw new Error(`No content rows found in ${sentencesPath}`);
  }

  const shouldPurgePlaceholders =
    path.basename(wordsPath) === "words.json" && process.env.SKIP_PLACEHOLDER_PURGE !== "true";
  if (shouldPurgePlaceholders) {
    const removed = await purgeLegacyPlaceholderWords();
    if (removed > 0) {
      console.log(`Removed ${removed} legacy placeholder words before import.`);
    }
  }

  const sentencesByWordRef = new Map<string, ContentSentence[]>();
  for (let i = 0; i < sentenceItems.length; i += 1) {
    const sentence = sentenceItems[i];
    assertSentence(sentence, i);
    for (const wordRef of sentence.wordRefs) {
      const list = sentencesByWordRef.get(wordRef) ?? [];
      list.push(sentence);
      sentencesByWordRef.set(wordRef, list);
    }
  }

  let wordCount = 0;
  let clusterLinks = 0;
  let exampleCount = 0;

  const wordIdByKey = new Map<string, { id: number; language: LanguageEnum }>();

  for (let i = 0; i < wordItems.length; i += 1) {
    const item = wordItems[i];
    assertWord(item, i);
    const linkedSentences = sentencesByWordRef.get(item.key) ?? [];
    const exampleSentences = [...new Set(linkedSentences.map((sentence) => sentence.originalScript))];
    const word = await upsertWord(item, exampleSentences);
    wordCount += 1;
    wordIdByKey.set(item.key, { id: word.id, language: assertLanguage(item.language) });

    for (const clusterName of item.clusters ?? []) {
      const cluster = await ensureCluster(clusterName);
      await linkWordToCluster(word.id, cluster.id);
      clusterLinks += 1;
    }
  }

  for (const sentence of sentenceItems) {
    for (const wordRef of sentence.wordRefs) {
      const mappedWord = wordIdByKey.get(wordRef);
      if (!mappedWord) {
        throw new Error(`Sentence references unknown word key: ${wordRef}`);
      }
      if (mappedWord.language !== sentence.language) {
        throw new Error(`Language mismatch for wordRef ${wordRef}`);
      }
      await ensureWordExample(mappedWord.id, sentence);
      exampleCount += 1;
    }
  }

  console.log(
    `Imported ${wordCount} words, ${clusterLinks} cluster links, ${exampleCount} sentence-word examples from ${wordsPath} + ${sentencesPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
