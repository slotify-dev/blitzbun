import { HttpRouteParam } from '@blitzbun/contracts';
import Route from './route';

export default class HttpRouteCollection {
  private routes: Route[] = [];

  add(route: HttpRouteParam): void {
    this.routes.push(new Route(route));
  }

  all(): Route[] {
    return this.routes.sort((a: Route, b: Route): number => {
      if (a.route.path === '*') return 1;
      if (b.route.path === '*') return -1;
      if (a.route.path.includes('*') && !b.route.path.includes('*')) {
        return 1;
      } else if (!a.route.path.includes('*') && b.route.path.includes('*')) {
        return -1;
      }
      return a.route.path.localeCompare(b.route.path);
    });
  }
}
