import { type Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: process.env.DB_TYPE as Config['dialect'],
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
  },
  schema: './src/database/schemas',
  out: './src/database/migrations',
});
