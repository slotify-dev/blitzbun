import { ServerWebSocket } from 'bun';
import { WebSocketContext, WsSessionData } from '../types';

export default interface WSSessionManagerContract<
  T extends WsSessionData = WsSessionData,
> {
  create(ws: ServerWebSocket<WebSocketContext<T>>, initialData?: Partial<T>): T;
  update(id: string, data: Partial<T>): T | undefined;
  get(id: string): T | undefined;
  remove(id: string): void;
}
