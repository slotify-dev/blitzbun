import { WebSocketHandler } from '../types';

export default interface WebSocketRouterContract {
  match(path: string): WebSocketHandler | undefined;
  register(path: string, handler: WebSocketHandler): this;
}
