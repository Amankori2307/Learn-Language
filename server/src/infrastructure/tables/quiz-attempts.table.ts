import { boolean, index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";
import { users } from "./users.table";
import { words } from "./words.table";

export const quizAttempts = pgTable(
  DbTableNameEnum.QUIZ_ATTEMPTS,
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
  (table) => ({
    userCreatedIdx: index("quiz_attempts_user_created_idx").on(table.userId, table.createdAt),
  }),
);

export type QuizAttempt = typeof quizAttempts.$inferSelect;
