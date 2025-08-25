# BlitzBun Core Package

The core package of the BlitzBun framework provides essential services, utilities, and security features for building production-ready web applications with TypeScript and Bun.

## 🚀 Features

### Core Services

- **Application Container**: Dependency injection container for service management
- **Configuration Management**: Environment-based configuration with type safety
- **Logging**: Structured logging with Pino and context support
- **Caching**: Redis and memory-based caching with tagging support
- **Database**: PostgreSQL and MySQL support with Drizzle ORM
- **Profiling**: Memory usage and performance monitoring

### Security Features

- **CORS Protection**: Configurable cross-origin resource sharing
- **Request Size Limits**: Body size validation and file upload restrictions
- **Session Security**: Enhanced session management with CSRF protection
- **Security Headers**: Comprehensive HTTP security headers
- **Health Monitoring**: Production-ready health check endpoints

## 📦 Installation

```bash
bun add @blitzbun/core
```

## 🔧 Configuration

### Basic Application Setup

```typescript
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

const app = new Application();
const kernel = new HttpKernel(app);

await kernel.handle();
```

## 🛡️ Security Features

### 1. CORS Middleware

```typescript
import { createCorsMiddleware } from '@blitzbun/http/middlewares';

const corsMiddleware = createCorsMiddleware({
  origin: ['http://localhost:3000', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
```

**Features:**

- ✅ Origin validation (string, array, function, boolean)
- ✅ Preflight request handling
- ✅ Credential control
- ✅ Custom headers support
- ✅ Method restrictions

### 2. Request Size Limits

Built into the request parser with configurable limits:

```typescript
import { createHttpRequest } from '@blitzbun/http/utils';

const limits = {
  maxBodySize: 1024 * 1024 * 10, // 10MB
  maxFileSize: 1024 * 1024 * 5, // 5MB per file
  maxFiles: 10, // Maximum file count
};

const req = await createHttpRequest(nativeRequest, route, limits);
```

**Features:**

- ✅ Body size validation with formatted error messages
- ✅ File upload size limits
- ✅ File count restrictions
- ✅ Content type validation
- ✅ Graceful error responses

### 3. Enhanced Session Security

```typescript
import { sessionMiddleware } from '@blitzbun/http/middlewares';

const sessionConfig = {
  name: 'sessionId',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: true,
  httpOnly: true,
  sameSite: 'Strict',
  csrfProtection: true,
  regenerateOnAuth: true,
  rolling: false,
};
```

**Security Features:**

- ✅ Secure session ID generation (32-byte hex)
- ✅ CSRF token protection with automatic validation
- ✅ Session fixation prevention
- ✅ Rolling session support
- ✅ Secure cookie settings
- ✅ Session regeneration on authentication

### 4. Health Check Endpoints

```typescript
import { createHealthCheckMiddleware } from '@blitzbun/http/middlewares';

const healthMiddleware = createHealthCheckMiddleware({
  path: '/health',
  readinessPath: '/ready',
  includeSystemInfo: true,
  customChecks: [
    {
      name: 'database',
      check: async () => {
        try {
          await db.execute('SELECT 1');
          return { status: 'pass', message: 'Database connected' };
        } catch (error) {
          return { status: 'fail', message: error.message };
        }
      },
    },
  ],
});
```

**Health Check Features:**

- ✅ `/health` endpoint for liveness checks
- ✅ `/ready` endpoint for readiness checks
- ✅ System memory monitoring
- ✅ Custom health checks support
- ✅ Detailed status reporting
- ✅ Performance timing

## 📊 Monitoring & Observability

### Health Check Response Format

```json
{
  "status": "pass",
  "version": "1.0.0",
  "serviceId": "blitzbun-app",
  "description": "Health check",
  "output": "Health check completed in 45ms",
  "checks": {
    "system:memory": {
      "status": "pass",
      "time": "2024-01-15T10:30:00.000Z",
      "output": {
        "rss": "142.29 MB",
        "heapUsed": "13.54 MB",
        "external": "3.23 MB",
        "uptime": "12.50 s"
      }
    },
    "custom:database": {
      "status": "pass",
      "time": "2024-01-15T10:30:00.000Z",
      "output": "Database connected"
    }
  }
}
```

### System Profiling

```typescript
const profiler = app.get('profiler');
const snapshot = profiler.snapshot();

console.log(`Memory Usage: ${snapshot.heapUsed}`);
console.log(`Uptime: ${snapshot.uptime}`);
```

## 🔐 Security Headers

The framework automatically applies security headers:

- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **X-XSS-Protection**: `1; mode=block`
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains`
- **Content-Security-Policy**: Configurable directives
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **CORS Headers**: When CORS is enabled

## 🗂️ File Structure

```bash
packages/core/
├── src/
│   ├── classes/
│   │   ├── application.ts      # Main application container
│   │   ├── container.ts        # Dependency injection
│   │   └── transformer.ts      # Data transformation
│   ├── lib/
│   │   ├── cache/             # Caching implementations
│   │   ├── db/                # Database clients
│   │   └── notification/      # Notification services
│   ├── services/
│   │   ├── config.ts          # Configuration service
│   │   ├── env.ts             # Environment service
│   │   ├── logger.ts          # Logging service
│   │   └── profiler.ts        # Performance profiling
│   └── utils/
│       ├── crypto.ts          # Cryptographic utilities
│       ├── date.ts            # Date utilities
│       └── common.ts          # Common utilities
└── README.md
```

## 🚦 Production Checklist

### Security

- ✅ CORS properly configured for your domains
- ✅ HTTPS enabled in production (`secure: true` for cookies)
- ✅ CSP headers configured for your assets
- ✅ Session security enabled
- ✅ Request size limits appropriate for your use case

### Monitoring

- ✅ Health checks configured
- ✅ Custom health checks for critical dependencies
- ✅ Logging configured with appropriate levels
- ✅ Performance profiling enabled

### Infrastructure

- ✅ Redis configured for sessions and caching
- ✅ Database connection pooling configured
- ✅ Environment variables properly set
- ✅ Rate limiting configured

## 🌐 Production Examples

### Complete Production Setup

```typescript
// src/index.ts
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

const app = new Application();
const kernel = new HttpKernel(app);

// 🚀 That's it! Graceful shutdown is automatically enabled
await kernel.handle();

// The kernel automatically:
// ✅ Enables graceful shutdown (configurable via config)
// ✅ Applies security middleware
// ✅ Sets up health check endpoints
// ✅ Handles SIGTERM/SIGINT signals
```

### Configuration-Based Setup

All features are now configured through separate config files for better organization:

```typescript
// configs/app.ts
export default (envService) => ({
  isDevEnv: envService.get('APP_ENV') === 'development',
  jwtToken: envService.get('JWT_SECRET'),
  port: envService.get('APP_PORT'),
  jwtLogin: true,
  log: {
    level: 'info',
  },
});
```

```typescript
// configs/security.ts
export default (envService) => ({
  referrerPolicy: envService.get(
    'SECURITY_REFERRER_POLICY',
    'strict-origin-when-cross-origin'
  ),
  crossOriginResourcePolicy:
    envService.get('SECURITY_CORP', 'false') === 'true',
  crossOriginEmbedderPolicy: envService.get('SECURITY_COEP', 'true') === 'true',
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
    reportOnly: envService.get('SECURITY_CSP_REPORT_ONLY', 'false') === 'true',
    directives: {
      'font-src': envService.get('SECURITY_CSP_FONT_SRC', "'self'").split(','),
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
});
```

```typescript
// configs/cors.ts
export default (envService) => ({
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
    .get('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With')
    .split(','),
  exposedHeaders: envService
    .get('CORS_EXPOSED_HEADERS', '')
    .split(',')
    .filter(Boolean),
});
```

```typescript
// configs/session.ts
export default (envService) => ({
  name: envService.get('SESSION_NAME', '__Secure-SessionId'),
  maxAge: parseInt(envService.get('SESSION_MAX_AGE', '604800'), 10), // 7 days
  secure: envService.get('SESSION_SECURE', 'true') === 'true',
  httpOnly: envService.get('SESSION_HTTP_ONLY', 'true') === 'true',
  sameSite: envService.get('SESSION_SAME_SITE', 'Strict'),
  domain: envService.get('SESSION_DOMAIN', undefined),
  csrfProtection: envService.get('SESSION_CSRF_PROTECTION', 'true') === 'true',
  regenerateOnAuth: envService.get('SESSION_REGENERATE_ON_AUTH', 'true') === 'true',
  rolling: envService.get('SESSION_ROLLING', 'false') === 'true',
  secret: envService.get('SESSION_SECRET', ''),
});
```

// Health checks for production dependencies
const healthChecks = [
  {
    name: 'database',
    check: async () => {
      try {
        const db = app.get('db');
        await db.execute('SELECT 1');
        return { status: 'pass' as const, message: 'Database connected' };
      } catch (error) {
        return {
          status: 'fail' as const,
          message: `Database error: ${error.message}`,
        };
      }
    },
  },
  {
    name: 'redis',
    check: async () => {
      try {
        const cache = app.get('cache');
        const testKey = `health-${Date.now()}`;
        await cache.store('redis_cache').put(testKey, 'ok', 10);
        const result = await cache.store('redis_cache').get(testKey);
        await cache.store('redis_cache').forget(testKey);

        return result === 'ok'
          ? { status: 'pass' as const, message: 'Redis connected' }
          : { status: 'fail' as const, message: 'Redis test failed' };
      } catch (error) {
        return {
          status: 'fail' as const,
          message: `Redis error: ${error.message}`,
        };
      }
    },
  },
  {
    name: 'external-api',
    check: async () => {
      try {
        const response = await fetch('https://api.stripe.com/v1/charges', {
          method: 'GET',
          headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
        });

        return response.status === 401 // Expected for invalid auth
          ? { status: 'pass' as const, message: 'Stripe API accessible' }
          : { status: 'fail' as const, message: 'Stripe API unreachable' };
      } catch (error) {
        return {
          status: 'fail' as const,
          message: `External API error: ${error.message}`,
        };
      }
    },
  },
];

const kernel = new HttpKernel(app);
await kernel.handle();

// Configure production middlewares
const server = app.get('server');
server.use(createSecurityMiddleware(securityConfig));
server.use(
  createHealthCheckMiddleware({
    customChecks: healthChecks,
    includeSystemInfo: process.env.NODE_ENV !== 'production', // Hide in prod
  })
);
```

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
APP_PORT=8000
APP_NAME=myapp-api
APP_VERSION=1.2.3

# Security
APP_JWT_TOKEN=your-super-secure-jwt-secret-here
APP_IS_PROD=true

# Session Configuration
SESSION_SECRET=your-session-secret-here
SESSION_NAME=__Secure-SessionId
SESSION_MAX_AGE=604800
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=Strict
SESSION_DOMAIN=.myapp.com
SESSION_CSRF_PROTECTION=true
SESSION_REGENERATE_ON_AUTH=true
SESSION_ROLLING=false

# Database
POSTGRES_HOST=prod-db.example.com
POSTGRES_PORT=5432
POSTGRES_DB=myapp_prod
POSTGRES_USER=myapp_user
POSTGRES_PASSWORD=secure-db-password

# Redis
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=secure-redis-password

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900 # 15 minutes
```

### Session Security in Production

```typescript
// Session configuration is now handled through configs/session.ts
import { sessionMiddleware } from '@blitzbun/http/middlewares';

// Configuration is automatically loaded from configs/session.ts
// which uses environment variables with sensible defaults

// Custom session validation
export const authenticatedSession = async (req, res, next) => {
  const session = req.getSession();

  // Check if session is authenticated
  if (!session?.userId) {
    return res.status(401).json({
      message: 'Authentication required',
      code: 401,
    });
  }

  // Check session age for sensitive operations
  const sessionAge = Date.now() - new Date(session.createdAt).getTime();
  const maxAge = 2 * 60 * 60 * 1000; // 2 hours for sensitive ops

  if (req.path.includes('/admin') && sessionAge > maxAge) {
    // Require re-authentication for admin actions
    req.sessionRegenerate();
    return res.status(403).json({
      message: 'Session expired for admin operations',
      code: 403,
      requireReauth: true,
    });
  }

  next();
};
```

## 🔄 Migration from Existing Systems

### From Express.js

BlitzBun provides similar functionality to popular Express middleware:

- **helmet** → Built-in security headers
- **cors** → `createCorsMiddleware`
- **express-session** → Enhanced session middleware
- **express-rate-limit** → Built-in rate limiting
- **compression** → Available (requires response contract updates)

### Configuration Mapping

```typescript
// Express.js
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(session({ secret: 'key', secure: true }));

// BlitzBun
const securityOptions = {
  cors: { origin: 'http://localhost:3000' },
  // helmet features built-in
};

const sessionConfig = {
  secret: 'key',
  secure: true,
  csrfProtection: true, // Enhanced security
};
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Ensure all security tests pass
4. Add documentation for new security features
5. Submit a pull request

## 📖 Complete Documentation

For in-depth guides and advanced features, see the [docs](./docs/) folder:

### Core Components

- [📱 Application](./docs/application.md) - Application container and lifecycle
- [🏗️ Container](./docs/container.md) - Dependency injection system
- [⚙️ Commands](./docs/command.md) - CLI command structure
- [📦 Providers](./docs/provider.md) - Service registration
- [🏭 Modules](./docs/modules.md) - Application modules
- [💾 Caching](./docs/caching.md) - Caching strategies
- [⚡ Jobs](./docs/job.md) - Background job processing

### Application Kernels

- [🏛️ Kernels Overview](./docs/kernels.md) - Application execution modes
- [🌐 HTTP Kernel](./docs/kernels/http-kernel.md) - Web server kernel
- [💻 Console Kernel](./docs/kernels/console-kernel.md) - CLI kernel
- [⏰ Cron Kernel](./docs/kernels/cron-kernel.md) - Scheduled tasks
- [👷 Worker Kernel](./docs/kernels/worker-kernel.md) - Background processing

### Database & Storage

- [🗃️ Database](./docs/database.md) - Database operations
- [📊 Models](./docs/models.md) - Data models
- [🏪 Repository](./docs/repository.md) - Data access layer

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Packages

- `@blitzbun/http` - HTTP server and middleware
- `@blitzbun/contracts` - TypeScript interfaces and types

---

**⚠️ Security Note**: Always keep dependencies updated and review security configurations before deploying to production. Enable HTTPS and use secure session settings in production environments.
