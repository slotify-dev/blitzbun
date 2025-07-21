import { CookieOptions, HttpStatusCode } from '../types';

export default interface HttpResponseContract {
  isEmpty(): boolean;
  status(code: HttpStatusCode): this;
  header(name: string, value: string): this;

  json(data: unknown, statusCode?: HttpStatusCode): this;
  text(data: string, statusCode?: HttpStatusCode): this;
  html(data: string, statusCode?: HttpStatusCode): this;

  file(buffer: ArrayBuffer | Uint8Array, contentType: string, filename?: string): this;
  cookie(name: string, value: string, options?: CookieOptions): this;
  redirect(url: string, statusCode?: HttpStatusCode): this;
  notFound(message?: string): this;

  toResponse<T = unknown>(data?: T): Response;
}
