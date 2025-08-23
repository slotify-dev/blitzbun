import { TaggedCacheStoreContract } from '@blitzbun/contracts';
import Redis from 'ioredis';

export default class TaggedRedisStore implements TaggedCacheStoreContract {
  constructor(
    private client: Redis,
    private tags: string[],
    private prefix: string
  ) {}

  private getTagSetKey(tag: string): string {
    return `${this.prefix}:tag:${tag}`;
  }

  private namespacedKey(key: string): string {
    const tagPart = this.tags.length > 0 ? `${this.tags.join(':')}:` : '';
    return `${this.prefix}:${tagPart}${key}`;
  }

  private async registerKeyToTags(fullKey: string): Promise<void> {
    await Promise.all(
      this.tags.map((tag) => this.client.sadd(this.getTagSetKey(tag), fullKey))
    );
  }

  async get<T = unknown>(key: string): Promise<T | null>;
  async get<T = unknown>(key: string, defaultValue: T): Promise<T>;
  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | null> {
    const fullKey = this.namespacedKey(key);
    const value = await this.client.get(fullKey);
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
    const fullKey = this.namespacedKey(key);

    await this.registerKeyToTags(fullKey);
    const payload = JSON.stringify(value);

    if (ttl) {
      await this.client.set(fullKey, payload, 'EX', ttl);
    } else {
      await this.client.set(fullKey, payload);
    }
  }

  async forget(key: string): Promise<boolean> {
    return (await this.client.del(this.namespacedKey(key))) > 0;
  }

  async flush(): Promise<void> {
    const tagKeys = await Promise.all(
      this.tags.map((tag) => this.client.smembers(this.getTagSetKey(tag)))
    );
    const keysToDelete = [...new Set(tagKeys.flat())];

    if (keysToDelete.length > 0) {
      await this.client.del(...keysToDelete);
    }

    await Promise.all(
      this.tags.map((tag) => this.client.del(this.getTagSetKey(tag)))
    );
  }
}
