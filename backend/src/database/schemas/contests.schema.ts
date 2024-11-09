import {
  type AnyMySqlColumn,
  bigint,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

import { admins } from './admins.schema';

export const contests = mysqlTable('contests', {
  id: int().primaryKey().autoincrement(),
  voteId: int().unique(),
  name: varchar({ length: 255 }).unique(),
  createdBy: int('createdBy').references((): AnyMySqlColumn => admins.id),
  startTime: timestamp({ mode: 'date' }).notNull(),
  endTime: timestamp({ mode: 'date' }).notNull(),
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

export type Contest = typeof contests.$inferSelect;
