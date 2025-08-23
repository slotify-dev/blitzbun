import MemoryStore from './clients/memory';
import RedisStore from './clients/redis';

import {
  CacheClient,
  CacheManagerContract,
  CacheStoreContract,
  ConfigContract,
  StoreConfig,
} from '@blitzbun/contracts';

export default class CacheManager implements CacheManagerContract {
  private stores = new Map<string, CacheStoreContract>();

  constructor(private readonly configService: ConfigContract) {}

  store(name?: CacheClient): CacheStoreContract {
    const storeName = (name ??
      this.configService.get<CacheClient>('cache.default')) as CacheClient;

    if (!storeName) {
      throw new Error('No cache store specified or configured as default.');
    }

    if (!this.stores.has(storeName)) {
      const store = this.createStore(storeName);
      this.stores.set(storeName, store);
    }

    return this.stores.get(storeName)!;
  }

  async destroy(): Promise<void> {
    for (const [, store] of this.stores) {
      if (typeof store.disconnect === 'function') {
        await store.disconnect();
      }
    }
    this.stores.clear();
  }

  private assertNever(x: never): never {
    throw new Error(`Unsupported cache client: ${x}`);
  }

  private createStore(storeName: CacheClient): CacheStoreContract {
    const storeConfig = this.configService.get<StoreConfig>(
      `cache.stores.${storeName}`,
      {}
    );
    if (!storeConfig) {
      throw new Error(`Cache store configuration '${storeName}' not found`);
    }

    switch (storeName) {
      case 'memory':
        return new MemoryStore(storeConfig);
      case 'redis_cache':
      case 'redis_queue':
      case 'redis_session':
        return new RedisStore(storeConfig);
      default:
        return this.assertNever(storeName);
    }
  }
}
