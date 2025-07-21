import { ApplicationContract, AppProvider, FileHelper } from '@blitzbun/core';
import path from 'path';
import { HttpAppRegistry } from '../types';

export default class ModularAppProvider<T extends HttpAppRegistry> extends AppProvider<T> {
  /**
   *
   * Load Modular File Structure
   */
  private async loadModules(app: ApplicationContract<T>): Promise<void> {
    const modulesDir = app.getModulePath();
    if (!FileHelper.directoryExists(modulesDir)) {
      return; // No modules folder, skip
    }

    const moduleNames = await FileHelper.getDirFilesAsync(modulesDir);
    for (const moduleName of moduleNames) {
      const modulePath = path.join(modulesDir, moduleName);
      if (!FileHelper.directoryExists(modulePath)) continue;

      await FileHelper.getFileAsync(modulePath, class extends AppProvider<T> {}).then((ModuleProvider) => {
        const instance = new ModuleProvider();
        if (instance instanceof AppProvider) {
          app.get('router').setModule(moduleName, modulePath);
          app.registerProvider(instance);
        }
      });
    }
  }

  async boot(app: ApplicationContract<T>): Promise<void> {
    await this.loadModules(app);
    app.get('logger')?.setLevel(app.get('config').get('app.log.level', 'info'));
  }
}
