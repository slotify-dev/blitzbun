import ValidatorContract from './validator';

export default interface HttpRequestContract {
  get id(): string;
  get path(): string;
  get method(): string;
  get headers(): Headers;
  get cookieHeader(): string | null;
  get cookies(): Record<string, string>;

  getIp(): string;
  getUrl(baseOnly?: boolean): string;

  bearerToken(): string;
  getBody<T = unknown>(): T;

  isAjax(): boolean;
  isJson(): boolean;
  isValidContentType(): boolean;
  isMethod(method: string): boolean;

  has(key: string): boolean;
  hasCookie(key: string): boolean;
  hasHeader(key: string): boolean;

  setUser(user: Record<string, unknown>): void;
  getUser<T = unknown>(key?: string): T | undefined;

  setContext(context: Record<string, unknown>): void;
  getContext<T = unknown>(key?: string): T | undefined;

  setParams(params: Record<string, string>): this;
  setSession(session: Record<string, unknown>): void;
  getSession<T = unknown>(key?: string): T | undefined;

  // cookie: returns T or undefined if no defaultVal is provided
  cookie<T = unknown>(key: string): T | undefined;
  cookie<T = unknown>(key: string, defaultVal: T): T;
  cookie<T = unknown>(key: string, defaultVal?: T): T | undefined;

  // param: returns T or undefined if no defaultVal is provided
  param<T = unknown>(key: string): T | undefined;
  param<T = unknown>(key: string, defaultVal: T): T;
  param<T = unknown>(key: string, defaultVal?: T): T | undefined;

  // query: returns T or undefined if no defaultVal is provided
  query<T = unknown>(key: string): T | undefined;
  query<T = unknown>(key: string, defaultVal: T): T;
  query<T = unknown>(key: string, defaultVal?: T): T | undefined;

  // getRoute: returns T or undefined if no defaultVal is provided
  getRoute<T = unknown>(key: string): T | undefined;
  getRoute<T = unknown>(key: string, defaultVal: T): T;
  getRoute<T = unknown>(key: string, defaultVal?: T): T | undefined;

  getValidator(path: string): ValidatorContract;
  getHeader(key: string, defaultValue?: string): string | undefined;

  input<T>(key: string, defaultVal?: T): T | undefined;
  only<K extends string>(...keys: K[]): Record<K, string | undefined>;
  all<T extends Record<string, unknown> = Record<string, unknown>>(): T;
}
