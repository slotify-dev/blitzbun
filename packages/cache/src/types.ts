import CacheStoreContract from './contracts/store';

export type StoreConfig = Record<string, string>;
export type StoreDriverCreator = (config: StoreConfig) => CacheStoreContract;
export type CacheEntry = {
  value: unknown;
  expiresAt?: number;
};
