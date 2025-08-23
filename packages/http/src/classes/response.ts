import {
  CookieOptions,
  HttpResponseContract,
  HttpStatusCode,
} from '@blitzbun/contracts';

export default class HttpResponse implements HttpResponseContract {
  private cookies: string[] = [];
  private headers = new Headers();
  private body: BodyInit | null = null;

  private statusCode: HttpStatusCode = HttpStatusCode.OK;
  private endHooks: Array<() => void | Promise<void>> = [];

  private addCookiesToHeaders() {
    for (const cookie of this.cookies) {
      this.headers.append('Set-Cookie', cookie);
    }
  }

  onEnd(hook: () => void | Promise<void>): void {
    this.endHooks.push(hook);
  }

  async runEndHooks(): Promise<void> {
    for (const hook of this.endHooks) {
      await hook();
    }
  }

  status(code: HttpStatusCode): this {
    this.statusCode = code;
    return this;
  }

  getStatusCode(): HttpStatusCode {
    return this.statusCode;
  }

  header(name: string, value: string): this {
    this.headers.set(name, value);
    return this;
  }

  cookie(name: string, value: string, options: CookieOptions = {}): this {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.path) cookieStr += `; Path=${options.path}`;
    if (options.expires)
      cookieStr += `; Expires=${options.expires.toUTCString()}`;
    if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
    if (options.httpOnly) cookieStr += `; HttpOnly`;
    if (options.secure) cookieStr += `; Secure`;
    if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;

    this.cookies.push(cookieStr);
    return this;
  }

  json(data: unknown): this {
    this.body = JSON.stringify(data);
    this.headers.set('Content-Type', 'application/json');
    return this;
  }

  text(data: string): this {
    this.body = data;
    this.headers.set('Content-Type', 'text/plain; charset=utf-8');
    return this;
  }

  html(data: string): this {
    this.body = data;
    this.headers.set('Content-Type', 'text/html; charset=utf-8');
    return this;
  }

  redirect(url: string): this {
    this.headers.set('Location', url);
    this.body = null;
    return this;
  }

  notFound(message = 'Not Found'): this {
    return this.status(HttpStatusCode.NOT_FOUND).text(message);
  }

  file(
    buffer: ArrayBuffer | Uint8Array,
    contentType: string,
    filename?: string
  ): this {
    this.body = buffer as unknown as BodyInit;
    this.headers.set('Content-Type', contentType);
    if (filename) {
      this.headers.set(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
    }
    return this;
  }

  isEmpty(): boolean {
    return this.body === null;
  }

  getFinalResponse(): Response {
    this.addCookiesToHeaders();
    return new Response(this.body, {
      status: this.statusCode,
      headers: this.headers,
    });
  }
}
