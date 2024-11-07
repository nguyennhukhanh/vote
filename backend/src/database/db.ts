import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { dbConfig } from '../configs/database.config';

const connection = mysql.createPool({
  host: dbConfig.host as string,
  port: dbConfig.port,
  user: dbConfig.username,
  database: dbConfig.database as string,
  password: dbConfig.password,
  debug: dbConfig.debug,
  timezone: '+00:00', // Set timezone to UTC
});

export const db = drizzle({
  client: connection,
  mode: 'planetscale',
  casing: 'camelCase',
});
