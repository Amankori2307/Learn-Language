import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { QuizQuestionTypeEnum } from "@shared/domain/enums";
import { users, sessions } from "../modules/auth/auth.schema";
import { words, clusters, wordClusters, sentences, wordExamples } from "../modules/vocabulary/vocabulary.schema";
import { userWordProgress, srsConfigs, quizAttempts } from "../modules/quiz/quiz.schema";
import { wordReviewEvents } from "../modules/review/review.schema";

export { users, sessions, words, clusters, wordClusters, sentences, wordExamples, userWordProgress, srsConfigs, quizAttempts, wordReviewEvents };

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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWordSchema = createInsertSchema(words).omit({ id: true, createdAt: true });
export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true });
export const insertUserWordProgressSchema = createInsertSchema(userWordProgress);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, createdAt: true });

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

export { sql };
