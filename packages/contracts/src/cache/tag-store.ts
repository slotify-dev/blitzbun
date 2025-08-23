export default interface TaggedCacheStoreContract {
  flush(): Promise<void>;
  forget(key: string): Promise<boolean>;
  get<T = unknown>(key: string): Promise<T | null>;
  get<T = unknown>(key: string, defaultValue: T): Promise<T>;
  put<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
}
