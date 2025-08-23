export interface LogData {
  [key: string]: unknown;
}

export default interface LoggerContract {
  setLevel(level: string): void;
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
  debug(message: string, data?: LogData): void;
  withContext(context: string): LoggerContract;
}
