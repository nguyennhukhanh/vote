import { bigint, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const latestBlocks = mysqlTable('latest_blocks', {
  key: varchar({ length: 100 }).primaryKey().notNull().unique(),
  blockNumber: bigint({ mode: 'bigint', unsigned: true }).notNull(),
  createdAt: timestamp({ mode: 'date' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: timestamp({ mode: 'date' })
    .notNull()
    .$default(() => new Date()),
});

export type LatestBlock = typeof latestBlocks.$inferSelect;
