import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { v4 as uuidv4 } from 'uuid';

import { admins } from './admins.schema';

export const adminSessions = mysqlTable('admin_sessions', {
  id: varchar({ length: 36 })
    .primaryKey()
    .$default(() => uuidv4()),
  expiresAt: timestamp({ mode: 'date' }).notNull(),
  adminId: int()
    .notNull()
    .references(() => admins.id, { onDelete: 'cascade' }),
  createdAt: timestamp({ mode: 'date' })
    .notNull()
    .$default(() => new Date()),
  updatedAt: timestamp({ mode: 'date' })
    .notNull()
    .$default(() => new Date()),
});

export type AdminSession = typeof adminSessions.$inferSelect;
