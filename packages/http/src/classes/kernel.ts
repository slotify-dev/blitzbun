import { AppKernel } from '@blitzbun/core';
import { HttpRouter, HttpServer, WebSocketRouter } from '.';
import ModularAppProvider from '../providers/modular';
import { HttpAppRegistry } from '../types';

export default class HttpKernel extends AppKernel<HttpAppRegistry> {
  async handle(): Promise<void> {
    this.app.registerProvider(new ModularAppProvider<HttpAppRegistry>());

    this.app.use('router', new HttpRouter());
    this.app.use('wsRouter', new WebSocketRouter());

    await this.app.boot();

    const server = new HttpServer<HttpAppRegistry>(this.app);
    await server.start();

    this.app.onCleanup(async () => {
      await server.stop();
    });
  }
}
