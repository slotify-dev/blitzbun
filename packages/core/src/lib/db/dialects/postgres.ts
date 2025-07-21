import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { DBConfig, DrizzleClient, EmptySchema } from '../../../types';

export async function createPostgresClient<TSchema extends Record<string, unknown> = EmptySchema>(config: DBConfig): Promise<DrizzleClient<TSchema>> {
  const pool = new Pool(config);
  return drizzle<TSchema>(pool);
}
