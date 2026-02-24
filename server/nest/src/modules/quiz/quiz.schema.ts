import { boolean, index, integer, pgTable, primaryKey, real, serial, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { users } from "../auth/auth.schema";
import { words } from "../vocabulary/vocabulary.schema";

export const userWordProgress = pgTable(
  "user_word_progress",
  {
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
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.wordId] }),
    userReviewIdx: index("user_word_progress_user_review_idx").on(t.userId, t.nextReview),
  }),
);

export const srsConfigs = pgTable("srs_configs", {
  version: text("version").primaryKey(),
  config: jsonb("config")
    .$type<{
      easeMin: number;
      easeMax: number;
      incorrectEasePenalty: number;
    }>()
    .notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    wordId: integer("word_id").references(() => words.id).notNull(),
    questionType: text("question_type"),
    direction: text("direction"),
    responseTimeMs: integer("response_time_ms"),
    isCorrect: boolean("is_correct").notNull(),
    confidenceLevel: integer("confidence_level"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userCreatedIdx: index("quiz_attempts_user_created_idx").on(t.userId, t.createdAt),
  }),
);

export type UserWordProgress = typeof userWordProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type SrsConfig = typeof srsConfigs.$inferSelect;
