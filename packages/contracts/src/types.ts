import { ServerWebSocket } from 'bun';
import { CacheManagerContract, CacheStoreContract } from './cache';
import {
  ConfigContract,
  EnvContract,
  LoggerContract,
  ProfilerContract,
} from './core';
import {
  HttpRequestContract,
  HttpResponseContract,
  HttpRouterContract,
  WebSocketRouterContract,
  WSSessionManagerContract,
} from './http';

import type { Table } from 'drizzle-orm';
import type { AnyMySqlTable } from 'drizzle-orm/mysql-core';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { AnyPgTable } from 'drizzle-orm/pg-core';

export const CacheClients = {
  memory: 'memory',
  redisCache: 'redis_cache',
  redisQueue: 'redis_queue',
  redisSession: 'redis_session',
} as const;

export const DBClients = {
  MySQL: 'mysql',
  PostgreSQL: 'pg',
} as const;

export type DBSchema = Record<string, Table>;
export type MetaData = Record<string, unknown>;
export type DBClient = (typeof DBClients)[keyof typeof DBClients];
export type CacheClient = (typeof CacheClients)[keyof typeof CacheClients];
export type DrizzleClient<T extends DBSchema> =
  | MySql2Database<T>
  | NodePgDatabase<T>;

export type SupportedTable = AnyPgTable | AnyMySqlTable;
export type SupportedDB<
  AR extends AppRegistry,
  TTable,
> = TTable extends AnyPgTable
  ? NodePgDatabase<AR['dbSchema']>
  : TTable extends AnyMySqlTable
    ? MySql2Database<AR['dbSchema']>
    : never;

export type PaginatedData<T> = {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    totalPages: number;
    currentPage: number;
  };
};

export interface QueryOption {
  returning?: boolean;
}

export type StoreConfig = Record<string, string>;
export type StoreDriverCreator = (config: StoreConfig) => CacheStoreContract;
export type CacheEntry = {
  value: unknown;
  expiresAt?: number;
};

export type HttpMiddleware = (
  req: HttpRequestContract,
  res: HttpResponseContract,
  next: (err?: unknown) => void
) => Promise<unknown>;
export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export enum HttpMethod {
  PUT = 'PUT',
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export enum HttpStatusCode {
  OK = 200,
  FOUND = 302,
  CREATED = 201,
  ACCEPTED = 202,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  THROTTLED = 429,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  METHOD_NOT_ALLOWED = 405,
  SERVICE_UNAVAILABLE = 503,
  INTERNAL_SERVER_ERROR = 500,
}

export enum HttpMessage {
  OK = 'OK',
  CREATED = 'Created',
  ACCEPTED = 'Accepted',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  NO_CONTENT = 'No Content',
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  THROTTLED = 'Too Many Requests',
  METHOD_NOT_ALLOWED = 'Method Not Allowed',
  SERVICE_UNAVAILABLE = 'Service Unavailable',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}

export interface HttpRouterGroupOptions {
  prefix?: string;
  middleware?: HttpMiddleware[];
}
export interface HttpRouteParam {
  path: string;
  keys: string[];
  module: string;
  meta?: MetaData;
  pattern: RegExp;
  modulePath: string;
  method: HttpMethod;
  handler: HttpMiddleware;
  middleware: HttpMiddleware[];
}
export interface RouteData {
  keys?: string[];
  meta?: MetaData;
  module?: string;
  pattern?: RegExp;
  modulePath?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface DBConfig {
  host: string;
  user: string;
  port?: number;
  password: string;
  database: string;
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

export interface ProfilerSnapshot {
  rss: string; // e.g., "142.29 MB"
  heapUsed: string; // e.g., "13.54 MB"
  external: string; // e.g., "3.23 MB"
  uptime: string; // e.g., "12.50 s"
}

export type RateLimitResponse = {
  reqs: number;
  failed: boolean;
  remaining?: number;
  retrySecs?: number;
};

export type ConfigStore = Record<string, ConfigValue>;
export type ConfigValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | Array<unknown>
  | null;

export interface WsSessionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface AppRegistry<T extends WsSessionData = WsSessionData> {
  env: EnvContract;
  dbSchema: DBSchema;
  config: ConfigContract;
  logger: LoggerContract;
  profiler: ProfilerContract;
  db: DrizzleClient<DBSchema>;
  cache: CacheManagerContract;
  router: HttpRouterContract;
  request: HttpRequestContract;
  wsRouter: WebSocketRouterContract<T>;
  wsSession: WSSessionManagerContract<T>;
}

export interface AuthUser {
  id: number;
  uuid: string;
  [key: string]: unknown;
}
export interface WebSocketContext<T extends WsSessionData = WsSessionData> {
  queryParams: Record<string, string>;
  handler: WebSocketHandler<T>;
  logger: LoggerContract;
  user?: AuthUser;
  session?: T;
}

export interface WebSocketHandler<T extends WsSessionData = WsSessionData> {
  onError?: (ws: ServerWebSocket<WebSocketContext<T>>, error: Error) => void;
  onDrain?: (ws: ServerWebSocket<WebSocketContext<T>>) => void;
  onOpen?: (ws: ServerWebSocket<WebSocketContext<T>>) => void;
  onMessage?: (
    ws: ServerWebSocket<WebSocketContext<T>>,
    msg: string | Buffer
  ) => void;
  onClose?: (
    ws: ServerWebSocket<WebSocketContext<T>>,
    code?: number,
    reason?: string
  ) => void;
}

export interface SecurityOptions {
  xssProtection?: boolean;
  contentTypeOptions?: boolean;
  frameOptions?: string | boolean;
  hsts?:
    | {
        maxAge?: number;
        preload?: boolean;
        includeSubDomains?: boolean;
      }
    | boolean;
  contentSecurityPolicy?:
    | {
        reportOnly?: boolean;
        directives?: Record<string, string | string[]>;
      }
    | boolean;
  referrerPolicy?: string | boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  cors?: CorsOptions | boolean;
}

export interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string) => boolean);
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  optionsSuccessStatus?: number;
  preflightContinue?: boolean;
  methods?: string | string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface SecureSessionOptions {
  path?: string;
  name?: string;
  secret?: string;
  maxAge?: number; // in seconds
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  csrfProtection?: boolean;
  regenerateOnAuth?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  rolling?: boolean; // Renew session on each request
  strategy?: 'redis' | 'memory'; // Session storage strategy
}

export type SessionOptions = SecureSessionOptions;
