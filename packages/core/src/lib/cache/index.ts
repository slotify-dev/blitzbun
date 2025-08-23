import { ApplicationContract, AppRegistry } from '@blitzbun/contracts';

import AppProvider from '../../classes/provider';
import CacheManager from './manager';

export default class CacheServiceProvider<
  T extends AppRegistry,
> extends AppProvider<T> {
  register(app: ApplicationContract<T>): void {
    const config = app.get('config');
    const cache = new CacheManager(config);

    app.use('cache', cache);
    app.onCleanup(async () => {
      await cache.destroy();
    });
  }
}
