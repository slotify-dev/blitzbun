/* eslint-disable security/detect-object-injection */
import { AppContext } from '@blitzbun/core';
import { Server as BunServer } from 'bun';

import createRequestLoggerMiddleware from '../middlewares/request-logger';
import createHttpRequest from '../utils/request-params';
import HttpResponse from './response';
import WebSocketServer from './wsServer';

import {
  ApplicationContract,
  AppRegistry,
  HttpMethod,
  HttpMiddleware,
  HttpRequestContract,
  HttpRouterContract,
  HttpServerContract,
  LoggerContract,
} from '@blitzbun/contracts';

export default class HttpServer<T extends AppRegistry>
  implements HttpServerContract
{
  private started: boolean;
  private server?: BunServer;
  private logger: LoggerContract;
  private wsServer: WebSocketServer;
  private router: HttpRouterContract;
  private wares: HttpMiddleware[] = [];

  constructor(private app: ApplicationContract<T>) {
    this.started = false;
    this.router = this.app.get('router');
    this.logger = this.app.get('logger').withContext('http');

    this.wsServer = new WebSocketServer(
      this.app.getContainer(),
      this.app.get('wsRouter'),
      this.app.get('wsSession'),
      this.logger.withContext('ws')
    );

    this.use(createRequestLoggerMiddleware(this.logger.withContext('request')));
  }

  public use(middleware: HttpMiddleware): this {
    this.wares.push(middleware);
    return this;
  }

  public async handle(
    nativeRequest: Request,
    server: BunServer
  ): Promise<Response | undefined> {
    const res = new HttpResponse();
    const urlData = new URL(nativeRequest.url);
    const scopedContainer = this.app.getContainer().clone();

    try {
      let response: Response | undefined;
      if (this.wsServer.upgrade(server, nativeRequest)) return;

      const route = this.router.match(
        nativeRequest.method as HttpMethod,
        urlData.pathname
      );

      if (!route) {
        this.logger.warn('Route not found', {
          path: urlData.pathname,
          method: nativeRequest.method,
          url: nativeRequest.url,
        });
        return res.status(404).text('Not Found').getFinalResponse();
      }

      await AppContext.run(scopedContainer, async () => {
        let req: HttpRequestContract;
        try {
          req = await createHttpRequest(nativeRequest, route);
        } catch (error) {
          const err = error as Error;
          this.logger.warn('Request parsing failed', {
            error: err.message,
            url: nativeRequest.url,
            method: nativeRequest.method,
          });
          response = res
            .status(400)
            .json({
              code: 400,
              message: err.message,
            })
            .getFinalResponse();
          return;
        }

        const allMiddlewares = [...this.wares, ...route.middlewares()];

        scopedContainer.bind('request', req);

        let index = -1;

        const next = async (i: number): Promise<void> => {
          if (i <= index) throw new Error('next() called multiple times');
          index = i;
          if (i > 50) throw new Error('Too many middleware layers');
          const mw = allMiddlewares[i];
          if (mw) await mw(req, res, () => next(i + 1));
        };

        await next(0);

        if (res.isEmpty()) {
          this.logger.warn('Empty response returned', {
            url: req.getUrl(),
            path: req.path,
            method: req.method,
            requestId: req.id,
          });
          response = res.status(404).text('Not Found').getFinalResponse();
          return;
        }

        await res.runEndHooks();
        response = res.getFinalResponse();

        if (!response) {
          response = new Response(null, { status: 204 });
        }
      });

      return response;
    } catch (err) {
      const error = err as Error;
      this.logger.error('Server error occurred', {
        url: nativeRequest.url,
        method: nativeRequest.method,
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).text('Internal Server Error').getFinalResponse();
    }
  }

  public async start(): Promise<void> {
    if (!this.started) {
      const envService = this.app.get('env');

      this.server = Bun.serve({
        fetch: this.handle.bind(this),
        websocket: this.wsServer.getHandlers(),
        port: envService.get('APP_PORT', 8000),
        error: (err) => {
          this.logger.error('Unhandled Bun error', {
            error: err.message,
            stack: err.stack,
          });
          return new Response('Internal Server Error', { status: 500 });
        },
      });

      this.started = true;
      this.logger.info('Server started successfully', {
        port: this.server.port,
        url: `http://localhost:${this.server.port}/`,
      });
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      await this.server.stop();
      this.logger.info('HTTP server stopped successfully');
    }
  }

  public enableGracefulShutdown(
    options: {
      timeout?: number;
      signals?: string[];
      onShutdown?: () => Promise<void> | void;
      onSignal?: (signal: string) => Promise<void> | void;
    } = {}
  ): void {
    const signals = options.signals || ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
      process.once(signal, async () => {
        this.logger.info(`Received ${signal}, starting graceful shutdown...`);

        try {
          // Call custom signal handler
          if (options.onSignal) {
            await options.onSignal(signal);
          }

          // Stop accepting new requests
          if (this.server) {
            this.logger.info('Stopping HTTP server...');
            await this.server.stop();
          }

          // Shutdown application
          this.logger.info('Shutting down application...');
          await this.app.shutdown();

          // Call custom shutdown handler
          if (options.onShutdown) {
            await options.onShutdown();
          }

          this.logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          this.logger.error('Error during graceful shutdown:', { error });
          process.exit(1);
        }
      });
    });
  }

  public getServer(): BunServer | undefined {
    return this.server;
  }
}
