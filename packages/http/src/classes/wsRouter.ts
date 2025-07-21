/* eslint-disable security/detect-object-injection */
import WebSocketRouterContract from '../contracts/wsRouter';
import { WebSocketHandler } from '../types';

export default class WebSocketRouter implements WebSocketRouterContract {
  private handlers: Record<string, WebSocketHandler> = {};

  register(path: string, handler: WebSocketHandler): this {
    this.handlers[path] = handler;
    return this;
  }

  match(path: string): WebSocketHandler | undefined {
    return this.handlers[path];
  }
}
