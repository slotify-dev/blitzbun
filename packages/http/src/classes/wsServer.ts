/* eslint-disable security/detect-object-injection */
import {
  AppContainerContract,
  AppRegistry,
  LoggerContract,
  WebSocketContext,
  WebSocketRouterContract,
  WsSessionData,
  WSSessionManagerContract,
} from '@blitzbun/contracts';

import { AppContext } from '@blitzbun/core';
import { Server as BunServer, ServerWebSocket } from 'bun';

export default class WebSocketServer<T extends WsSessionData = WsSessionData> {
  constructor(
    private container: AppContainerContract<AppRegistry>,
    private wsRouter: WebSocketRouterContract<T>,
    private wsSession: WSSessionManagerContract<T>,
    private logger: LoggerContract
  ) {}

  upgrade(server: BunServer, request: Request): boolean {
    const url = new URL(request.url);
    const handler = this.wsRouter.match(url.pathname);
    if (handler === undefined) return false;

    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return server.upgrade<WebSocketContext<T>>(request, {
      data: {
        handler,
        queryParams,
        logger: this.logger.withContext('ws'),
      },
    });
  }

  getHandlers() {
    return {
      open: (ws: ServerWebSocket<WebSocketContext<T>>) => {
        const scopedContainer = this.container.clone();
        AppContext.run(scopedContainer, async () => {
          try {
            const session = this.wsSession.create(ws);
            ws.data.session = session;
            await ws.data.handler.onOpen?.(ws);
          } catch (err) {
            ws.data.logger.error('WebSocket open error', {
              error: (err as Error).message,
              stack: (err as Error).stack,
              sessionId: ws.data.session?.id,
            });
          }
        });
      },
      message: (
        ws: ServerWebSocket<WebSocketContext<T>>,
        msg: string | Buffer
      ) => {
        const scopedContainer = this.container.clone();
        AppContext.run(scopedContainer, async () => {
          try {
            await ws.data.handler.onMessage?.(ws, msg);
          } catch (err) {
            ws.data.logger.error('WebSocket message error', {
              error: (err as Error).message,
              stack: (err as Error).stack,
              sessionId: ws.data.session?.id,
            });
          }
        });
      },
      close: (
        ws: ServerWebSocket<WebSocketContext<T>>,
        code: number,
        reason: string
      ) => {
        const scopedContainer = this.container.clone();
        AppContext.run(scopedContainer, async () => {
          try {
            const session = ws.data.session;
            if (session) {
              this.wsSession.remove(session.id);
            }
            await ws.data.handler.onClose?.(ws, code, reason);
          } catch (err) {
            ws.data.logger.error('WebSocket close error', {
              error: (err as Error).message,
              stack: (err as Error).stack,
              sessionId: ws.data.session?.id,
              code,
              reason,
            });
          }
        });
      },
      drain: (ws: ServerWebSocket<WebSocketContext<T>>) => {
        const scopedContainer = this.container.clone();
        AppContext.run(scopedContainer, async () => {
          try {
            await ws.data.handler.onDrain?.(ws);
          } catch (err) {
            ws.data.logger.error('WebSocket drain error', {
              error: (err as Error).message,
              stack: (err as Error).stack,
              sessionId: ws.data.session?.id,
            });
          }
        });
      },

      error: (ws: ServerWebSocket<WebSocketContext<T>>, error: Error) => {
        const scopedContainer = this.container.clone();
        AppContext.run(scopedContainer, async () => {
          try {
            await ws.data.handler.onError?.(ws, error);
          } catch (err) {
            ws.data.logger.error('WebSocket handler error', {
              error: (err as Error).message,
              stack: (err as Error).stack,
              sessionId: ws.data.session?.id,
              originalError: error.message,
            });
          }
        });
      },
    };
  }
}
