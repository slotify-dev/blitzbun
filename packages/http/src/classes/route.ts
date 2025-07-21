import { HttpRouteContract } from '../contracts';
import type { HttpMethod, HttpMiddleware, HttpRouteParam, RouteData } from '../types';

export default class HttpRoute implements HttpRouteContract {
  constructor(public route: HttpRouteParam) {}

  getModule(): RouteData {
    return {
      module: this.route.module,
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
