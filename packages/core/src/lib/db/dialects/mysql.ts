import type { DBConfig, DBSchema, DrizzleClient } from '@blitzbun/contracts';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';
import type { Pool } from 'mysql2/promise';

export async function createMySQLClient<TSchema extends DBSchema>(
  config: DBConfig,
  schema: TSchema
): Promise<{
  client: Pool;
  drizzle: DrizzleClient<TSchema>;
}> {
  const rawPool = mysql.createPool(config); // mysql2 (not mysql2/promise)
  const promisePool = rawPool.promise(); // get promise wrapper
  const db = drizzle<TSchema>(rawPool, { schema, mode: 'default' }); // 🛠 mode is required
  return { drizzle: db, client: promisePool };
}
