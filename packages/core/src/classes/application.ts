import {
  ApplicationContract,
  AppProviderContract,
  AppRegistry,
} from '@blitzbun/contracts';
import { resolve } from 'path';
import { FileHelper } from '..';
import CacheServiceProvider from '../lib/cache';
import DatabaseServiceProvider from '../lib/db';
import ModularAppProvider from '../providers/modular';
import ConfigService from '../services/config';
import EnvService from '../services/env';
import LoggerService from '../services/logger';
import ProfilerService from '../services/profiler';
import AppContainer from './container';

export default class Application<T extends AppRegistry = AppRegistry>
  implements ApplicationContract<T>
{
  private rootPath: string;
  private container: AppContainer<T>;
  private providers: AppProviderContract<T>[] = [];
  private cleanupCallbacks: (() => void | Promise<void>)[] = [];

  constructor(rootPath: string = process.cwd()) {
    this.container = new AppContainer<T>();
    this.rootPath = resolve(rootPath);
    this.registerCoreServices();
    this.registerCoreProviders();
  }

  private registerCoreServices(): void {
    this.container.bind('env', new EnvService());
    this.container.bind('config', new ConfigService());
    this.container.bind('logger', new LoggerService());
    this.container.bind('profiler', new ProfilerService());
  }

  private registerCoreProviders(): void {
    this.registerProvider(new ModularAppProvider<T>());
    this.registerProvider(new CacheServiceProvider<T>());
    this.registerProvider(new DatabaseServiceProvider<T>());
  }

  getContainer(): AppContainer<T> {
    return this.container;
  }

  onCleanup(callback: () => void | Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  registerProvider(provider: AppProviderContract<T>): this {
    provider.register(this);
    this.providers.push(provider);
    return this;
  }

  registerProviders(providers: AppProviderContract<T>[]): this {
    for (const provider of providers) {
      this.registerProvider(provider);
    }
    return this;
  }

  private async loadConfigs(): Promise<void> {
    await FileHelper.loadFiles(
      this.getConfigPath(),
      (configFun: unknown, fileName: string) => {
        if (typeof configFun === 'function') {
          this.get('config').merge(fileName, configFun(this.get('env')));
        }
      }
    );
  }

  async boot(): Promise<void> {
    await this.loadConfigs();
    for (const provider of this.providers) {
      if (provider.boot) await provider.boot(this);
    }
  }

  async shutdown(): Promise<void> {
    for (const provider of this.providers.reverse()) {
      if (provider.shutdown) {
        await provider.shutdown(this);
      }
    }
    for (const callback of this.cleanupCallbacks) {
      await callback();
    }
  }

  getRootPath(targetPath: string = ''): string {
    return resolve(this.rootPath, targetPath);
  }

  getModulePath(targetPath: string = ''): string {
    if (!targetPath) return this.getRootPath('modules');
    return this.getRootPath('modules/' + targetPath);
  }

  getPublicPath(): string {
    return resolve(this.rootPath, '../public');
  }

  getConfigPath(): string {
    return this.getRootPath('configs');
  }

  getConsolePath(): string {
    return this.getRootPath('console');
  }

  getTranslationPath(): string {
    return this.getRootPath('translations');
  }

  use<K extends keyof T>(key: K, value: T[K]): void {
    this.container.bind(key as keyof T, value);
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.container.resolve(key);
  }

  has<K extends keyof T>(key: K): boolean {
    return this.container.has(key);
  }
}
