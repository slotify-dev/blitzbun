# WebSocket

BlitzBun provides built-in WebSocket support for real-time communication.

## Basic Setup

### WebSocket Routes

Define WebSocket routes in your application:

```typescript
import { WSRouter } from '@blitzbun/http';

const wsRouter = new WSRouter();

// Simple message handling
wsRouter.on('message', (ws, message) => {
  console.log('Received:', message);
  ws.send(`Echo: ${message}`);
});

// JSON message handling
wsRouter.on('user:join', (ws, data) => {
  const { room, username } = data;
  ws.send({ type: 'joined', room, username });
});

// Connection events
wsRouter.on('open', (ws) => {
  console.log('Client connected');
  ws.send({ type: 'welcome', message: 'Connected successfully' });
});

wsRouter.on('close', (ws) => {
  console.log('Client disconnected');
});
```

### Starting the WebSocket Server

```typescript
import { WSServer } from '@blitzbun/http';

const wsServer = new WSServer(app);
wsServer.setRouter(wsRouter);
wsServer.listen(3001);
```

## Sessions

Manage WebSocket connections with sessions:

```typescript
import { WSSession } from '@blitzbun/http';

wsRouter.on('user:authenticate', (ws, data) => {
  const session = new WSSession(ws);
  session.set('userId', data.userId);
  session.set('username', data.username);

  ws.send({ type: 'authenticated' });
});

wsRouter.on('message', (ws, message) => {
  const session = new WSSession(ws);
  const userId = session.get('userId');

  if (!userId) {
    ws.send({ type: 'error', message: 'Not authenticated' });
    return;
  }

  // Handle authenticated user message
  console.log(`Message from user ${userId}:`, message);
});
```
