import { WebSocketHandler, WsSessionData } from '../types';
export default interface WebSocketRouterContract<
  T extends WsSessionData = WsSessionData,
> {
  register(path: string, handler: WebSocketHandler<T>): this;
  match(path: string): WebSocketHandler<T> | undefined;
}
