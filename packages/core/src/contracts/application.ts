import { AppProviderContract } from '../contracts';
import { AppRegistry } from '../types';

export default interface ApplicationContract<T extends AppRegistry = AppRegistry> {
  get<K extends keyof T>(key: K): T[K];
  has<K extends keyof T>(key: K): boolean;
  use<K extends keyof T>(key: K, value: T[K]): void;

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
