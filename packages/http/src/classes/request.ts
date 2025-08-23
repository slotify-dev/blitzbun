/* eslint-disable security/detect-object-injection */
import {
  HttpRequestContract,
  RouteData,
  ValidatorContract,
} from '@blitzbun/contracts';
import get from 'lodash/get';
import has from 'lodash/has';
import { v4 as uuidv4 } from 'uuid';
import Validator from './validator';

export default class HttpRequest implements HttpRequestContract {
  private readonly url: URL;
  private readonly requestId: string = uuidv4();
  private cachedCookies?: Record<string, string>;
  private routeParams: Record<string, string> = {};

  private user?: Record<string, unknown> = {};
  private context: Record<string, unknown> = {};
  private session?: Record<string, unknown> = {};

  constructor(
    private readonly parsedBody: unknown,
    private readonly nativeRequest: Request,
    private readonly routeData: RouteData = {}
  ) {
    this.url = new URL(nativeRequest.url);
  }

  private parseCookies(header: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    header.split(';').forEach((cookie) => {
      const [key, ...val] = cookie.trim().split('=');
      if (key) {
        cookies[key] = decodeURIComponent(val.join('='));
      }
    });
    return cookies;
  }

  get id(): string {
    return this.requestId;
  }

  get headers(): Headers {
    return this.nativeRequest.headers;
  }

  get method(): string {
    return this.nativeRequest.method;
  }

  get path(): string {
    return this.url.pathname;
  }

  get cookieHeader(): string | null {
    return this.headers.get('Cookie');
  }

  get cookies(): Record<string, string> {
    if (!this.cachedCookies) {
      this.cachedCookies = this.parseCookies(this.cookieHeader ?? '');
    }
    return this.cachedCookies;
  }

  getBody<T = unknown>(): T {
    return this.parsedBody as T;
  }

  getUrl(baseOnly: boolean = false): string {
    return baseOnly ? `${this.url.origin}` : this.url.href;
  }

  getIp(): string {
    const xForwardedFor = this.headers.get('x-forwarded-for');
    if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
    return this.headers.get('x-real-ip') ?? '';
  }

  bearerToken(): string {
    const authHeader = this.headers.get('authorization');
    if (authHeader && authHeader.split(' ')[0].toLowerCase() === 'bearer') {
      return authHeader.split(' ')[1];
    }
    return '';
  }

  getValidator(path: string): ValidatorContract {
    return new Validator(path, this.routeData, this);
  }

  getHeader(key: string, defaultValue?: string): string | undefined {
    const value = this.headers.get(key);
    return value !== null ? value.trim() : defaultValue;
  }

  getRoute<T = unknown>(key: string): T | undefined;
  getRoute<T = unknown>(key: string, defaultVal: T): T;
  getRoute<T = unknown>(key: string, defaultVal?: T): T | undefined {
    const result = get(this.routeData, key);
    return result !== undefined ? (result as T) : defaultVal;
  }

  param<T = unknown>(key: string): T | undefined;
  param<T = unknown>(key: string, defaultVal: T): T;
  param<T = unknown>(key: string, defaultVal?: T): T | undefined {
    const body = this.getBody<Record<string, unknown>>();

    // 1️⃣ Check in body first
    if (body && typeof body === 'object' && key in body) {
      const value = body[key];
      if (value !== undefined) return value as T;
    }

    // 2️⃣ Check in query params
    const queryVal = this.url.searchParams.get(key);
    if (queryVal !== null) return queryVal as T;

    // 3️⃣ Check in route params
    const routeVal = this.routeParams[key];
    if (routeVal !== undefined) return routeVal as T;

    // 4️⃣ Default fallback
    return defaultVal;
  }

  query<T = unknown>(key: string): T | undefined;
  query<T = unknown>(key: string, defaultVal: T): T;
  query<T = unknown>(key: string, defaultVal?: T): T | undefined {
    const val = this.url.searchParams.get(key);
    return val !== null ? (val as T) : defaultVal;
  }

  cookie<T = unknown>(key: string): T | undefined;
  cookie<T = unknown>(key: string, defaultVal: T): T;
  cookie<T = unknown>(key: string, defaultVal?: T): T | undefined {
    const value = this.cachedCookies?.[key];
    return value !== undefined ? (value as T) : defaultVal;
  }

  setParams(params: Record<string, string>): this {
    this.routeParams = params;
    return this;
  }

  hasHeader(key: string): boolean {
    return key in this.headers;
  }

  hasCookie(key: string): boolean {
    return key in this.cookies;
  }

  isMethod(method: string): boolean {
    return this.method?.toLowerCase() === method.toLowerCase();
  }

  isAjax(): boolean {
    return (
      this.headers.get('x-requested-with')?.toLowerCase() === 'xmlhttprequest'
    );
  }

  isJson(): boolean {
    const accept = this.headers.get('accept') ?? '';
    const type = this.headers.get('content-type') ?? '';
    return (
      type.includes('application/json') || accept.includes('application/json')
    );
  }

  isValidContentType(): boolean {
    const type = this.getHeader(
      'content-type',
      this.getHeader('accept', '')
    ) as string;
    return (
      type.includes('application/json') ||
      type.includes('multipart/form-data') ||
      type.includes('application/x-www-form-urlencoded')
    );
  }

  has(key: string): boolean {
    return has(this.all<Record<string, unknown>>(), key);
  }

  input<T>(key: string, defaultVal?: T): T | undefined {
    const all = this.all<Record<string, unknown>>();
    return (get(all, key) as T | undefined) ?? defaultVal;
  }

  only<K extends string>(...keys: K[]): Record<K, string | undefined> {
    const all = this.all<Record<string, string>>();
    const result: Record<K, string | undefined> = {} as Record<
      K,
      string | undefined
    >;
    keys.forEach((k) => {
      result[k] = all[k];
    });
    return result;
  }

  all<T extends Record<string, unknown> = Record<string, unknown>>(): T {
    return {
      ...this.routeParams, // lowest priority
      ...Object.fromEntries(this.url.searchParams.entries()), // middle priority
      ...((this.parsedBody as Record<string, unknown>) ?? {}), // highest priority
    } as T;
  }

  setContext(context: Record<string, unknown>): void {
    this.context = context;
  }

  getContext<T = unknown>(key?: string): T | undefined {
    const context = this.context ?? {};
    if (key === undefined) {
      return context as unknown as T;
    }
    return context[key] as T | undefined;
  }

  setSession(session: Record<string, unknown>): void {
    this.session = session;
  }

  getSession<T = unknown>(key?: string): T | undefined {
    const session = this.session ?? {};
    if (key === undefined) {
      return session as unknown as T;
    }
    return session[key] as T | undefined;
  }

  setUser(user: Record<string, unknown>): void {
    this.user = user;
  }

  getUser<T = unknown>(key?: string): T | undefined {
    const user = this.user ?? {};
    if (key === undefined) {
      return user as unknown as T;
    }
    return user[key] as T | undefined;
  }
}
