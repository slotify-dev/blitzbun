import TaggedCacheStoreContract from './tag-store';

export default interface CacheStoreContract {
  flush(): Promise<void>;
  disconnect(): Promise<void>;
  getClient<T = unknown>(): T | void;
  forget(key: string): Promise<boolean>;
  get<T = unknown>(key: string): Promise<T | null>;
  tags(...tags: string[]): TaggedCacheStoreContract;
  get<T = unknown>(key: string, defaultValue: T): Promise<T>;
  put<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
}
