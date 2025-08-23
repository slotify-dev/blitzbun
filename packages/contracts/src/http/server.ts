import { Server as BunServer } from 'bun';
import { HttpMiddleware } from '../types';
export default interface HttpServerContract {
  stop(): Promise<void>;
  start(): Promise<void>;
  use(middleware: HttpMiddleware): this;
  handle(
    nativeRequest: Request,
    server: BunServer
  ): Promise<Response | undefined>;
}
