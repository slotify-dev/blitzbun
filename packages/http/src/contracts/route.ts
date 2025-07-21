import { HttpMethod, HttpMiddleware, RouteData } from '../types';

export default interface HttpRouteContract {
  getModule(): RouteData;
  middlewares(): HttpMiddleware[];
  matches(method: HttpMethod, url: string): boolean;
}
