import type {
  ApplicationContract,
  AppRegistry,
  DBClient,
  DBConfig,
  DBSchema,
  DrizzleClient,
} from '@blitzbun/contracts';

import AppProvider from '../../classes/provider';
import DatabaseFactory from './factory';
import loadSchemasFromModules from './helper';

function isDBConfig(obj: unknown): obj is DBConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'host' in obj &&
    'user' in obj &&
    'password' in obj &&
    'database' in obj
  );
}

export default class DatabaseServiceProvider<
  T extends AppRegistry,
> extends AppProvider<T> {
  async register(app: ApplicationContract<T>): Promise<void> {
    const schema: DBSchema = await loadSchemasFromModules(app);
    app.use('dbSchema', schema);
  }

  async boot(app: ApplicationContract<T>): Promise<void> {
    const schema = app.get('dbSchema') as DBSchema;

    const configService = app.get('config');
    const factory = new DatabaseFactory(schema);

    const actualClient = configService.get('db.client') as DBClient;
    if (!actualClient) {
      throw new Error(
        'Database client not configured. Make sure db.client is set in your config files.'
      );
    }

    const dbConfig = configService.get(`db.${actualClient}`);
    if (!isDBConfig(dbConfig)) {
      throw new Error(
        `Invalid or missing DB config for client: ${actualClient}. Check your db.${actualClient} configuration.`
      );
    }

    const drizzleClient: DrizzleClient<typeof schema> = await factory.get(
      actualClient,
      dbConfig
    );

    app.use('db', drizzleClient);
    app.onCleanup(async () => {
      await factory.destroy();
    });
  }
}
