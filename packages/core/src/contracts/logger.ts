export default interface LoggerServiceContract {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  setLevel(level: string): void;
  withContext(context: string): LoggerServiceContract;
}
