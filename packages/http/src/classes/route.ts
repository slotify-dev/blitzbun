import {
  HttpMethod,
  HttpMiddleware,
  HttpRouteContract,
  HttpRouteParam,
  RouteData,
} from '@blitzbun/contracts';

export default class HttpRoute implements HttpRouteContract {
  constructor(public route: HttpRouteParam) {}

  getModule(): RouteData {
    return {
      keys: this.route.keys,
      meta: this.route.meta,
      module: this.route.module,
      pattern: this.route.pattern,
      modulePath: this.route.modulePath,
    };
  }

  matches(method: HttpMethod, url: string): boolean {
    if (this.route.method === method) {
      const match = this.route.pattern.exec(url);
      if (match) {
        return true;
      }
      if (!url.endsWith('/')) {
        const matchWithSlash = this.route.pattern.exec(`${url}/`);
        if (matchWithSlash) {
          return true;
        }
      }
    }
    return false;
  }

  middlewares(): HttpMiddleware[] {
    return [...this.route.middleware, this.route.handler];
  }
}
