import {
  HttpMethod,
  HttpMiddleware,
  HttpRouteContract,
  HttpRouterContract,
  HttpRouterGroupOptions,
  MetaData,
} from '@blitzbun/contracts';
import { parse } from 'regexparam';
import HttpRouteCollection from './collection';
import HttpRouterContext from './context';

export default class HttpRouter implements HttpRouterContract {
  private module: string;
  private modulePath: string;

  private context = new HttpRouterContext();
  private routes = new HttpRouteCollection();

  constructor() {
    this.module = '';
    this.modulePath = '';
  }

  setModule(module: string, modulePath: string): this {
    this.module = module;
    this.modulePath = modulePath;
    return this;
  }

  group(options: HttpRouterGroupOptions, callback: () => void): this {
    const parent = this.context;
    this.context = new HttpRouterContext(parent).apply(options);
    callback();
    this.context = parent;
    return this;
  }

  get(path: string, handler: HttpMiddleware, meta: MetaData = {}): this {
    return this.addRoute(HttpMethod.GET, path, handler, meta);
  }

  post(path: string, handler: HttpMiddleware, meta: MetaData = {}): this {
    return this.addRoute(HttpMethod.POST, path, handler, meta);
  }

  put(path: string, handler: HttpMiddleware, meta: MetaData = {}): this {
    return this.addRoute(HttpMethod.PUT, path, handler, meta);
  }

  delete(path: string, handler: HttpMiddleware, meta: MetaData = {}): this {
    return this.addRoute(HttpMethod.DELETE, path, handler, meta);
  }

  patch(path: string, handler: HttpMiddleware, meta: MetaData = {}): this {
    return this.addRoute(HttpMethod.PATCH, path, handler, meta);
  }

  match(method: HttpMethod, url: string): HttpRouteContract | undefined {
    return this.routes.all().find((route) => {
      return route.matches(method, url);
    });
  }

  private addRoute(
    method: HttpMethod,
    path: string,
    handler: HttpMiddleware,
    meta: MetaData = {}
  ): this {
    path = this.context.prefix + path;
    const { keys, pattern } = parse(path);
    const middleware = [...this.context.middleware];
    this.routes.add({
      keys,
      meta,
      path,
      method,
      handler,
      pattern,
      middleware,
      module: this.module,
      modulePath: this.modulePath,
    });
    return this;
  }
}
