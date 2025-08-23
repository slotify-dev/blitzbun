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

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

import BaseRepository from './base';

export default abstract class BasePgRepository<
    TTable extends PgTableWithColumns<any>,
    AR extends AppRegistry,
  >
  extends BaseRepository<TTable, AR>
  implements RepositoryContract<TTable>
{
  protected abstract table: TTable;
  protected db: NodePgDatabase<AR['dbSchema']>;

  constructor(container: AppContainerContract<AR>) {
    super(container);
    this.db = container.resolve('db') as NodePgDatabase<AR['dbSchema']>;
  }

  async update(): Promise<InferSelectModel<TTable>> {
    const pkColumn = this.getPk();
    const allParams = this.req.all() as Record<string, unknown>;

    if (!(pkColumn in allParams)) {
      throw new Error(`Missing primary key (${pkColumn}) in request params.`);
    }

    const pkValue = allParams[pkColumn];
    const rawData = this.extractRequestData();

    delete (rawData as Record<string, unknown>)[pkColumn];
    const data = await this.additionalUpdateData(
      rawData as Partial<InferInsertModel<TTable>>
    );

    if (Object.keys(data).length === 0) return {} as InferSelectModel<TTable>;

    const result = (await this.db
      .update(this.table)
      .set(data as InferInsertModel<TTable>)
      .where(eq(this.table[pkColumn], pkValue))
      .returning()) as InferSelectModel<TTable>[];

    await this.flushAll();
    return result[0] ?? ({} as InferSelectModel<TTable>);
  }

  async create(): Promise<InferSelectModel<TTable>> {
    const rawData = this.extractRequestData();
    const data = await this.additionalInsertData(
      rawData as Partial<InferInsertModel<TTable>>
    );

    if (Object.keys(data).length === 0) return {} as InferSelectModel<TTable>;

    const result = (await this.db
      .insert(this.table)
      .values(data as InferInsertModel<TTable>)
      .returning()) as InferSelectModel<TTable>[];

    await this.flushAll();
    return result[0] ?? ({} as InferSelectModel<TTable>);
  }

  protected fromTable() {
    return this.db
      .select()
      .from(this.table as unknown as PgTableWithColumns<any>);
  }

  async deleteBy<K extends keyof TTable['_']['columns']>(
    column: K,
    value: GetColumnData<TTable['_']['columns'][K]>
  ): Promise<void> {
    await this.flush(this.table[column]);
    await this.db.delete(this.table).where(eq(this.table[column], value));
  }

  async findBy<K extends keyof TTable['_']['columns']>(
    column: K,
    value: GetColumnData<TTable['_']['columns'][K]>
  ): Promise<InferSelectModel<TTable> | null> {
    return await this.catch(
      String(column),
      async (): Promise<InferSelectModel<TTable> | null> => {
        const result = (await this.fromTable()
          .where(eq(this.table[column], value))
          .limit(1)
          .execute()) as InferSelectModel<TTable>[];
        return result[0] ?? null;
      }
    );
  }

  async findByJsonb<K extends keyof TTable['_']['columns']>(
    jsonbColumn: K,
    jsonKey: string,
    value: string
  ): Promise<InferSelectModel<TTable> | null> {
    return await this.catch(String(jsonbColumn), async () => {
      const result = (await this.fromTable()
        .where(sql`(${this.table[jsonbColumn]} ->> ${jsonKey}) = ${value}`)
        .limit(1)
        .execute()) as InferSelectModel<TTable>[];
      return result[0] ?? null;
    });
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
        return eq(this.table[column], value);
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

    const cleanedValue = Object.fromEntries(
      Object.entries(partialValue).map(([k, v]) => [k, v ?? ''])
    );

    await this.db
      .update(this.table)
      .set({ [column]: cleanedValue } as any)
      .where(eq(this.table.uuid, uuid))
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
        return eq(
          this.table[column as keyof typeof whereConditions],
          value as any
        );
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
    const data = (await query
      .orderBy(desc(this.table['id']))
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
