import { AppContainerContract, AppRegistry } from '@blitzbun/contracts';
import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage<AppContainerContract<AppRegistry>>();

export const AppContext = {
  run<T extends AppRegistry>(
    container: AppContainerContract<T>,
    fn: () => void | Promise<void>
  ): void | Promise<void> {
    return storage.run(container as AppContainerContract<AppRegistry>, fn);
  },

  get<T extends AppRegistry>(): AppContainerContract<T> {
    const container = storage.getStore();
    if (!container) throw new Error('No container bound in current context.');
    return container as AppContainerContract<T>;
  },
};

export default AppContext;
