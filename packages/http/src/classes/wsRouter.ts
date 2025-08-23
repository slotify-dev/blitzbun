import {
  WebSocketHandler,
  WebSocketRouterContract,
  WsSessionData,
} from '@blitzbun/contracts';

export default class WebSocketRouter<T extends WsSessionData = WsSessionData>
  implements WebSocketRouterContract<T>
{
  private handlers = new Map<string, WebSocketHandler<T>>();

  register(path: string, handler: WebSocketHandler<T>): this {
    const normalizedPath = this.normalizePath(path);
    if (this.handlers.has(normalizedPath)) {
      throw new Error(
        `WebSocket route already registered for: ${normalizedPath}`
      );
    }
    this.handlers.set(normalizedPath, handler);
    return this;
  }

  match(path: string): WebSocketHandler<T> | undefined {
    return this.handlers.get(this.normalizePath(path));
  }

  private normalizePath(path: string): string {
    return path.startsWith('/') ? path.toLowerCase() : '/' + path.toLowerCase();
  }
}
