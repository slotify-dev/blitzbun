import {
  CacheStoreContract,
  StoreConfig,
  TaggedCacheStoreContract,
} from '@blitzbun/contracts';

import Redis from 'ioredis';
import TaggedRedisStore from './redis-tag';

export default class RedisStore implements CacheStoreContract {
  private client: Redis;
  private prefix: string;

  constructor(config: StoreConfig) {
    this.prefix = config.prefix ?? 'cache';
    this.client = new Redis({
      host: config.host,
      db: parseInt(config.db),
      password: config.password,
      port: parseInt(config.port),
    });
  }

  getClient<T = unknown>(): T | void {
    return this.client as T;
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T = unknown>(key: string): Promise<T | null>;
  async get<T = unknown>(key: string, defaultValue: T): Promise<T>;
  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.client.get(this.key(key));
    if (value !== null) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return defaultValue ?? null;
      }
    }
    return typeof defaultValue === 'undefined' ? null : defaultValue;
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const json = JSON.stringify(value);
    if (ttl) {
      await this.client.set(this.key(key), json, 'EX', ttl);
    } else {
      await this.client.set(this.key(key), json);
    }
  }

  async forget(key: string): Promise<boolean> {
    return (await this.client.del(this.key(key))) > 0;
  }

  async flush(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  tags(...tags: string[]): TaggedCacheStoreContract {
    return new TaggedRedisStore(this.client, tags, this.prefix);
  }
}
