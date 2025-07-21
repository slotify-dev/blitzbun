import { parse } from 'regexparam';
import HttpRouteContract from '../contracts/route';
import HttpRouterContract from '../contracts/router';
import { HttpMethod, HttpMiddleware, HttpRouterGroupOptions } from '../types';
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

  group(options: HttpRouterGroupOptions, callback: () => void): void {
    const parent = this.context;
    this.context = new HttpRouterContext(parent).apply(options);
    callback();
    this.context = parent;
  }

  add(method: HttpMethod, path: string, handler: HttpMiddleware): void {
    path = this.context.prefix + path;
    const { keys, pattern } = parse(path);
    const middleware = [...this.context.middleware];
    this.routes.add({
      keys,
      path,
      method,
      handler,
      pattern,
      middleware,
      module: this.module,
      modulePath: this.modulePath,
    });
  }

  get(path: string, handler: HttpMiddleware): void {
    this.add(HttpMethod.GET, path, handler);
  }

  post(path: string, handler: HttpMiddleware): void {
    this.add(HttpMethod.POST, path, handler);
  }

  put(path: string, handler: HttpMiddleware): void {
    this.add(HttpMethod.PUT, path, handler);
  }

  delete(path: string, handler: HttpMiddleware): void {
    this.add(HttpMethod.DELETE, path, handler);
  }

  patch(path: string, handler: HttpMiddleware): void {
    this.add(HttpMethod.PATCH, path, handler);
  }

  match(method: HttpMethod, url: string): HttpRouteContract | undefined {
    return this.routes.all().find((route) => {
      return route.matches(method, url);
    });
  }
}
