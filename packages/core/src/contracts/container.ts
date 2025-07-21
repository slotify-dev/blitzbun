import { AppRegistry } from '../types';

export default interface AppContainerContract<T extends AppRegistry> {
  has<K extends keyof T>(key: K): boolean;
  resolve<K extends keyof T>(key: K): T[K];
  bind<K extends keyof T>(key: K, value: T[K]): void;
}
