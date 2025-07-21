import get from 'lodash/get';
import has from 'lodash/has';
import { EnvServiceContract } from '../contracts';

export default class EnvService implements EnvServiceContract {
  private envVars: Record<string, string>;

  constructor() {
    this.envVars = Object.fromEntries(Object.entries(Bun.env).filter(([, value]) => typeof value === 'string')) as Record<string, string>;
  }

  /**
   * Check if a key exists in environment variables.
   */
  has(key: string): boolean {
    return has(this.envVars, key);
  }

  /**
   * Get an environment variable value, or return a default.
   */
  get<T = string>(key: string, defaultValue?: T): T {
    return get(this.envVars, key, defaultValue) as T;
  }
}
