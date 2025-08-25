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

    try {
      next();
      res.onEnd(async () => {
        const endTime = process.hrtime.bigint();
        const responseTimeMs = Math.round(
          Number(endTime - startTime) / 1000000
        );
        logger.info({
          method: req.method,
          requestId: req.id,
          url: req.getUrl(),
          responseTimeMs,
        });
      });
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const responseTimeMs = Math.round(Number(endTime - startTime) / 1000000);

      logger.error({
        responseTimeMs,
        url: req.getUrl(),
        method: req.method,
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error),
      });

      next(error);
    }
  };
}
