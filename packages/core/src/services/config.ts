/* eslint-disable security/detect-object-injection */
import { ConfigContract, ConfigStore, ConfigValue } from '@blitzbun/contracts';
import get from 'lodash/get';
import has from 'lodash/has';
import merge from 'lodash/merge';

export default class ConfigService implements ConfigContract {
  private config: ConfigStore;

  constructor() {
    this.config = {};
  }

  /**
   * Get the entire config object.
   */
  all(): ConfigStore {
    return { ...this.config };
  }

  /**
   * Check if a config key exists.
   */
  has(key: string): boolean {
    return has(this.config, key);
  }

  /**
   * Get a typed config value with optional default.
   */
  get<T extends ConfigValue>(key: string, defaultValue?: T): T {
    return get(this.config, key, defaultValue) as T;
  }

  /**
   * Set a typed config value.
   */
  set<T extends ConfigValue>(key: string, value: T): this {
    this.config[key] = value;
    return this;
  }

  /**
   * Merge a nested object into the existing config value.
   */
  merge<T extends Record<string, unknown>>(key: string, value: T): this {
    if (!this.config[key]) {
      this.config[key] = {};
    }

    const current = this.config[key];
    if (
      typeof current === 'object' &&
      !Array.isArray(current) &&
      current !== null
    ) {
      this.config[key] = merge({}, current, value);
    }

    return this;
  }
}
