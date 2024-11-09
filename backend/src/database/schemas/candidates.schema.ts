import {
  bigint,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

import { contests } from './contests.schema';

export const candidates = mysqlTable('candidates', {
  id: int().primaryKey().autoincrement(),
  candidateId: int().unique(),
  voteId: int()
    .notNull()
    .references(() => contests.voteId, { onDelete: 'cascade' }),
  blockTimestamp: timestamp({ mode: 'date' }),
  blockNumber: bigint({ mode: 'bigint', unsigned: true }),
  transactionHash: varchar({ length: 100 }),
  createdAt: timestamp({ mode: 'date' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: timestamp({ mode: 'date' })
    .notNull()
    .$default(() => new Date()),
});

export type Candidate = typeof candidates.$inferSelect;
