import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
  'users',
  {
    id: int().primaryKey().autoincrement(),
    email: varchar({ length: 100 }).unique(),
    fullName: varchar({ length: 100 }),
    walletAddress: varchar({ length: 100 }).unique(),
    nonce: int().default(0),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp({ mode: 'date' })
      .notNull()
      .$default(() => new Date()),
    updatedAt: timestamp({ mode: 'date' })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex('emailIdx').on(table.email),
    };
  },
);

export type User = typeof users.$inferSelect;
