import { CorsOptions, EnvContract } from '@blitzbun/contracts';

export default (envService: EnvContract): CorsOptions => {
  return {
    origin: envService.get('CORS_ORIGIN', '*'),
    credentials: envService.get('CORS_CREDENTIALS', 'false') === 'true',
    maxAge: parseInt(envService.get('CORS_MAX_AGE', '86400'), 10),
    preflightContinue:
      envService.get('CORS_PREFLIGHT_CONTINUE', 'false') === 'true',
    optionsSuccessStatus: parseInt(
      envService.get('CORS_OPTIONS_SUCCESS_STATUS', '204'),
      10
    ),
    methods: envService
      .get('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
      .split(','),
    allowedHeaders: envService
      .get(
        'CORS_ALLOWED_HEADERS',
        'Content-Type,Authorization,X-Requested-With'
      )
      .split(','),
    exposedHeaders: envService
      .get('CORS_EXPOSED_HEADERS', '')
      .split(',')
      .filter(Boolean),
  };
};
