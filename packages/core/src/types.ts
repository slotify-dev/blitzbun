import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigServiceContract, EnvServiceContract, LoggerServiceContract } from './contracts';

export const DBClient = {
  MySQL: 'mysql',
  PostgreSQL: 'pg',
} as const;

export type EmptySchema = Record<string, never>;
export type DBClient = (typeof DBClient)[keyof typeof DBClient];
export type DrizzleClient<T extends Record<string, unknown>> = MySql2Database<T> | NodePgDatabase<T>;

export type ModelData = Record<string, unknown>;
export type PaginatedData<T> = {
  data: T[];
  meta: Record<string, unknown>;
};
export interface DBConfig {
  host: string;
  user: string;
  port?: number;
  password: string;
  database: string;
}

export interface AppRegistry {
  env: EnvServiceContract;
  config: ConfigServiceContract;
  logger: LoggerServiceContract;
  db: <T extends Record<string, unknown> = Record<string, never>>(client: DBClient) => Promise<DrizzleClient<T>>;
  [key: string]: unknown;
}

export interface JsonObject {
  [key: string]: unknown;
  baseUrl?: string;
}

export interface SiteMapUrl {
  loc: string;
  lastmod: string;
  priority?: string;
  changefreq?: string;
}

export type ConfigStore = Record<string, ConfigValue>;
export type ConfigValue = string | number | boolean | Record<string, unknown> | Array<unknown> | null;
