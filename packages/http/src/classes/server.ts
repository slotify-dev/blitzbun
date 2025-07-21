/* eslint-disable security/detect-object-injection */
import { ApplicationContract, LoggerServiceContract } from '@blitzbun/core';
import { Server as BunServer, ServerWebSocket } from 'bun';
import RouterContract from '../contracts/router';
import HttpServerContract from '../contracts/server';
import { HttpAppRegistry, HttpMethod, WebSocketContext } from '../types';
import HttpRequest from './request';
import HttpResponse from './response';

export default class HttpServer<T extends HttpAppRegistry> implements HttpServerContract {
  private started: boolean;
  private server?: BunServer;
  private router: RouterContract;
  private logger: LoggerServiceContract;

  constructor(private app: ApplicationContract<T>) {
    this.started = false;
    this.router = this.app.get('router');
    this.logger = this.app.get('logger').withContext('http');
  }

  public async handle(nativeRequest: Request, server: BunServer): Promise<Response | undefined> {
    const res = new HttpResponse();
    const urlData = new URL(nativeRequest.url);

    try {
      // handle websocket request
      server.upgrade(nativeRequest, {
        data: {
          logger: this.logger.withContext('ws'),
          handler: this.app.get('wsRouter')?.match(urlData.pathname),
        },
      });

      const route = this.router.match(nativeRequest.method as HttpMethod, urlData.pathname);

      if (!route) {
        this.logger.warn(`404 Not Found: ${urlData.pathname}`);
        return res.status(404).text('Not Found').toResponse();
      }

      const req = new HttpRequest(nativeRequest, route?.getModule());
      const middleWares = route.middlewares();

      let index = -1;

      const next = async (i: number): Promise<void> => {
        if (i <= index) throw new Error('next() called multiple times');
        index = i;
        if (i > 50) throw new Error('Too many middleware layers');
        const mw = middleWares[i];
        if (mw) await mw(req, res, () => next(i + 1));
      };

      await next(0);

      if (res.isEmpty()) {
        this.logger.warn(`404 Empty Response: ${req.url}`);
        return res.status(404).text('Not Found').toResponse();
      }

      return res.toResponse();
    } catch (err) {
      this.logger.error(`500 Server Error for ${nativeRequest.url}: ${(err as Error).message}`);
      return res.status(500).text('Internal Server Error').toResponse();
    }
  }

  public async start(): Promise<void> {
    if (!this.started) {
      const envService = this.app.get('env');

      this.server = Bun.serve({
        fetch: this.handle.bind(this),
        port: envService.get('APP_PORT', 8000),
        error: (err) => {
          this.logger.error('Unhandled Bun error:' + err.message);
          return new Response('Internal Server Error', { status: 500 });
        },
        websocket: {
          open(ws: ServerWebSocket<WebSocketContext>) {
            ws.data.logger.info(`🔌 WebSocket connection opened`);
            ws.data.handler.onOpen?.(ws);
          },
          message(ws: ServerWebSocket<WebSocketContext>, msg) {
            ws.data.handler.onMessage?.(ws, msg);
          },
          close(ws: ServerWebSocket<WebSocketContext>, code, reason) {
            ws.data.logger.info(`❌ WebSocket closed: ${code} - ${reason}`);
            ws.data.handler.onClose?.(ws, code, reason);
          },
        },
      });

      this.started = true;
      this.logger.info(`Server running at http://localhost:${this.server.port}/`);
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      await this.server.stop();
      this.logger.info(`🛑 HTTP server stopped`);
    }
  }

  public getServer(): BunServer | undefined {
    return this.server;
  }
}
