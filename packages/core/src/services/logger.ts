import { LogData, LoggerContract } from '@blitzbun/contracts';
import pino, { Logger } from 'pino';

export default class LoggerService implements LoggerContract {
  private logger: Logger;

  constructor(
    private context: string = 'app',
    private level = 'info'
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    const pinoLevel = isProduction ? 'error' : isDevelopment ? 'debug' : level;
    this.logger = pino({
      name: context,
      level: pinoLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            },
          }
        : undefined,
    });
  }

  setLevel(level: string): void {
    this.level = level;
    this.logger.level = level;
  }

  withContext(context: string): LoggerContract {
    return new LoggerService(context, this.level);
  }

  info(message: string, data?: LogData): void {
    this.logger.info({ context: this.context, ...data }, message);
  }

  warn(message: string, data?: LogData): void {
    this.logger.warn({ context: this.context, ...data }, message);
  }

  error(message: string, data?: LogData): void {
    this.logger.error({ context: this.context, ...data }, message);
  }

  debug(message: string, data?: LogData): void {
    this.logger.debug({ context: this.context, ...data }, message);
  }
}
