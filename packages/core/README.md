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

// Configure security middleware
const securityOptions = {
  cors: {
    origin: ['http://localhost:3000', 'https://myapp.com'],
    credentials: true,
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
    },
  },
};

// Start the HTTP server with security
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

All features are now configured through your app configuration:

```typescript
// configs/app.ts
export default (env) => ({
  // Graceful shutdown (enabled by default)
  gracefulShutdown: true,
  shutdown: {
    timeout: 30000, // 30 seconds
    signals: ['SIGTERM', 'SIGINT'],
    onSignal: async (signal) => {
      console.log(`Shutdown initiated by ${signal}`);
      // Custom cleanup here
    },
    onShutdown: async () => {
      console.log('Final cleanup...');
      // Database closing, log flushing, etc.
    },
  },

  // Security configuration  
  csp: {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://myapp.com', 'https://api.myapp.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
  },

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
SESSION_SECRET=your-session-secret-here

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

### Docker Production Setup

```dockerfile
# Dockerfile
FROM oven/bun:alpine

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Build
RUN bun run build

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S blitzbun -u 1001
USER blitzbun

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["bun", "run", "serve"]
```

### Load Balancer Configuration (nginx)

```nginx
# /etc/nginx/sites-available/myapp
upstream blitzbun_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.myapp.com;

    # SSL configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers (additional to BlitzBun)
    add_header X-Real-IP $remote_addr always;
    add_header X-Forwarded-Proto https always;

    # Health check endpoint
    location /health {
        proxy_pass http://blitzbun_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        access_log off;
    }

    # API routes
    location / {
        proxy_pass http://blitzbun_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blitzbun-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blitzbun-api
  template:
    metadata:
      labels:
        app: blitzbun-api
    spec:
      containers:
        - name: api
          image: myapp/blitzbun-api:latest
          ports:
            - containerPort: 8000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

### Monitoring with Prometheus

```typescript
// src/metrics.ts
import { createHealthCheckMiddleware } from '@blitzbun/http/middlewares';

// Custom metrics for business logic
const businessChecks = [
  {
    name: 'active-users',
    check: async () => {
      const userCount = await getUsersCount();
      return {
        status: userCount > 0 ? ('pass' as const) : ('fail' as const),
        activeUsers: userCount,
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    name: 'queue-health',
    check: async () => {
      const queueDepth = await getQueueDepth();
      return {
        status: queueDepth < 1000 ? ('pass' as const) : ('fail' as const),
        queueDepth,
        threshold: 1000,
      };
    },
  },
];

export const healthMiddleware = createHealthCheckMiddleware({
  customChecks: businessChecks,
  path: '/health',
  readinessPath: '/ready',
});
```

### Session Security in Production

```typescript
// src/middleware/session.ts
import { sessionMiddleware } from '@blitzbun/http/middlewares';

const sessionConfig = {
  name: '__Secure-SessionId', // Secure prefix
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: true, // HTTPS only
  httpOnly: true, // No JS access
  sameSite: 'Strict' as const, // CSRF protection
  domain: '.myapp.com', // Subdomain sharing
  csrfProtection: true, // Enable CSRF tokens
  regenerateOnAuth: true, // Prevent fixation
  rolling: false, // Don't extend on each request
  secret: process.env.SESSION_SECRET, // Strong secret
};

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

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Packages

- `@blitzbun/http` - HTTP server and middleware
- `@blitzbun/contracts` - TypeScript interfaces and types

---

**⚠️ Security Note**: Always keep dependencies updated and review security configurations before deploying to production. Enable HTTPS and use secure session settings in production environments.
