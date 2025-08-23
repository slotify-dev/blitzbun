import { HttpRequestContract, RateLimitResponse } from '@blitzbun/contracts';
import { AppContext } from '@blitzbun/core';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

import Redis from 'ioredis';

export default async (
  req: HttpRequestContract,
  requests: number,
  duration: number = 60
): Promise<RateLimitResponse> => {
  try {
    const appContainer = AppContext.get();
    const cacheService = appContainer.resolve('cache');

    const rpmRaw = req.getRoute('meta.rpm', requests);
    const rpmDurationRaw = req.getRoute('meta.rpmDuration', duration);

    const permission = req.getRoute('permission');
    const entity = req.getRoute('meta.entity', permission);

    const reqLimit = Number(rpmRaw) || requests;
    const blockDuration = Number(rpmDurationRaw) || duration;
    const redisClient = cacheService.store('redis_cache').getClient<Redis>();

    const rateLimiter = new RateLimiterRedis({
      duration,
      blockDuration,
      points: reqLimit,
      keyPrefix: 'rlflx',
      storeClient: redisClient,
    });

    const rateLimiterRes = await rateLimiter.consume(
      `${req.getIp()}_${entity}`
    );
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
