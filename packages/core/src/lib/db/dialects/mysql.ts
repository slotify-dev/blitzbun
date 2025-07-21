import { drizzle } from 'drizzle-orm/mysql2';
import type { Pool } from 'mysql2';
import mysql from 'mysql2';
import type { DBConfig, DrizzleClient, EmptySchema } from '../../../types';

export async function createMySQLClient<TSchema extends Record<string, unknown> = EmptySchema>(config: DBConfig): Promise<DrizzleClient<TSchema>> {
  const pool: Pool = mysql.createPool(config);
  return drizzle<TSchema>({ client: pool });
}
