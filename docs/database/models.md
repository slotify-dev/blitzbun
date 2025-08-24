# Models

Models in BlitzBun define your database structure and provide type-safe data access using Drizzle ORM.

## Creating Models

Generate a model for your data:

```bash
bun console create:model --module=users --model=user
```

This creates `modules/users/models/user.ts`:

```typescript
import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const UserModel = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof UserModel.$inferSelect;
export type InsertUser = typeof UserModel.$inferInsert;
```

## Column Types

### PostgreSQL Types

```typescript
import {
  serial,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';

export const ProductModel = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: real('price').notNull(),
  quantity: integer('quantity').default(0),
  metadata: jsonb('metadata').$type<{ tags: string[]; category: string }>(),
  publishedAt: date('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### MySQL Types

```typescript
import {
  int,
  varchar,
  text,
  boolean,
  decimal,
  datetime,
  json,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

export const ProductModel = mysqlTable('products', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['active', 'inactive']).default('active'),
  metadata: json('metadata').$type<{ tags: string[] }>(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

## Relationships

### One-to-Many

```typescript
import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  integer,
  foreignKey,
} from 'drizzle-orm/pg-core';

// Models
export const UserModel = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const PostModel = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => UserModel.id),
});

// Relations
export const userRelations = relations(UserModel, ({ many }) => ({
  posts: many(PostModel),
}));

export const postRelations = relations(PostModel, ({ one }) => ({
  user: one(UserModel, {
    fields: [PostModel.userId],
    references: [UserModel.id],
  }),
}));
```

### Many-to-Many

```typescript
export const UserModel = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const RoleModel = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
});

// Junction table
export const UserRoleModel = pgTable(
  'user_roles',
  {
    userId: integer('user_id').references(() => UserModel.id),
    roleId: integer('role_id').references(() => RoleModel.id),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.roleId),
  })
);

// Relations
export const userRelations = relations(UserModel, ({ many }) => ({
  userRoles: many(UserRoleModel),
}));

export const roleRelations = relations(RoleModel, ({ many }) => ({
  userRoles: many(UserRoleModel),
}));

export const userRoleRelations = relations(UserRoleModel, ({ one }) => ({
  user: one(UserModel, {
    fields: [UserRoleModel.userId],
    references: [UserModel.id],
  }),
  role: one(RoleModel, {
    fields: [UserRoleModel.roleId],
    references: [RoleModel.id],
  }),
}));
```

## Using Models with Repositories

```typescript
import Users, { UsersModel } from '../models/users';
import type { AppRegistry } from '@blitzbun/contracts';
import { AppContext, BasePgRepository } from '@blitzbun/core';

export default class UsersRepository<
  AR extends AppRegistry = AppRegistry,
> extends BasePgRepository<typeof Users, AR> {
  protected table = Users;

  constructor() {
    super(AppContext.get<AR>());
  }

  async findByPhone(phone: string): Promise<UsersModel | null> {
    return await this.findBy('phone', phone);
  }

  async getByUuid(uuid: string): Promise<UsersModel | null> {
    return await this.findBy('uuid', uuid);
  }
}
```
