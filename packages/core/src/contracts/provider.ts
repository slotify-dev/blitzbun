import { AppRegistry } from '../types';
import ApplicationContract from './application';

export default interface AppProviderContract<T extends AppRegistry = AppRegistry> {
  register(app: ApplicationContract<T>): void;
  boot?(app: ApplicationContract<T>): Promise<void> | void;
  shutdown?(app: ApplicationContract<T>): Promise<void> | void;
}
