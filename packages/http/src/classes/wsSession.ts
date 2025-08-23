import omit from 'lodash/omit';

import {
  WebSocketContext,
  WsSessionData,
  WSSessionManagerContract,
} from '@blitzbun/contracts';

import { ServerWebSocket } from 'bun';

export default class WSSessionManager implements WSSessionManagerContract {
  private sessions = new Map<string, WsSessionData>();

  create(
    ws: ServerWebSocket<WebSocketContext>,
    initialData: Partial<WsSessionData> = {}
  ): WsSessionData {
    const now = new Date();
    const id = crypto.randomUUID();

    const sessionData: WsSessionData = {
      ...initialData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, sessionData);
    ws.data.session = sessionData;
    return sessionData;
  }

  get(id: string): WsSessionData | undefined {
    return this.sessions.get(id);
  }

  remove(id: string): void {
    this.sessions.delete(id);
  }

  update(
    sessionId: string,
    data: Partial<WsSessionData>
  ): WsSessionData | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    Object.assign(session, omit(data, ['id', 'createdAt']), {
      updatedAt: new Date(),
    });

    return session;
  }
}
