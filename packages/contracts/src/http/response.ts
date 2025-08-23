import { CookieOptions, HttpStatusCode } from '../types';

export default interface HttpResponseContract {
  text(data: string): this;
  html(data: string): this;
  json(data: unknown): this;
  redirect(url: string): this;
  runEndHooks(): Promise<void>;
  getFinalResponse(): Response;
  getStatusCode(): HttpStatusCode;
  notFound(message?: string): this;
  status(code: HttpStatusCode): this;
  header(name: string, value: string): this;
  onEnd(hook: () => void | Promise<void>): void;
  cookie(name: string, value: string, options?: CookieOptions): this;
  file(
    buffer: ArrayBuffer | Uint8Array,
    contentType: string,
    filename?: string
  ): this;
}
