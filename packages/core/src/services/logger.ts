import winston from 'winston';
import LoggerServiceContract from '../contracts/logger';

export default class LoggerService implements LoggerServiceContract {
  private logger: winston.Logger;

  constructor(
    context: string = 'app',
    private level = 'info'
  ) {
    this.logger = winston.createLogger({
      level: level,
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.label({ label: context }),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, label }) => {
          return `[${timestamp}] [${level.toUpperCase()}] [${label}] ${message}`;
        })
      ),
    });
  }

  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  setLevel(level: string): void {
    this.level = level;
  }

  withContext(context: string): LoggerServiceContract {
    return new LoggerService(context, this.level);
  }
}
