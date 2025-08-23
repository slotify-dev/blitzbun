/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable security/detect-object-injection */
import type {
  AppContainerContract,
  AppRegistry,
  PaginatedData,
  RepositoryContract,
} from '@blitzbun/contracts';

import {
  GetColumnData,
  InferInsertModel,
  InferSelectModel,
  and,
  desc,
  eq,
  sql,
} from 'drizzle-orm';

import type { AnyMySqlTable } from 'drizzle-orm/mysql-core';
import type { MySql2Database } from 'drizzle-orm/mysql2';

import BaseRepository from './base';

export default abstract class BaseMySQLRepository<
    TTable extends AnyMySqlTable,
    AR extends AppRegistry,
  >
  extends BaseRepository<TTable, AR>
  implements RepositoryContract<TTable>
{
  protected abstract table: TTable;
  protected db: MySql2Database<AR['dbSchema']>;

  constructor(container: AppContainerContract<AR>) {
    super(container);
    this.db = container.resolve('db') as MySql2Database<AR['dbSchema']>;
  }

  async update(): Promise<InferSelectModel<TTable>> {
    const pkColumn = this.getPk();
    const allParams = this.req.all() as Record<string, unknown>;

    if (!(pkColumn in allParams)) {
      throw new Error(`Missing primary key (${pkColumn}) in request params.`);
    }

    const pkValue = allParams[pkColumn];
    const updateData = this.extractRequestData();
    delete (updateData as Record<string, unknown>)[pkColumn];

    if (Object.keys(updateData).length === 0)
      return {} as InferSelectModel<TTable>;

    await this.db
      .update(this.table)
      .set(updateData as InferInsertModel<TTable>)
      .where(eq((this.table as any)[pkColumn], pkValue))
      .execute();

    await this.flushAll();
    return {} as InferSelectModel<TTable>; // No RETURNING in MySQL
  }

  async create(): Promise<InferSelectModel<TTable>> {
    const data = this.extractRequestData();
    if (Object.keys(data).length === 0) return {} as InferSelectModel<TTable>;

    const inserted = (await this.db
      .insert(this.table)
      .values(data as InferInsertModel<TTable>)
      .$returningId()
      .execute()) as Record<string, any>[];

    const pkKey = Object.keys(inserted[0] ?? {})[0];
    const pkValue = inserted[0]?.[pkKey];

    if (!pkValue) {
      throw new Error(`Unable to retrieve primary key value after insert.`);
    }

    await this.flushAll();
    return (await this.findBy(pkKey, pkValue)) as InferSelectModel<TTable>;
  }

  protected fromTable() {
    return this.db.select().from(this.table as unknown as AnyMySqlTable);
  }

  async deleteBy<K extends keyof TTable['_']['columns']>(
    column: K,
    value: GetColumnData<TTable['_']['columns'][K]>
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(eq((this.table as any)[column], value));
  }

  async findBy<K extends keyof TTable['_']['columns']>(
    column: K,
    value: GetColumnData<TTable['_']['columns'][K]>
  ): Promise<InferSelectModel<TTable> | null> {
    return await this.catch(
      `${String(column)}:${value}`,
      async (): Promise<InferSelectModel<TTable> | null> => {
        const result = (await this.fromTable()
          .where(eq((this.table as any)[column], value))
          .limit(1)
          .execute()) as InferSelectModel<TTable>[];
        return result[0] ?? null;
      }
    );
  }

  async findByJsonb<K extends keyof TTable['_']['columns']>(
    jsonColumn: K,
    jsonKey: string,
    value: string
  ): Promise<InferSelectModel<TTable> | null> {
    return await this.catch(
      `${String(jsonColumn)}->'$.${jsonKey}':${value}`,
      async () => {
        const result = (await this.fromTable()
          .where(
            sql`JSON_UNQUOTE(JSON_EXTRACT(${(this.table as any)[jsonColumn]}, '$.${sql.raw(jsonKey)}')) = ${value}`
          )
          .limit(1)
          .execute()) as InferSelectModel<TTable>[];
        return result[0] ?? null;
      }
    );
  }

  async findByFields(
    fields: Partial<{
      [K in keyof TTable['_']['columns']]: GetColumnData<
        TTable['_']['columns'][K]
      >;
    }>
  ): Promise<InferSelectModel<TTable> | null> {
    return this.catch(JSON.stringify(fields), async () => {
      const conditions = Object.entries(fields).map(([column, value]) => {
        if (!this.hasColumn(column))
          throw new Error(`Column ${column} does not exist on table.`);
        return eq((this.table as any)[column], value);
      });

      const query = this.fromTable();
      if (conditions.length > 0) {
        const result = (await query
          .where(and(...conditions))
          .limit(1)
          .execute()) as InferSelectModel<TTable>[];
        return result[0] ?? null;
      }

      return null;
    });
  }

  async updateJsonbColumn<K extends keyof TTable['_']['columns'] & string>(
    uuid: string,
    column: K,
    partialValue: Partial<Record<string, string>>
  ): Promise<void> {
    if (!this.hasColumn(column)) {
      throw new Error(`Column ${column} does not exist on table.`);
    }

    const pkColumn = this.getPk();
    const jsonPaths = Object.entries(partialValue)
      .flatMap(([k, v]) => [`'$.${k}'`, `'${v ?? ''}'`])
      .join(', ');

    await this.db
      .update(this.table)
      .set({
        [column]: sql.raw(`JSON_SET(${String(column)}, ${jsonPaths})`),
      } as any)
      .where(eq((this.table as any)[pkColumn], uuid))
      .execute();
  }

  async paginate(
    whereConditions: Partial<{
      [K in keyof TTable['_']['columns']]: GetColumnData<
        TTable['_']['columns'][K]
      >;
    }> = {}
  ): Promise<PaginatedData<InferSelectModel<TTable>>> {
    const page = parseInt(this.req.query<string>('page', '1'));
    const perPage = parseInt(this.req.query<string>('limit', '25'));

    const conditions = Object.entries(whereConditions).map(
      ([column, value]) => {
        if (!this.hasColumn(column))
          throw new Error(`Column ${column} does not exist on table.`);
        return eq((this.table as any)[column], value as any);
      }
    );

    const query = conditions.length
      ? this.fromTable().where(and(...conditions))
      : this.fromTable();

    const [{ count }] = (await this.db
      .select({ count: sql<number>`count(*)` })
      .from(query.as('count_subquery'))
      .execute()) as { count: number }[];

    const offset = (page - 1) * perPage;
    const pkColumn = this.getPk();
    const data = (await query
      .orderBy(desc((this.table as any)[pkColumn]))
      .limit(perPage)
      .offset(offset)
      .execute()) as InferSelectModel<TTable>[];

    return {
      data,
      meta: {
        perPage,
        currentPage: page,
        total: parseInt(String(count)),
        totalPages: Math.ceil(count / perPage),
      },
    };
  }
}
