import { CacheEntry, TaggedCacheStoreContract } from '@blitzbun/contracts';

export default class TaggedMemoryStore implements TaggedCacheStoreContract {
  private tagMap = new Map<string, Set<string>>();
  private store: Map<string, CacheEntry>;

  constructor(
    store: Map<string, CacheEntry>,
    private tags: string[]
  ) {
    this.store = store;
  }

  private namespacedKey(key: string): string {
    const tagPrefix = this.tags.length > 0 ? `${this.tags.join(':')}:` : '';
    return `${tagPrefix}${key}`;
  }

  private registerKeyToTags(fullKey: string): void {
    for (const tag of this.tags) {
      const tagSet = this.tagMap.get(tag) ?? new Set<string>();
      tagSet.add(fullKey);
      this.tagMap.set(tag, tagSet);
    }
  }

  async get<T = unknown>(key: string): Promise<T | null>;
  async get<T = unknown>(key: string, defaultValue: T): Promise<T>;
  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | null> {
    const fullKey = this.namespacedKey(key);
    const entry = this.store.get(fullKey);

    if (!entry || (entry.expiresAt && Date.now() > entry.expiresAt)) {
      this.store.delete(fullKey);
      return typeof defaultValue === 'undefined' ? null : defaultValue;
    }

    return entry.value as T;
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.namespacedKey(key);
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;

    this.store.set(fullKey, { value, expiresAt });
    this.registerKeyToTags(fullKey);
  }

  async forget(key: string): Promise<boolean> {
    const fullKey = this.namespacedKey(key);
    return this.store.delete(fullKey);
  }

  async flush(): Promise<void> {
    const allKeys = new Set<string>();

    for (const tag of this.tags) {
      const keys = this.tagMap.get(tag);
      if (!keys) continue;

      for (const key of keys) {
        allKeys.add(key);
        this.store.delete(key);
      }

      this.tagMap.delete(tag);
    }
  }
}
