import { index, integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { DbTableNameEnum } from "../database.enums";
import { words } from "./words.table";
import { clusters } from "./clusters.table";

export const wordClusters = pgTable(
  DbTableNameEnum.WORD_CLUSTERS,
  {
    wordId: integer("word_id").references(() => words.id).notNull(),
    clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.wordId, table.clusterId] }),
    clusterWordIdx: index("word_clusters_cluster_word_idx").on(table.clusterId, table.wordId),
  }),
);
