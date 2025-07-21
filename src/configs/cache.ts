import { EnvServiceContract } from '@blitzbun/core';

export default (envService: EnvServiceContract) => ({
  default: 'memory',
  stores: {
    queue: {
      db: 0,
      connectTimeout: 10000,
      maxRetriesPerRequest: null,
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD'),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
    },
    cache: {
      db: 1,
      connectTimeout: 10000,
      keyPrefix: 'cache-store:',
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD', ''),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
    },
    session: {
      db: 2,
      connectTimeout: 10000,
      keyPrefix: 'session-store:',
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD'),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
    },
  },
});
