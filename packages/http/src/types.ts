import { AppRegistry, LoggerServiceContract } from '@blitzbun/core';
import { ServerWebSocket } from 'bun';
import { HttpRequestContract, HttpResponseContract, HttpRouterContract, WebSocketRouterContract } from './contracts';

export type HttpMiddleware = (req: HttpRequestContract, res: HttpResponseContract, next: (err?: unknown) => void) => Promise<unknown>;
export interface CookieOptions {
  path?: string;
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

export interface HttpAppRegistry extends AppRegistry {
  router: HttpRouterContract;
  wsRouter: WebSocketRouterContract;
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface HttpRouteParam {
  path: string;
  keys: string[];
  module: string;
  pattern: RegExp;
  modulePath: string;
  method: HttpMethod;
  handler: HttpMiddleware;
  middleware: HttpMiddleware[];
}

export interface WebSocketContext {
  handler: WebSocketHandler;
  logger: LoggerServiceContract;
}

export interface RouteData {
  module?: string;
  modulePath?: string;
}

export type WebSocketHandler = {
  onOpen?: (ws: ServerWebSocket<WebSocketContext>) => void;
  onMessage?: (ws: ServerWebSocket<WebSocketContext>, msg: string | Uint8Array) => void;
  onClose?: (ws: ServerWebSocket<WebSocketContext>, code: number, reason: string) => void;
};
