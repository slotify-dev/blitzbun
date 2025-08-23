import {
  HttpMethod,
  HttpMiddleware,
  HttpRouterGroupOptions,
  MetaData,
} from '../types';
import HttpRouteContract from './route';

export default interface HttpRouterContract {
  setModule(module: string, modulePath: string): this;
  group(options: HttpRouterGroupOptions, callback: () => void): this;
  match(method: HttpMethod, url: string): HttpRouteContract | undefined;

  put(path: string, handler: HttpMiddleware, meta?: MetaData): this;
  get(path: string, handler: HttpMiddleware, meta?: MetaData): this;
  post(path: string, handler: HttpMiddleware, meta?: MetaData): this;
  patch(path: string, handler: HttpMiddleware, meta?: MetaData): this;
  delete(path: string, handler: HttpMiddleware, meta?: MetaData): this;
}
