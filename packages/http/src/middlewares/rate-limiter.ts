import type { ApplicationContract } from '@blitzbun/core/contracts';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import type { RedisClientType } from 'redis';
import { HttpRequestContract } from '../contracts';

export type RateLimitResponse = {
  reqs: number;
  failed: boolean;
  remaining?: number;
  retrySecs?: number;
};

export default (app: ApplicationContract) =>
  async (req: HttpRequestContract, requests: number, duration: number = 60): Promise<RateLimitResponse> => {
    try {
      const rpmRaw = req.getRoute('meta.rpm', requests);
      const rpmDurationRaw = req.getRoute('meta.rpmDuration', duration);

      const permission = req.getRoute('permission');
      const entity = req.getRoute('meta.entity', permission);

      const reqLimit = Number(rpmRaw) || requests;
      const blockDuration = Number(rpmDurationRaw) || duration;

      const cacheService = app.get('cache') as {
        getClient(): RedisClientType;
      };

      const redisClient = cacheService.getClient();
      const rateLimiter = new RateLimiterRedis({
        duration,
        blockDuration,
        points: reqLimit,
        keyPrefix: 'rlflx',
        storeClient: redisClient,
      });

      const rateLimiterRes = await rateLimiter.consume(`${req.getIp()}_${entity}`);
      return {
        failed: false,
        reqs: requests,
        remaining: rateLimiterRes.remainingPoints,
      };
    } catch (error) {
      const res = error as RateLimiterRes;
      return {
        failed: true,
        reqs: requests,
        retrySecs: Math.round(res?.msBeforeNext / 1000) || 1,
      };
    }
  };
