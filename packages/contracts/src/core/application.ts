import { AppRegistry } from '../types';
import AppContainerContract from './container';
import AppProviderContract from './provider';

export default interface ApplicationContract<
  T extends AppRegistry = AppRegistry,
> {
  get<K extends keyof T>(key: K): T[K];
  has<K extends keyof T>(key: K): boolean;
  use<K extends keyof T>(key: K, value: T[K]): void;

  getContainer(): AppContainerContract<T>;
  onCleanup(callback: () => void | Promise<void>): void;
  registerProvider(provider: AppProviderContract<T>): this;
  registerProviders(providers: AppProviderContract<T>[]): this;

  boot(): Promise<void>;
  shutdown(): Promise<void>;

  getPublicPath(): string;
  getConfigPath(): string;
  getConsolePath(): string;
  getTranslationPath(): string;
  getRootPath(targetPath?: string): string;
  getModulePath(targetPath?: string): string;
}
