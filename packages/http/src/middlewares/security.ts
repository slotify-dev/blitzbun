import {
  HttpMiddleware,
  HttpRequestContract,
  HttpResponseContract,
  SecurityOptions,
} from '@blitzbun/contracts';
import createCorsMiddleware from './cors';

const defaultOptions: SecurityOptions = {
  referrerPolicy: 'strict-origin-when-cross-origin',
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  contentTypeOptions: true,
  frameOptions: 'DENY',
  xssProtection: true,
  hsts: {
    preload: false,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
  },
  contentSecurityPolicy: {
    reportOnly: false,
    directives: {
      'font-src': ["'self'"],
      'script-src': ["'self'"],
      'default-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'style-src': ["'self'", "'unsafe-inline'"],
    },
  },
  cors: {
    origin: false, // Disabled by default for security
    credentials: false,
  },
};

function buildCSP(directives: Record<string, string | string[]>): string {
  return Object.entries(directives)
    .map(([key, value]) => {
      const values = Array.isArray(value) ? value.join(' ') : value;
      return `${key} ${values}`;
    })
    .join('; ');
}

export default function createSecurityMiddleware(
  options: SecurityOptions = {}
): HttpMiddleware {
  const config = { ...defaultOptions, ...options };
  const corsMiddleware = config.cors
    ? createCorsMiddleware(typeof config.cors === 'object' ? config.cors : {})
    : null;

  return async (
    req: HttpRequestContract,
    res: HttpResponseContract,
    next: (err?: unknown) => void
  ) => {
    // Handle CORS first if enabled
    if (corsMiddleware) {
      let corsHandled = false;
      await corsMiddleware(req, res, (err) => {
        corsHandled = true;
        if (err) throw err;
      });

      // If CORS middleware handled the request (e.g., preflight), return early
      if (!corsHandled && req.method === 'OPTIONS') {
        return;
      }
    }

    // X-Content-Type-Options
    if (config.contentTypeOptions) {
      res.header('X-Content-Type-Options', 'nosniff');
    }

    // X-Frame-Options
    if (config.frameOptions) {
      const frameValue =
        typeof config.frameOptions === 'string' ? config.frameOptions : 'DENY';
      res.header('X-Frame-Options', frameValue);
    }

    // X-XSS-Protection
    if (config.xssProtection) {
      res.header('X-XSS-Protection', '1; mode=block');
    }

    // Strict-Transport-Security
    if (config.hsts) {
      if (typeof config.hsts === 'object') {
        const {
          maxAge = 31536000,
          includeSubDomains = true,
          preload = false,
        } = config.hsts;
        let hstsValue = `max-age=${maxAge}`;
        if (includeSubDomains) hstsValue += '; includeSubDomains';
        if (preload) hstsValue += '; preload';
        res.header('Strict-Transport-Security', hstsValue);
      } else {
        res.header(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains'
        );
      }
    }

    // Content-Security-Policy
    if (config.contentSecurityPolicy) {
      if (typeof config.contentSecurityPolicy === 'object') {
        const { directives, reportOnly = false } = config.contentSecurityPolicy;
        if (directives) {
          const cspValue = buildCSP(directives);
          const headerName = reportOnly
            ? 'Content-Security-Policy-Report-Only'
            : 'Content-Security-Policy';
          res.header(headerName, cspValue);
        }
      } else {
        res.header('Content-Security-Policy', "default-src 'self'");
      }
    }

    // Referrer-Policy
    if (config.referrerPolicy) {
      const referrerValue =
        typeof config.referrerPolicy === 'string'
          ? config.referrerPolicy
          : 'strict-origin-when-cross-origin';
      res.header('Referrer-Policy', referrerValue);
    }

    // Cross-Origin-Embedder-Policy
    if (config.crossOriginEmbedderPolicy) {
      res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    }

    // Cross-Origin-Opener-Policy
    if (config.crossOriginOpenerPolicy) {
      res.header('Cross-Origin-Opener-Policy', 'same-origin');
    }

    // Cross-Origin-Resource-Policy
    if (config.crossOriginResourcePolicy) {
      res.header('Cross-Origin-Resource-Policy', 'same-origin');
    }

    next();
  };
}
