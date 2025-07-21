import { Server as BunServer } from 'bun';
export default interface HttpServerContract {
  stop(): Promise<void>;
  start(): Promise<void>;
  handle(nativeRequest: Request, server: BunServer): Promise<Response | undefined>;
}
