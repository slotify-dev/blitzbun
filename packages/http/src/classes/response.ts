import HttpResponseContract from '../contracts/response';
import { CookieOptions, HttpStatusCode } from '../types';

export default class HttpResponse implements HttpResponseContract {
  private headers = new Headers();
  private setCookies: string[] = [];
  private body: BodyInit | null = null;
  private statusCode = HttpStatusCode.OK;

  status(code: HttpStatusCode): this {
    this.statusCode = code;
    return this;
  }

  isEmpty(): boolean {
    return this.body === null;
  }

  header(name: string, value: string): this {
    this.headers.set(name, value);
    return this;
  }

  json(data: unknown, statusCode: HttpStatusCode = HttpStatusCode.OK): this {
    this.header('Content-Type', 'application/json');
    this.body = JSON.stringify(data);
    this.statusCode = statusCode;
    return this;
  }

  text(data: string, statusCode: HttpStatusCode = HttpStatusCode.OK): this {
    this.header('Content-Type', 'text/plain; charset=utf-8');
    this.body = data;
    this.statusCode = statusCode;
    return this;
  }

  html(data: string, statusCode: HttpStatusCode = HttpStatusCode.OK): this {
    this.header('Content-Type', 'text/html; charset=utf-8');
    this.body = data;
    this.statusCode = statusCode;
    return this;
  }

  redirect(url: string, statusCode: HttpStatusCode = HttpStatusCode.FOUND): this {
    this.statusCode = statusCode;
    this.header('Location', url);
    this.body = null;
    return this;
  }

  notFound(message = 'Not Found'): this {
    return this.status(HttpStatusCode.NOT_FOUND).text(message);
  }

  file(buffer: ArrayBuffer | Uint8Array, contentType: string, filename?: string): this {
    this.header('Content-Type', contentType);
    if (filename) {
      this.header('Content-Disposition', `attachment; filename="${filename}"`);
    }
    this.body = buffer;
    this.statusCode = HttpStatusCode.OK;
    return this;
  }

  cookie(name: string, value: string, options: CookieOptions = {}): this {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.path) cookieStr += `; Path=${options.path}`;
    if (options.expires) cookieStr += `; Expires=${options.expires.toUTCString()}`;
    if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
    if (options.httpOnly) cookieStr += `; HttpOnly`;
    if (options.secure) cookieStr += `; Secure`;
    if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;

    this.setCookies.push(cookieStr);
    return this;
  }

  toResponse<T = unknown>(data?: T): Response {
    if (data !== undefined) {
      if (typeof data === 'string') {
        // If string, treat as text/plain by default
        this.text(data);
      } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        // If binary, treat as octet-stream (you may want to customize)
        this.header('Content-Type', 'application/octet-stream');
        this.body = data;
      } else {
        // Otherwise, treat as JSON
        this.json(data);
      }
    }

    this.setCookies.forEach((cookie) => {
      this.headers.append('Set-Cookie', cookie);
    });

    return new Response(this.body, {
      status: this.statusCode,
      headers: this.headers,
    });
  }
}
