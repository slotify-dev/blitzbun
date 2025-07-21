import type { Redis } from 'ioredis';
import CacheStoreContract from '../contracts/store';

export default class RedisStore implements CacheStoreContract {
  constructor(private client: Redis) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, payload, 'EX', ttl);
    } else {
      await this.client.set(key, payload);
    }
  }

  async forget(key: string): Promise<boolean> {
    return (await this.client.del(key)) > 0;
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }
}
