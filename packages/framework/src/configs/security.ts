import { EnvContract, SecurityOptions } from '@blitzbun/contracts';

export default (envService: EnvContract): SecurityOptions => {
  return {
    referrerPolicy: envService.get(
      'SECURITY_REFERRER_POLICY',
      'strict-origin-when-cross-origin'
    ),
    crossOriginResourcePolicy:
      envService.get('SECURITY_CORP', 'false') === 'true',
    crossOriginEmbedderPolicy:
      envService.get('SECURITY_COEP', 'true') === 'true',
    crossOriginOpenerPolicy: envService.get('SECURITY_COOP', 'true') === 'true',
    contentTypeOptions:
      envService.get('SECURITY_CONTENT_TYPE_OPTIONS', 'true') === 'true',
    frameOptions: envService.get('SECURITY_FRAME_OPTIONS', 'DENY'),
    xssProtection: envService.get('SECURITY_XSS_PROTECTION', 'true') === 'true',
    hsts: {
      preload: envService.get('SECURITY_HSTS_PRELOAD', 'false') === 'true',
      maxAge: parseInt(envService.get('SECURITY_HSTS_MAX_AGE', '31536000'), 10),
      includeSubDomains:
        envService.get('SECURITY_HSTS_INCLUDE_SUBDOMAINS', 'true') === 'true',
    },
    contentSecurityPolicy: {
      reportOnly:
        envService.get('SECURITY_CSP_REPORT_ONLY', 'false') === 'true',
      directives: {
        'font-src': envService
          .get('SECURITY_CSP_FONT_SRC', "'self'")
          .split(','),
        'script-src': envService
          .get('SECURITY_CSP_SCRIPT_SRC', "'self'")
          .split(','),
        'default-src': envService
          .get('SECURITY_CSP_DEFAULT_SRC', "'self'")
          .split(','),
        'connect-src': envService
          .get('SECURITY_CSP_CONNECT_SRC', "'self'")
          .split(','),
        'frame-ancestors': envService
          .get('SECURITY_CSP_FRAME_ANCESTORS', "'none'")
          .split(','),
        'img-src': envService
          .get('SECURITY_CSP_IMG_SRC', "'self',data:,https:")
          .split(','),
        'style-src': envService
          .get('SECURITY_CSP_STYLE_SRC', "'self','unsafe-inline'")
          .split(','),
      },
    },
    cors: {
      origin:
        envService.get('SECURITY_CORS_ORIGIN', 'false') === 'true'
          ? true
          : false,
      credentials:
        envService.get('SECURITY_CORS_CREDENTIALS', 'false') === 'true',
    },
  };
};
