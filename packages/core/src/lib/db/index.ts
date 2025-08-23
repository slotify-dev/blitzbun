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

    const configService = app.get('config');
    const factory = new DatabaseFactory(schema);

    const actualClient = configService.get('db.client') as DBClient;
    const dbConfig = configService.get(`db.${actualClient}`);

    if (!isDBConfig(dbConfig)) {
      throw new Error(`Invalid DB config for client: ${actualClient}`);
    }

    const drizzleClient: DrizzleClient<typeof schema> = await factory.get(
      actualClient,
      dbConfig
    );

    app.use('dbSchema', schema);
    app.use('db', drizzleClient);

    app.onCleanup(async () => {
      await factory.destroy();
    });
  }
}
