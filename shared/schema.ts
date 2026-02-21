import { pgTable, text, varchar, timestamp, serial, integer, boolean, jsonb, real, primaryKey, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  LanguageEnum,
  QuizQuestionTypeEnum,
  ReviewDisagreementStatusEnum,
  ReviewStatusEnum,
  UserTypeEnum,
} from "./domain/enums";

// === AUTH MODELS (Inlined for simplicity and consistency with PRD) ===

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").$type<UserTypeEnum>().default(UserTypeEnum.LEARNER).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === LEARNING MODELS ===

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  language: text("language").$type<LanguageEnum>().notNull(),
  originalScript: text("original_script").notNull(),
  transliteration: text("transliteration").notNull(),
  english: text("english").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  difficulty: integer("difficulty").notNull(),
  difficultyLevel: text("difficulty_level").notNull(),
  frequencyScore: real("frequency_score").notNull(),
  cefrLevel: text("cefr_level"),
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  exampleSentences: jsonb("example_sentences").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
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
}, (t) => ({
  reviewStatusIdx: index("words_review_status_idx").on(t.reviewStatus),
}));

export const clusters = pgTable("clusters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // semantic, grammar, confusion, functional
  description: text("description"),
});

export const wordClusters = pgTable("word_clusters", {
  wordId: integer("word_id").references(() => words.id).notNull(),
  clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.wordId, t.clusterId] }),
  clusterWordIdx: index("word_clusters_cluster_word_idx").on(t.clusterId, t.wordId),
}));

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

export const userWordProgress = pgTable("user_word_progress", {
  userId: varchar("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  correctStreak: integer("correct_streak").default(0),
  wrongCount: integer("wrong_count").default(0),
  easeFactor: real("ease_factor").default(2.5),
  interval: integer("interval").default(1),
  srsConfigVersion: text("srs_config_version").default("v1").notNull(),
  sourceToTargetStrength: real("source_to_target_strength").default(0.5).notNull(),
  targetToSourceStrength: real("target_to_source_strength").default(0.5).notNull(),
  lastSeen: timestamp("last_seen").defaultNow(),
  nextReview: timestamp("next_review").defaultNow(),
  masteryLevel: integer("mastery_level").default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.wordId] }),
  userReviewIdx: index("user_word_progress_user_review_idx").on(t.userId, t.nextReview),
}));

export const srsConfigs = pgTable("srs_configs", {
  version: text("version").primaryKey(),
  config: jsonb("config").$type<{
    easeMin: number;
    easeMax: number;
    incorrectEasePenalty: number;
  }>().notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  questionType: text("question_type"),
  direction: text("direction"),
  responseTimeMs: integer("response_time_ms"),
  isCorrect: boolean("is_correct").notNull(),
  confidenceLevel: integer("confidence_level"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userCreatedIdx: index("quiz_attempts_user_created_idx").on(t.userId, t.createdAt),
}));

export const wordReviewEvents = pgTable("word_review_events", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  changedBy: varchar("changed_by").references(() => users.id).notNull(),
  notes: text("notes"),
  sourceUrl: text("source_url"),
  sourceCapturedAt: timestamp("source_captured_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  wordCreatedIdx: index("word_review_events_word_created_idx").on(t.wordId, t.createdAt),
}));

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userWordProgress),
  attempts: many(quizAttempts),
  srsConfigs: many(srsConfigs),
}));

export const wordsRelations = relations(words, ({ many }) => ({
  clusters: many(wordClusters),
  progress: many(userWordProgress),
  attempts: many(quizAttempts),
  examples: many(wordExamples),
  reviewEvents: many(wordReviewEvents),
}));

export const clustersRelations = relations(clusters, ({ many }) => ({
  words: many(wordClusters),
}));

export const wordClustersRelations = relations(wordClusters, ({ one }) => ({
  word: one(words, { fields: [wordClusters.wordId], references: [words.id] }),
  cluster: one(clusters, { fields: [wordClusters.clusterId], references: [clusters.id] }),
}));

export const userWordProgressRelations = relations(userWordProgress, ({ one }) => ({
  user: one(users, { fields: [userWordProgress.userId], references: [users.id] }),
  word: one(words, { fields: [userWordProgress.wordId], references: [words.id] }),
}));

export const srsConfigsRelations = relations(srsConfigs, ({ one }) => ({
  creator: one(users, { fields: [srsConfigs.createdBy], references: [users.id] }),
}));

export const wordExamplesRelations = relations(wordExamples, ({ one }) => ({
  word: one(words, { fields: [wordExamples.wordId], references: [words.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  word: one(words, { fields: [quizAttempts.wordId], references: [words.id] }),
}));

export const wordReviewEventsRelations = relations(wordReviewEvents, ({ one }) => ({
  word: one(words, { fields: [wordReviewEvents.wordId], references: [words.id] }),
  reviewer: one(users, { fields: [wordReviewEvents.changedBy], references: [users.id] }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWordSchema = createInsertSchema(words).omit({ id: true, createdAt: true });
export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true });
export const insertUserWordProgressSchema = createInsertSchema(userWordProgress);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Word = typeof words.$inferSelect;
export type Cluster = typeof clusters.$inferSelect;
export type UserWordProgress = typeof userWordProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type WordReviewEvent = typeof wordReviewEvents.$inferSelect;
export type SrsConfig = typeof srsConfigs.$inferSelect;

export type CreateWordRequest = z.infer<typeof insertWordSchema>;
export type CreateClusterRequest = z.infer<typeof insertClusterSchema>;

export type QuizQuestion = {
  wordId: number;
  type: QuizQuestionTypeEnum;
  questionText: string;
  audioUrl?: string | null;
  options: {
    id: number;
    text: string;
  }[];
  correctAnswerId: number;
};
