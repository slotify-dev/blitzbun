import { ConfigServiceContract } from '@blitzbun/core';
import CacheStoreContract from '../contracts/store';
import { StoreConfig } from '../types';
import CacheFactory from './factory';

export default class CacheManager {
  private factory: CacheFactory;
  private configService: ConfigServiceContract;
  private stores: Map<string, CacheStoreContract> = new Map();

  constructor(configService: ConfigServiceContract) {
    this.configService = configService;
    this.factory = new CacheFactory();
  }

  store(name?: string): CacheStoreContract {
    const storeName = name || this.configService.get<string>('cache.default');
    if (this.stores.has(storeName)) {
      return this.stores.get(storeName)!;
    }

    const storeConfig: StoreConfig = this.configService.get(`cache.stores.${storeName}`, {});
    if (!storeConfig) {
      throw new Error(`Cache store configuration '${storeName}' not found`);
    }

    const store = this.factory.make(storeName, storeConfig);
    this.stores.set(storeName, store);
    return store;
  }

  async get<T = unknown>(key: string, store?: string): Promise<T | null> {
    return this.store(store).get<T>(key);
  }

  async put<T = unknown>(key: string, value: T, ttl?: number, store?: string): Promise<void> {
    return this.store(store).put<T>(key, value, ttl);
  }

  async forget(key: string, store?: string): Promise<boolean> {
    return this.store(store).forget(key);
  }

  async flush(store?: string): Promise<void> {
    return this.store(store).flush();
  }
}
