import type { PaginatedData, SupportedTable } from '@blitzbun/contracts';
import type { GetColumnData, InferSelectModel } from 'drizzle-orm';

export default interface RepositoryContract<TTable extends SupportedTable> {
  create(): Promise<InferSelectModel<TTable>>;
  update(): Promise<InferSelectModel<TTable>>;

  deleteBy<K extends keyof TTable['_']['columns']>(
    column: K,
    value: GetColumnData<TTable['_']['columns'][K]>
  ): Promise<void>;

  findBy<K extends keyof TTable['_']['columns']>(
    column: K,
    value: GetColumnData<TTable['_']['columns'][K]>
  ): Promise<InferSelectModel<TTable> | null>;

  findByJsonb<K extends keyof TTable['_']['columns']>(
    jsonbColumn: K,
    jsonKey: string,
    value: string
  ): Promise<InferSelectModel<TTable> | null>;

  findByFields(
    fields: Partial<{
      [K in keyof TTable['_']['columns']]: GetColumnData<
        TTable['_']['columns'][K]
      >;
    }>
  ): Promise<InferSelectModel<TTable> | null>;

  updateJsonbColumn<K extends keyof TTable['_']['columns'] & string>(
    uuid: string,
    column: K,
    partialValue: Partial<Record<string, string>>
  ): Promise<void>;

  paginate(
    whereConditions?: Partial<{
      [K in keyof TTable['_']['columns']]: GetColumnData<
        TTable['_']['columns'][K]
      >;
    }>
  ): Promise<PaginatedData<InferSelectModel<TTable>>>;
}
