import { EnvServiceContract } from '@blitzbun/core';

export default (envService: EnvServiceContract) => {
  return {
    isDevEnv: envService.get('APP_ENV') === 'development',
    port: envService.get('APP_PORT'),
    log: {
      level: 'info',
    },
  };
};
