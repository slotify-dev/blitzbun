import { EnvContract } from '@blitzbun/contracts';

export default (envService: EnvContract) => ({
  default: 'memory',
  stores: {
    redis_queue: {
      db: 0,
      connectTimeout: 10000,
      maxRetriesPerRequest: null,
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD'),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
    },
    redis_cache: {
      db: 1,
      connectTimeout: 10000,
      keyPrefix: 'cache-store:',
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
      password: envService.get('REDIS_PASSWORD', ''),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
    },
    redis_session: {
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
