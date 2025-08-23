import { ConfigStore, ConfigValue } from '../types';

export default interface ConfigContract {
  all(): ConfigStore;
  has(key: string): boolean;
  set<T extends ConfigValue>(key: string, value: T): this;
  get<T extends ConfigValue>(key: string, defaultValue?: T): T;
  merge<T extends Record<string, unknown>>(key: string, value: T): this;
}
