import {
  type AnyMySqlColumn,
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const admins = mysqlTable(
  'admins',
  {
    id: int().primaryKey().autoincrement(),
    email: varchar({ length: 100 }).unique(),
    fullName: varchar({ length: 100 }),
    password: text(),
    isActive: boolean().notNull().default(true),
    role: mysqlEnum('role', ['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
    createdBy: int('createdBy').references((): AnyMySqlColumn => admins.id),
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

export type Admin = typeof admins.$inferSelect;
