# Database Documentation

BlitzBun provides a robust database abstraction layer built on top of [Drizzle ORM](https://orm.drizzle.team/), supporting both PostgreSQL and MySQL databases with connection pooling, query building, and repository patterns.

## Supported Databases

- **PostgreSQL** (`pg`) - Primary database with full feature support
- **MySQL** (`mysql`) - Full support with database-specific optimizations

## Database Configuration

Database configuration is managed through environment variables and configuration files.

### Configuration Structure

```typescript
// /packages/framework/src/configs/db.ts
export default (envService: EnvContract) => ({
  client: 'pg', // or 'mysql'
  pg: {
    port: envService.get('POSTGRES_PORT'),
    user: envService.get('POSTGRES_USER'),
    host: envService.get('POSTGRES_HOST'),
    database: envService.get('POSTGRES_DATABASE'),
    password: envService.get('POSTGRES_PASSWORD'),
  },
  mysql: {
    queueLimit: 0,
    dateStrings: true,
    connectionLimit: 10,
    waitForConnections: true,
    port: envService.get('MYSQL_PORT'),
    user: envService.get('MYSQL_USER'),
    host: envService.get('MYSQL_HOST'),
    password: envService.get('MYSQL_PASSWORD'),
    database: envService.get('MYSQL_DATABASE'),
  },
});
```

### Environment Variables

#### PostgreSQL

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database
```

#### MySQL

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

## Schema Management

### Model Definition

Models are defined using Drizzle's table definitions. Here's the template structure:

```typescript
// Model template from /packages/core/templates/model.txt
import { index, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

export default pgTable(
  'table_name',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      tableModuleIdx: index('table_module_idx').on(table.module),
      tableDatesIdx: index('table_dates_idx').on(
        table.createdAt,
        table.updatedAt
      ),
    };
  }
);
```

## Query Building and Execution

### Basic Queries

```typescript
// Using repository methods
const user = await userRepository.findBy('email', 'user@example.com');
const users = await userRepository.paginate({ status: 'active' });

// Direct database queries
const result = await this.db
  .select()
  .from(this.table)
  .where(eq(this.table.status, 'active'))
  .limit(10);
```

### JSON Operations

#### PostgreSQL JSONB

```typescript
// Find by JSONB field
const user = await userRepository.findByJsonb('metadata', 'role', 'admin');

// Update JSONB column
await userRepository.updateJsonbColumn('user-uuid', 'metadata', {
  lastLogin: '2024-08-24',
  preferences: 'dark-mode',
});
```

### Pagination

```typescript
const paginatedResult = await repository.paginate({
  status: 'active'
});

// Returns:
{
  data: [...], // Array of records
  meta: {
    total: 150,
    perPage: 25,
    currentPage: 1,
    totalPages: 6
  }
}
```

## Transaction Handling

Transactions are handled through Drizzle ORM's transaction API:

```typescript
await this.db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'John' });
  await tx.insert(profiles).values({ userId: 1, bio: 'Developer' });
});
```

## Migrations

### Drizzle Configuration

```typescript
// /packages/framework/drizzle.config.ts
export default defineConfig({
  dialect: 'postgresql',
  out: './database/migrations',
  extensionsFilters: ['postgis'],
  schema: [
    path.join(__dirname, 'src/modules/**/models/*.ts'),
    path.join(__dirname, 'packages/**/src/models/*.ts'),
  ],
  dbCredentials: {
    ssl: false,
    port: Number(process.env['POSTGRES_PORT']),
    host: process.env['POSTGRES_HOST'] as string,
    user: process.env['POSTGRES_USER'] as string,
    database: process.env['POSTGRES_DATABASE'] as string,
    password: process.env['POSTGRES_PASSWORD'] as string,
  },
});
```

### Running Migrations

```bash
# Generate migrations
bunx drizzle-kit generate

# Apply migrations
bunx drizzle-kit migrate
```

## Caching Integration

Repositories include built-in caching using tags:

```typescript
// Cache with automatic tagging
const user = await this.catch(
  'user:email:john@example.com',
  async () => {
    return await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.email, 'john@example.com'));
  },
  300 // TTL in minutes
);

// Flush cache for table
await this.flushAll();

// Flush specific cache key
await this.flush('user:email:john@example.com');
```

## Best Practices

1. **Use Repository Pattern**: Always extend base repository classes for database operations
2. **Leverage Caching**: Use built-in caching for frequently accessed data
3. **Type Safety**: Define proper TypeScript types for your models
4. **Connection Pooling**: Use the built-in factory for connection management
5. **Migrations**: Use Drizzle Kit for schema migrations
6. **Environment Configuration**: Keep database credentials in environment variables
7. **Error Handling**: Implement proper error handling for database operations
8. **Performance**: Use indexes and optimize queries for better performance

This documentation covers the core database functionality in BlitzBun. The framework provides a solid foundation for building scalable applications with robust data access patterns.
