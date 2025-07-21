import Redis from 'ioredis';
import CacheStoreContract from '../contracts/store';
import { StoreConfig, StoreDriverCreator } from '../types';
import MemoryStore from './memory';
import RedisStore from './redis';

export default class CacheFactory {
  private drivers: Map<string, StoreDriverCreator> = new Map();

  constructor() {
    this.register('memory', () => new MemoryStore());
    this.register('redis', (config: StoreConfig) => {
      return new RedisStore(
        new Redis({
          host: config.host,
          db: parseInt(config.db),
          password: config.password,
          port: parseInt(config.port),
        })
      );
    });
  }

  register(name: string, creator: StoreDriverCreator) {
    this.drivers.set(name, creator);
  }

  make(driver: string, config: StoreConfig): CacheStoreContract {
    const creator = this.drivers.get(driver);
    if (!creator) {
      throw new Error(`Cache driver '${driver}' is not supported`);
    }
    return creator(config);
  }
}
