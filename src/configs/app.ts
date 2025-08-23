import { EnvContract } from '@blitzbun/contracts';

export default (envService: EnvContract) => {
  return {
    isDevEnv: envService.get('APP_ENV') === 'development',
    jwtToken: envService.get('JWT_SECRET'),
    port: envService.get('APP_PORT'),
    jwtLogin: true,
    log: {
      level: 'info',
    },
  };
};
