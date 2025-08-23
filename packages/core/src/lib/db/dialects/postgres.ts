import type { DBConfig, DBSchema, DrizzleClient } from '@blitzbun/contracts';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export async function createPostgresClient<TSchema extends DBSchema>(
  config: DBConfig,
  schema: TSchema
): Promise<{
  client: Pool;
  drizzle: DrizzleClient<TSchema>;
}> {
  const pool = new Pool(config);
  const db = drizzle<TSchema>(pool, { schema });
  return { drizzle: db, client: pool };
}
