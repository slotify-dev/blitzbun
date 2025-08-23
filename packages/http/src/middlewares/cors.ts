import {
  CorsOptions,
  HttpMethod,
  HttpMiddleware,
  HttpRequestContract,
  HttpResponseContract,
} from '@blitzbun/contracts';

const defaultOptions: CorsOptions = {
  origin: '*',
  credentials: false,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

function isOriginAllowed(
  origin: string | undefined,
  allowedOrigin: CorsOptions['origin']
): boolean {
  if (!origin) return false;

  if (typeof allowedOrigin === 'boolean') return allowedOrigin;
  if (typeof allowedOrigin === 'string')
    return allowedOrigin === '*' || allowedOrigin === origin;
  if (typeof allowedOrigin === 'function') return allowedOrigin(origin);
  if (Array.isArray(allowedOrigin)) return allowedOrigin.includes(origin);

  return false;
}

export default function createCorsMiddleware(
  options: CorsOptions = {}
): HttpMiddleware {
  const config = { ...defaultOptions, ...options };

  return async (
    req: HttpRequestContract,
    res: HttpResponseContract,
    next: (err?: unknown) => void
  ) => {
    const origin = req.getHeader('origin') || req.getHeader('Origin');
    const requestHeaders = req.getHeader('access-control-request-headers');

    // Handle preflight requests
    if (req.method === HttpMethod.OPTIONS) {
      // Set allowed origin
      if (config.origin && isOriginAllowed(origin, config.origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
      } else if (config.origin === '*') {
        res.header('Access-Control-Allow-Origin', '*');
      }

      // Set allowed methods
      if (config.methods) {
        const methods = Array.isArray(config.methods)
          ? config.methods.join(', ')
          : config.methods;
        res.header('Access-Control-Allow-Methods', methods);
      }

      // Set allowed headers
      if (config.allowedHeaders) {
        const headers = Array.isArray(config.allowedHeaders)
          ? config.allowedHeaders.join(', ')
          : config.allowedHeaders;
        res.header('Access-Control-Allow-Headers', headers);
      } else if (requestHeaders) {
        res.header('Access-Control-Allow-Headers', requestHeaders);
      }

      // Set max age
      if (config.maxAge !== undefined) {
        res.header('Access-Control-Max-Age', config.maxAge.toString());
      }

      // Set credentials
      if (config.credentials) {
        res.header('Access-Control-Allow-Credentials', 'true');
      }

      if (config.preflightContinue) {
        return next();
      }

      return res.status(config.optionsSuccessStatus || 204).text('');
    }

    // Handle actual requests
    if (config.origin && isOriginAllowed(origin, config.origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    } else if (config.origin === '*') {
      res.header('Access-Control-Allow-Origin', '*');
    }

    // Set credentials for actual requests
    if (config.credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    // Set exposed headers
    if (config.exposedHeaders) {
      const headers = Array.isArray(config.exposedHeaders)
        ? config.exposedHeaders.join(', ')
        : config.exposedHeaders;
      res.header('Access-Control-Expose-Headers', headers);
    }

    next();
  };
}
