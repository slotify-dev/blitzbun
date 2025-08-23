import type {
  DBClient,
  DBConfig,
  DBSchema,
  DrizzleClient,
} from '@blitzbun/contracts';
import { createMySQLClient } from './dialects/mysql';
import { createPostgresClient } from './dialects/postgres';

function assertNever(x: never): never {
  throw new Error(`Unsupported DB client: ${x}`);
}

class DatabaseFactory<TSchema extends DBSchema> {
  private instances = new Map<
    DBClient,
    {
      drizzle: DrizzleClient<TSchema>;
      connection: { end: () => Promise<void> };
    }
  >();

  constructor(private schema: TSchema) {}

  async get(
    client: DBClient,
    config: DBConfig
  ): Promise<DrizzleClient<TSchema>> {
    if (this.instances.has(client)) {
      return this.instances.get(client)!.drizzle;
    }

    let db: DrizzleClient<TSchema>;
    let connection: { end: () => Promise<void> };

    switch (client) {
      case 'mysql': {
        const { drizzle, client: rawClient } = await createMySQLClient<TSchema>(
          config,
          this.schema
        );
        db = drizzle;
        connection = rawClient;
        break;
      }
      case 'pg': {
        const { drizzle, client: rawClient } =
          await createPostgresClient<TSchema>(config, this.schema);
        db = drizzle;
        connection = rawClient;
        break;
      }
      default:
        assertNever(client);
    }

    this.instances.set(client, { drizzle: db, connection });
    return db;
  }

  async destroy(): Promise<void> {
    for (const [, { connection }] of this.instances) {
      await connection.end();
    }
    this.instances.clear();
  }
}

export default DatabaseFactory;
