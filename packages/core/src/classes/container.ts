import { AppContainerContract, AppRegistry } from '@blitzbun/contracts';

export default class AppContainer<T extends AppRegistry>
  implements AppContainerContract<T>
{
  private bindings = new Map<string, unknown>();

  has<K extends keyof T>(key: K): boolean {
    return this.bindings.has(String(key));
  }

  bind<K extends keyof T>(key: K, value: T[K]): void {
    this.bindings.set(String(key), value);
  }

  resolve<K extends keyof T>(key: K): T[K] {
    if (!this.bindings.has(String(key))) {
      throw new Error(`No binding found for key "${String(key)}"`);
    }
    return this.bindings.get(String(key)) as T[K];
  }

  clone(): AppContainerContract<T> {
    const cloned = new AppContainer<T>();
    for (const [key, value] of this.bindings.entries()) {
      cloned.bind(key as keyof T, value as T[keyof T]);
    }
    return cloned;
  }
}
