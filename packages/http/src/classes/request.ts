/* eslint-disable security/detect-object-injection */
import get from 'lodash/get';
import has from 'lodash/has';
import HttpRequestContract from '../contracts/request';
import Validator from './validator';

import { ValidatorContract } from '../contracts';
import { RouteData } from '../types';

export default class HttpRequest implements HttpRequestContract {
  private pathName: string;
  private parsedQuery: URLSearchParams;
  private parsedCookies?: Record<string, string>;
  private routeParams: Record<string, string> = {};

  constructor(
    private nativeRequest: Request,
    private routeData: RouteData = {}
  ) {
    const url = new URL(nativeRequest.url);
    this.pathName = url.pathname;
    this.parsedQuery = url.searchParams;
  }

  get headers(): Headers {
    return this.nativeRequest.headers;
  }

  get method(): string {
    return this.nativeRequest.method;
  }

  get url(): string {
    return this.nativeRequest.url;
  }

  get path(): string {
    return this.pathName;
  }

  get cookieHeader(): string | null {
    return this.headers.get('Cookie');
  }

  get cookies(): Record<string, string> {
    if (this.parsedCookies) return this.parsedCookies;

    const cookieHeader = this.cookieHeader || '';
    const cookies: Record<string, string> = {};

    cookieHeader.split(';').forEach((cookie) => {
      const [key, ...val] = cookie.trim().split('=');
      if (key) {
        cookies[key] = decodeURIComponent(val.join('='));
      }
    });

    this.parsedCookies = cookies;
    return cookies;
  }

  async json<T = unknown>(): Promise<T> {
    return await this.nativeRequest.json();
  }

  getIp(): string {
    const xForwardedFor = this.headers.get('x-forwarded-for');
    if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

    const realIp = this.headers.get('x-real-ip');
    return realIp ?? ''; // ✅ fallback to empty string if null
  }

  getAuthToken(): string {
    const authHeader = this.headers.get('authorization');
    if (authHeader && authHeader.split(' ')[0].toLowerCase() === 'bearer') {
      return authHeader.split(' ')[1];
    }
    return '';
  }

  getValidator(path: string): ValidatorContract {
    return new Validator(path, this.routeData, this);
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
    const val = this.routeParams[key];
    return val !== undefined ? (val as T) : defaultVal;
  }

  query<T = unknown>(key: string): T | undefined;
  query<T = unknown>(key: string, defaultVal: T): T;
  query<T = unknown>(key: string, defaultVal?: T): T | undefined {
    const val = this.parsedQuery.get(key);
    return val !== null ? (val as T) : defaultVal;
  }

  cookie<T = unknown>(key: string): T | undefined;
  cookie<T = unknown>(key: string, defaultVal: T): T;
  cookie<T = unknown>(key: string, defaultVal?: T): T | undefined {
    const value = this.parsedCookies?.[key];
    return value !== undefined ? (value as T) : defaultVal;
  }

  setParams(params: Record<string, string>) {
    this.routeParams = params;
  }

  hasHeader(key: string): boolean {
    return has(this.headers, key);
  }

  isMethod(method: string): boolean {
    return this.method?.toLowerCase() === method.toLowerCase();
  }
}
