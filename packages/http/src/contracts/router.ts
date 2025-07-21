import { HttpMethod, HttpMiddleware, HttpRouterGroupOptions } from '../types';
import HttpRouteContract from './route';

export default interface HttpRouterContract {
  put(path: string, handler: HttpMiddleware): void;
  get(path: string, handler: HttpMiddleware): void;
  post(path: string, handler: HttpMiddleware): void;
  delete(path: string, handler: HttpMiddleware): void;
  setModule(module: string, modulePath: string): this;
  group(options: HttpRouterGroupOptions, callback: () => void): void;
  add(method: HttpMethod, path: string, handler: HttpMiddleware): void;
  match(method: HttpMethod, url: string): HttpRouteContract | undefined;
}
