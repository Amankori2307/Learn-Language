import { index, integer, pgTable, primaryKey, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";
import { users } from "./users.table";
import { words } from "./words.table";

export const userWordProgress = pgTable(
  DbTableNameEnum.USER_WORD_PROGRESS,
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
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.wordId] }),
    userReviewIdx: index("user_word_progress_user_review_idx").on(table.userId, table.nextReview),
  }),
);

export type UserWordProgress = typeof userWordProgress.$inferSelect;
