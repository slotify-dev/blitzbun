import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  dialect: 'postgresql',
  out: './database/migrations',
  extensionsFilters: ['postgis'],
  schema: [path.join(__dirname, 'src/modules/**/models/*.ts'), path.join(__dirname, 'packages/**/src/models/*.ts')],
  dbCredentials: {
    ssl: false,
    port: Number(process.env['POSTGRES_PORT']),
    host: process.env['POSTGRES_HOST'] as string,
    user: process.env['POSTGRES_USER'] as string,
    database: process.env['POSTGRES_DATABASE'] as string,
    password: process.env['POSTGRES_PASSWORD'] as string,
  },
});
