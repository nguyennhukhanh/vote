import {
  bigint,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

import { candidates } from './candidates.schema';
import { contests } from './contests.schema';

export const votes = mysqlTable('votes', {
  id: int().primaryKey().autoincrement(),
  voteId: int()
    .notNull()
    .references(() => contests.voteId, { onDelete: 'cascade' }),
  candidateId: int()
    .notNull()
    .references(() => candidates.candidateId, { onDelete: 'cascade' }),
  voterAddress: varchar({ length: 100 }).notNull(),
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

export type Candidate = typeof votes.$inferSelect;
