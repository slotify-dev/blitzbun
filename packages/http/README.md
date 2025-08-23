# Using Websockets

Import and instantiate WSSessionManager

```typescript
import { ServerWebSocket } from 'bun';
import WSSessionManager from './classes/wsSession';
import type { WsSessionData } from '@blitzbun/contracts';

interface MySessionData extends WsSessionData {
  userId?: string;
  role?: string;
}

const sessionManager = new WSSessionManager<MySessionData>((session) => ({
  role: 'guest', // Default role on session creation
}));

function wsHandler(sessionManager: WSSessionManager<MySessionData>) {
  return {
    onOpen: (ws: ServerWebSocket<WebSocketContext<MySessionData>>) => {
      const session = sessionManager.create(ws);
      ws.data.session = session;
      ws.data.logger.info(`Session created: ${session.id}`);
    },

    onMessage: (
      ws: ServerWebSocket<WebSocketContext<MySessionData>>,
      msg: string
    ) => {
      const session = ws.data.session;
      if (session) {
        sessionManager.update(session.id, { lastMessageAt: new Date() });
      }
    },

    onClose: (
      ws: ServerWebSocket<WebSocketContext<MySessionData>>,
      code: number,
      reason: string
    ) => {
      const session = ws.data.session;
      if (session) {
        sessionManager.remove(session.id);
        ws.data.logger.info(`Session removed: ${session.id}`);
      }
    },
  };
}

// Usage:
app.use('wsSession', new WSSessionManager<MySessionData>());
wsRouter.register('/my-ws-path', wsHandler(app.get('wsSession')));
```
