import {
  CacheEntry,
  CacheStoreContract,
  StoreConfig,
  TaggedCacheStoreContract,
} from '@blitzbun/contracts';
import TaggedMemoryStore from './memory-tag';

export default class MemoryStore implements CacheStoreContract {
  private store = new Map<string, CacheEntry>();

  constructor(_config: StoreConfig) {}

  getClient<T = unknown>(): T | void {
    return undefined;
  }

  async disconnect(): Promise<void> {}

  async get<T = unknown>(key: string): Promise<T | null>;
  async get<T = unknown>(key: string, defaultValue: T): Promise<T>;
  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | null> {
    const entry = this.store.get(key);

    if (!entry || (entry.expiresAt && Date.now() > entry.expiresAt)) {
      this.store.delete(key);
      return typeof defaultValue === 'undefined' ? null : defaultValue;
    }

    return entry.value as T;
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async forget(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  tags(...tags: string[]): TaggedCacheStoreContract {
    return new TaggedMemoryStore(this.store, tags);
  }
}
