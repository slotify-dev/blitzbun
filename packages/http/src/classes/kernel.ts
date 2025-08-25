import { AppRegistry } from '@blitzbun/contracts';

import { AppKernel } from '@blitzbun/core';
import { HttpRouter, HttpServer, WebSocketRouter, WSSessionManager } from '.';
import createSecurityMiddleware from '../middlewares/security';

export default class HttpKernel<
  T extends AppRegistry = AppRegistry,
> extends AppKernel<T> {
  async handle(): Promise<void> {
    this.app.use('router', new HttpRouter());
    this.app.use('wsRouter', new WebSocketRouter());
    this.app.use('wsSession', new WSSessionManager());

    await this.app.boot();

    const server = new HttpServer(this.app);
    const configService = this.app.get('config');

    // Add security middleware globally
    server.use(
      createSecurityMiddleware(
        configService.get('security', {}),
        configService.get('cors', {})
      )
    );

    await server.start();

    server.enableGracefulShutdown({
      timeout: 30000,
      onShutdown: async () => {
        console.log('Application shutting down gracefully');
      },
    });

    this.app.onCleanup(async () => {
      await server.stop();
    });
  }
}
