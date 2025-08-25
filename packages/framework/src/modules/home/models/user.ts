import { InferModel } from 'drizzle-orm';
import { index, pgTable, serial, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').notNull().defaultRandom(),
  },
  (table) => {
    return {
      userIdx: index('user_idx').on(table.id),
      userUuidIdx: uniqueIndex('user_uuid_idx').on(table.uuid),
    };
  }
);

export type TTable = typeof userTable;
export type UsersModel = InferModel<TTable>;

export default userTable;
