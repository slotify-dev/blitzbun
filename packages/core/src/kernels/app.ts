import { AppKernelContract, ApplicationContract } from '../contracts';
import { AppRegistry } from '../types';

export default class AppKernel<TRegistry extends AppRegistry = AppRegistry> implements AppKernelContract {
  constructor(protected readonly app: ApplicationContract<TRegistry>) {
    this.registerSignalHandlers();
    this.registerGlobalErrorHandlers();
  }

  private registerSignalHandlers() {
    const shutdown = async () => {
      console.info('Graceful shutdown initiated.');
      await this.app.shutdown();
      process.exit(0);
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }

  private registerGlobalErrorHandlers() {
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
  }

  async handle(): Promise<void> {
    await this.app.boot();
  }
}
