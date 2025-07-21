import ValidatorContract from './validator';

export default interface HttpRequestContract {
  get url(): string;
  get path(): string;
  get method(): string;
  get headers(): Headers;
  get cookieHeader(): string | null;
  get cookies(): Record<string, string>;

  getIp(): string;
  getAuthToken(): string;
  hasHeader(key: string): boolean;
  json<T = unknown>(): Promise<T>;
  isMethod(method: string): boolean;

  // cookie: returns T or undefined if no defaultVal is provided
  cookie<T = unknown>(key: string): T | undefined;
  cookie<T = unknown>(key: string, defaultVal: T): T;

  // param: returns T or undefined if no defaultVal is provided
  param<T = unknown>(key: string): T | undefined;
  param<T = unknown>(key: string, defaultVal: T): T;

  // query: returns T or undefined if no defaultVal is provided
  query<T = unknown>(key: string): T | undefined;
  query<T = unknown>(key: string, defaultVal: T): T;

  // getRoute: returns T or undefined if no defaultVal is provided
  getRoute<T = unknown>(key: string): T | undefined;
  getRoute<T = unknown>(key: string, defaultVal: T): T;

  getValidator(path: string): ValidatorContract;
}
