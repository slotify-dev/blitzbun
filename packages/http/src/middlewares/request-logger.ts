import {
  HttpMiddleware,
  HttpRequestContract,
  HttpResponseContract,
  LoggerContract,
} from '@blitzbun/contracts';

function calculateResponseTime(startTime: bigint): string {
  const endTime = process.hrtime.bigint();
  const responseTimeMs = Math.round(Number(endTime - startTime) / 1000000);
  return `${responseTimeMs} ms`;
}

export default function createRequestLoggerMiddleware(
  logger: LoggerContract
): HttpMiddleware {
  return async (
    req: HttpRequestContract,
    res: HttpResponseContract,
    next: (err?: unknown) => void
  ) => {
    const startTime = process.hrtime.bigint();
    try {
      next();
      res.onEnd(async () => {
        logger.info({
          url: req.getUrl(),
          requestId: req.id,
          method: req.method,
          responseTime: calculateResponseTime(startTime),
        });
      });
    } catch (error) {
      logger.error({
        url: req.getUrl(),
        requestId: req.id,
        method: req.method,
        responseTime: calculateResponseTime(startTime),
        error: error instanceof Error ? error.message : String(error),
      });
      next(error);
    }
  };
}
