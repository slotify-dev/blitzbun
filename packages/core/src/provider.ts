/* eslint-disable @typescript-eslint/no-unused-vars */
import ApplicationContract from './contracts/application';
import AppProviderContract from './contracts/provider';
import { AppRegistry } from './types';

export default abstract class AppProvider<T extends AppRegistry> implements AppProviderContract<T> {
  /**
   * Register services into the container.
   * This is always required and must be implemented by the subclass.
   */
  register(app: ApplicationContract<T>): void {}

  /**
   * Optional lifecycle hook to run after all providers are registered.
   * Default is a no-op.
   */
  boot(app: ApplicationContract<T>): void | Promise<void> {
    // no-op by default
  }

  /**
   * Optional lifecycle hook to clean up resources before shutdown.
   * Default is a no-op.
   */
  shutdown(app: ApplicationContract<T>): void | Promise<void> {
    // no-op by default
  }
}
