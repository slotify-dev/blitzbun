import { HttpMiddleware, HttpRouterGroupOptions } from '../types';

export default class HttpRouterContext {
  prefix = '';
  middleware: HttpMiddleware[] = [];

  constructor(parent?: HttpRouterContext) {
    if (parent) {
      this.prefix = parent.prefix;
      this.middleware = [...parent.middleware];
    }
  }

  apply(options: HttpRouterGroupOptions): this {
    if (options.prefix) {
      this.prefix += options.prefix;
    }
    if (options.middleware) {
      this.middleware = this.middleware.concat(options.middleware);
    }
    return this;
  }
}
