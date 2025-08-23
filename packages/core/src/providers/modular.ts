import { ApplicationContract, AppRegistry } from '@blitzbun/contracts';
import path from 'path';
import AppProvider from '../classes/provider';
import * as FileHelper from '../utils/file';

export default class ModularAppProvider<
  T extends AppRegistry = AppRegistry,
> extends AppProvider<T> {
  private async loadModules(app: ApplicationContract<T>): Promise<void> {
    const modulesDir = app.getModulePath();
    if (!FileHelper.directoryExists(modulesDir)) {
      return;
    }

    const moduleNames = await FileHelper.getDirFilesAsync(modulesDir);
    for (const moduleName of moduleNames) {
      const modulePath = path.join(modulesDir, moduleName);
      if (!FileHelper.directoryExists(modulePath)) continue;

      type ConcreteProviderConstructor = new () => AppProvider<T>;
      const ModuleProvider =
        await FileHelper.getFileAsync<ConcreteProviderConstructor>(
          modulePath,
          class DefaultProvider extends AppProvider<T> {} as ConcreteProviderConstructor
        );

      if (ModuleProvider && ModuleProvider.prototype instanceof AppProvider) {
        const instance = new ModuleProvider();
        if (app.has('router')) {
          app.registerProvider(instance);
        }
      }
    }
  }

  async boot(app: ApplicationContract<T>): Promise<void> {
    await this.loadModules(app);
    if (app.has('logger')) {
      app
        .get('logger')
        .setLevel(app.get('config').get('app.log.level', 'info'));
    }
  }
}
