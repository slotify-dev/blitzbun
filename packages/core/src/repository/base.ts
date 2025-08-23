/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AppContainerContract,
  AppRegistry,
  CacheStoreContract,
  HttpRequestContract,
  SupportedTable,
} from '@blitzbun/contracts';

import { getTableColumns, InferInsertModel } from 'drizzle-orm';

export default abstract class BaseRepository<
  TTable extends SupportedTable,
  AR extends AppRegistry,
> {
  protected abstract table: unknown;

  constructor(protected container: AppContainerContract<AR>) {}

  protected get tableName(): string {
    return (this.table as any)[Symbol.for('drizzle:Name')] as string;
  }

  protected get req(): HttpRequestContract {
    return this.container.resolve('request' as keyof AR) as HttpRequestContract;
  }

  protected get cacheService(): CacheStoreContract {
    return (
      this.container.resolve('cache' as keyof AR) as {
        store(): CacheStoreContract;
      }
    ).store();
  }

  private castValue(value: unknown, dataType: string): unknown {
    if (value == null) return value;

    switch (dataType) {
      case 'array':
        return value;

      case 'integer':
      case 'bigint':
      case 'smallint':
      case 'numeric':
        return Number(value);

      case 'boolean':
        return (
          value === true || value === 'true' || value === 1 || value === '1'
        );

      case 'date':
      case 'timestamp':
      case 'timestamptz':
        return new Date(value as string);

      case 'json':
      case 'jsonb':
        try {
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return value;
        }

      default: // text, varchar, uuid, etc.
        return String(value);
    }
  }

  protected extractRequestData(
    exclude: string[] = []
  ): Record<string, unknown> {
    const tableColumns = getTableColumns(this.table as any);
    const allParams = this.req.all() as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(tableColumns)
        .filter(([col]) => !exclude.includes(col) && col in allParams)
        .map(([col, colDef]) => {
          const type = (colDef as { dataType: string }).dataType as string;
          return [col, this.castValue(allParams[col], type)];
        })
    );
  }

  getPk(): string {
    if (this.hasColumn('uuid')) return 'uuid';
    if (this.hasColumn('id')) return 'id';
    throw new Error(`No primary key column (uuid or id) found on table.`);
  }

  hasColumn(key: string): boolean {
    return !!Object.keys(getTableColumns(this.table as any)).find(
      (c) => c === key
    );
  }

  getColumns(exclude: string[] = []): string[] {
    return Object.entries(getTableColumns(this.table as any))
      .filter(([key]) => !exclude.includes(key))
      .map(([key]) => key);
  }

  protected async additionalInsertData(
    data: Partial<InferInsertModel<TTable>>
  ): Promise<Partial<InferInsertModel<TTable>>> {
    return data;
  }

  protected async additionalUpdateData(
    data: Partial<InferInsertModel<TTable>>
  ): Promise<Partial<InferInsertModel<TTable>>> {
    return data;
  }

  async flushAll() {
    await this.cacheService.tags(this.tableName);
  }

  async flush(key: string) {
    await this.cacheService.tags(this.tableName).forget(key);
  }

  async catch<T = unknown>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = 5
  ): Promise<T> {
    const taggedCache = this.cacheService.tags(this.tableName);

    const cached = await taggedCache.get<T>(key);
    if (cached !== null) return cached;

    const value = await callback();
    await taggedCache.put(key, value, ttl);

    return value;
  }
}
