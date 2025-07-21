import CacheStoreContract from '../contracts/store';
import { CacheEntry } from '../types';

export default class MemoryStore implements CacheStoreContract {
  private store = new Map<string, CacheEntry>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.store.get(key);

    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
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
}
