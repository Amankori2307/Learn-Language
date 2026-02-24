import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";
import { users } from "./users.table";
import { words } from "./words.table";

export const wordReviewEvents = pgTable(
  DbTableNameEnum.WORD_REVIEW_EVENTS,
  {
    id: serial("id").primaryKey(),
    wordId: integer("word_id").references(() => words.id).notNull(),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    changedBy: varchar("changed_by").references(() => users.id).notNull(),
    notes: text("notes"),
    sourceUrl: text("source_url"),
    sourceCapturedAt: timestamp("source_captured_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    wordCreatedIdx: index("word_review_events_word_created_idx").on(table.wordId, table.createdAt),
  }),
);

export type WordReviewEvent = typeof wordReviewEvents.$inferSelect;
