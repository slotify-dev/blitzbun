import { ApplicationContract, AppProvider, AppRegistry } from '@blitzbun/core';
import { CacheManager } from './classes';

export * from './classes';
export { default as CacheStoreContract } from './contracts/store';

export interface CacheRegistry extends AppRegistry {
  cache: CacheManager;
}
export class CacheProvider<T extends CacheRegistry> extends AppProvider<T> {
  register(app: ApplicationContract<T>): void {
    app.use('cache', new CacheManager(app.get('config')));
  }
}
