/* eslint-disable security/detect-object-injection */
import { ApplicationContract, ConfigServiceContract } from '../../contracts';
import AppProvider from '../../provider';
import { AppRegistry, DBClient, DBConfig, DrizzleClient } from '../../types';
import { createMySQLClient } from './dialects/mysql';
import { createPostgresClient } from './dialects/postgres';

const connections = {
  [DBClient.MySQL]: createMySQLClient,
  [DBClient.PostgreSQL]: createPostgresClient,
} as const satisfies Record<DBClient, <TSchema extends Record<string, unknown> = Record<string, never>>(config: DBConfig) => Promise<DrizzleClient<TSchema>>>;

export class DatabaseServiceProvider<T extends AppRegistry> extends AppProvider<T> {
  register(app: ApplicationContract<T>): void {
    const configService = app.get('config') as ConfigServiceContract;

    app.use('db', async <TSchema extends Record<string, unknown> = Record<string, never>>(client: DBClient): Promise<DrizzleClient<TSchema>> => {
      const connectionFactory = connections[client];
      const config = configService.get(`db.${client}`) as unknown as DBConfig;
      if (!connectionFactory) {
        throw new Error(`Unsupported DB client: ${client}`);
      }
      return connectionFactory<TSchema>(config);
    });
  }
}
