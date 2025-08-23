import {
  HttpMiddleware,
  HttpRequestContract,
  HttpResponseContract,
  LoggerContract,
} from '@blitzbun/contracts';

export default function createRequestLoggerMiddleware(
  logger: LoggerContract
): HttpMiddleware {
  return async (
    req: HttpRequestContract,
    res: HttpResponseContract,
    next: (err?: unknown) => void
  ) => {
    const startTime = process.hrtime.bigint();
    const timestamp = new Date().toISOString();

    const logData = {
      userAgent: req.getHeader('user-agent'),
      requestId: req.id,
      method: req.method,
      url: req.getUrl(),
      path: req.path,
      ip: req.getIp(),
      timestamp,
    };

    logger.info('Incoming request', logData);

    try {
      next();
      res.onEnd(async () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;

        logger.info('Request completed', {
          ...logData,
          status: res.getStatusCode(),
          duration: `${duration.toFixed(2)}ms`,
        });
      });
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      const errorLogData = {
        ...logData,
        status: res.getStatusCode() || 500,
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error),
      };

      logger.error('Request failed', errorLogData);
      next(error);
    }
  };
}
