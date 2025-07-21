import { EnvServiceContract } from '@blitzbun/core';

export default (envService: EnvServiceContract) => ({
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
