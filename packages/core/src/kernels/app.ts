import {
  AppKernelContract,
  ApplicationContract,
  AppRegistry,
} from '@blitzbun/contracts';

export default class AppKernel<TRegistry extends AppRegistry = AppRegistry>
  implements AppKernelContract
{
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
      const logger = this.app.get('logger');
      logger.error('Unhandled Rejection:', { reason });

      // Only exit for critical system-level errors
      if (this.isCriticalError(reason as Error)) {
        console.error('Critical error detected, shutting down...');
        process.exit(1);
      }
    });

    process.on('uncaughtException', (err) => {
      const logger = this.app.get('logger');
      logger.error('Uncaught Exception:', {
        error: err.message,
        stack: err.stack,
      });

      // Only exit for critical system-level errors
      if (this.isCriticalError(err)) {
        console.error('Critical error detected, shutting down...');
        process.exit(1);
      }
    });
  }

  private isCriticalError(error: Error | unknown): boolean {
    // Only exit for truly critical system-level errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    // Critical errors that should terminate the process
    const criticalPatterns = [
      /EADDRINUSE/, // Port already in use
      /EACCES/, // Permission denied
      /EMFILE/, // Too many open files
      /ENOMEM/, // Out of memory
      /Cannot allocate memory/,
      /Maximum call stack/,
      /RangeError: Maximum call stack size exceeded/,
    ];

    return criticalPatterns.some(
      (pattern) =>
        pattern.test(errorMessage) || (errorStack && pattern.test(errorStack))
    );
  }

  async handle(): Promise<void> {
    await this.app.boot();
  }
}
