import { CacheClient } from '../types';
import CacheStoreContract from './store';

export default interface CacheManagerContract {
  destroy(): Promise<void>;
  store(name?: CacheClient): CacheStoreContract;
}
