export default interface CacheStoreContract {
  flush(): Promise<void>;
  forget(key: string): Promise<boolean>;
  get<T = unknown>(key: string): Promise<T | null>;
  put<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
}
