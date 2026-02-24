import { boolean, index, integer, jsonb, pgTable, real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { LanguageEnum, PartOfSpeechEnum, ReviewDisagreementStatusEnum, ReviewStatusEnum, VocabularyTagEnum } from "@shared/domain/enums";
import { DbTableNameEnum } from "../database.enums";

export const words = pgTable(
  DbTableNameEnum.WORDS,
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
  (table) => ({
    reviewStatusIdx: index("words_review_status_idx").on(table.reviewStatus),
  }),
);

export type Word = typeof words.$inferSelect;
