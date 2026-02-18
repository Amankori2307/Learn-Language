import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth"; // Import users from auth module

// Re-export users for use in other files
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  telugu: text("telugu").notNull(),
  transliteration: text("transliteration").notNull(),
  english: text("english").notNull(),
  partOfSpeech: text("part_of_speech").notNull(), // noun, verb, pronoun, etc.
  difficulty: integer("difficulty").default(1),
  audioUrl: text("audio_url"),
  exampleSentences: jsonb("example_sentences").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

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
}));

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  telugu: text("telugu").notNull(),
  english: text("english").notNull(),
  difficulty: integer("difficulty").default(1),
});

export const userWordProgress = pgTable("user_word_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(), // Using text because auth.ts uses varchar for ID
  wordId: integer("word_id").references(() => words.id).notNull(),
  correctStreak: integer("correct_streak").default(0),
  wrongCount: integer("wrong_count").default(0),
  easeFactor: real("ease_factor").default(2.5),
  interval: integer("interval").default(0), // Days until next review
  lastSeen: timestamp("last_seen").defaultNow(),
  nextReview: timestamp("next_review").defaultNow(),
  masteryLevel: integer("mastery_level").default(0), // 0=New, 1=Learning, 2=Familiar, 3=Strong, 4=Mastered
}, (t) => ({
  // Composite unique constraint to ensure one progress record per user/word
  uniqueUserWord: {
    columns: [t.userId, t.wordId],
  }
}));

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  confidenceLevel: integer("confidence_level"), // 1=Guess, 2=Somewhat Sure, 3=Very Sure
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const wordsRelations = relations(words, ({ many }) => ({
  clusters: many(wordClusters),
  progress: many(userWordProgress),
  attempts: many(quizAttempts),
}));

export const clustersRelations = relations(clusters, ({ many }) => ({
  words: many(wordClusters),
}));

export const wordClustersRelations = relations(wordClusters, ({ one }) => ({
  word: one(words, {
    fields: [wordClusters.wordId],
    references: [words.id],
  }),
  cluster: one(clusters, {
    fields: [wordClusters.clusterId],
    references: [clusters.id],
  }),
}));

export const userWordProgressRelations = relations(userWordProgress, ({ one }) => ({
  user: one(users, {
    fields: [userWordProgress.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [userWordProgress.wordId],
    references: [words.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [quizAttempts.wordId],
    references: [words.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertWordSchema = createInsertSchema(words).omit({ id: true, createdAt: true });
export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true });
export const insertUserWordProgressSchema = createInsertSchema(userWordProgress).omit({ id: true, lastSeen: true, nextReview: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Word = typeof words.$inferSelect;
export type Cluster = typeof clusters.$inferSelect;
export type UserWordProgress = typeof userWordProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

// Request types
export type CreateWordRequest = z.infer<typeof insertWordSchema>;
export type CreateClusterRequest = z.infer<typeof insertClusterSchema>;

// Quiz types
export type QuizQuestion = {
  wordId: number;
  type: 'telugu_to_english' | 'english_to_telugu' | 'audio';
  questionText: string;
  audioUrl?: string | null;
  options: {
    id: number;
    text: string;
  }[];
  correctAnswerId: number; // Only for backend validation or debugging, usually hidden from frontend until answer
};

export type SubmitAnswerRequest = {
  wordId: number;
  selectedOptionId: number; // ID of the word chosen as option (or index)
  confidenceLevel: 1 | 2 | 3; // 1=Guess, 2=Somewhat, 3=Very Sure
};

export type SubmitAnswerResponse = {
  isCorrect: boolean;
  correctAnswer: Word;
  progressUpdate: {
    streak: number;
    masteryLevel: number;
    nextReview: string; // ISO date
  };
};

export type DashboardStats = {
  totalWords: number;
  mastered: number;
  learning: number;
  weak: number; // Words with high wrong count or overdue
  streak: number;
  xp: number; // Calculated based on correct answers
};
