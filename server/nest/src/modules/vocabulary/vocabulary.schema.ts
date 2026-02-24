import { boolean, index, integer, jsonb, pgTable, primaryKey, real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import {
  LanguageEnum,
  PartOfSpeechEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
  VocabularyTagEnum,
} from "@shared/domain/enums";

export const words = pgTable(
  "words",
  {
    id: serial("id").primaryKey(),
    language: text("language").$type<LanguageEnum>().notNull(),
    originalScript: text("original_script").notNull(),
    transliteration: text("transliteration").notNull(),
    english: text("english").notNull(),
    partOfSpeech: text("part_of_speech").$type<PartOfSpeechEnum>().notNull(),
    difficulty: integer("difficulty").notNull(),
    difficultyLevel: text("difficulty_level").notNull(),
    frequencyScore: real("frequency_score").notNull(),
    cefrLevel: text("cefr_level"),
    audioUrl: text("audio_url"),
    imageUrl: text("image_url"),
    exampleSentences: jsonb("example_sentences").$type<string[]>().default([]),
    tags: jsonb("tags").$type<VocabularyTagEnum[]>().default([]),
    reviewStatus: text("review_status").$type<ReviewStatusEnum>().default(ReviewStatusEnum.APPROVED).notNull(),
    submittedBy: varchar("submitted_by"),
    submittedAt: timestamp("submitted_at").defaultNow(),
    reviewedBy: varchar("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    reviewerConfidenceScore: integer("reviewer_confidence_score"),
    requiresSecondaryReview: boolean("requires_secondary_review").default(false).notNull(),
    disagreementStatus: text("disagreement_status")
      .$type<ReviewDisagreementStatusEnum>()
      .default(ReviewDisagreementStatusEnum.NONE)
      .notNull(),
    sourceUrl: text("source_url"),
    sourceCapturedAt: timestamp("source_captured_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    reviewStatusIdx: index("words_review_status_idx").on(t.reviewStatus),
  }),
);

export const clusters = pgTable("clusters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
});

export const wordClusters = pgTable(
  "word_clusters",
  {
    wordId: integer("word_id").references(() => words.id).notNull(),
    clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.wordId, t.clusterId] }),
    clusterWordIdx: index("word_clusters_cluster_word_idx").on(t.clusterId, t.wordId),
  }),
);

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  language: text("language").$type<LanguageEnum>().notNull(),
  originalScript: text("original_script").notNull(),
  english: text("english").notNull(),
  difficulty: integer("difficulty").notNull(),
});

export const wordExamples = pgTable("word_examples", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  language: text("language").$type<LanguageEnum>().notNull(),
  originalScript: text("source_sentence").notNull(),
  pronunciation: text("pronunciation").notNull(),
  englishSentence: text("english_sentence").notNull(),
  contextTag: text("context_tag").notNull(),
  difficulty: integer("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Word = typeof words.$inferSelect;
export type Cluster = typeof clusters.$inferSelect;
