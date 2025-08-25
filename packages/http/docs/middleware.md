# Middleware

Middleware functions are the building blocks of request processing in BlitzBun. They sit between the incoming request and your final route handler, allowing you to inspect, modify, authenticate, log, or reject requests before they reach your application logic.

## What is Middleware?

Middleware is like a series of filters that HTTP requests pass through before reaching your application. Each middleware function can:

- Examine the request
- Modify the request or response
- Perform authentication or authorization
- Log request information
- Handle errors
- Stop the request chain or continue to the next middleware

Think of middleware as airport security checkpoints - each checkpoint (middleware) performs specific checks before allowing travelers (requests) to proceed to their final destination (route handler).

## Purpose

Middleware provides:

- **Request Processing**: Inspect and modify incoming requests
- **Authentication & Authorization**: Verify user identity and permissions
- **Logging & Monitoring**: Track requests and performance metrics
- **Error Handling**: Catch and handle errors gracefully
- **Data Transformation**: Transform request/response data
- **Security**: Apply security measures like rate limiting and input sanitization
- **Caching**: Implement response caching strategies

## Basic Middleware Structure

### Simple Middleware Function

```typescript
// Basic middleware signature
const simpleMiddleware = async (req, res, next) => {
  // Do something with the request
  console.log(`${req.method} ${req.path}`);

  // Continue to next middleware or route handler
  next();
};

// Using middleware
router.get('/protected', simpleMiddleware, (req, res) => {
  res.json({ message: 'This route uses middleware' });
});
```

### Middleware with Request Modification

```typescript
const addTimestamp = async (req, res, next) => {
  // Add timestamp to request
  req.timestamp = new Date().toISOString();

  // Continue processing
  next();
};

const addRequestId = async (req, res, next) => {
  // Add unique request ID
  req.requestId = Math.random().toString(36).substring(7);

  next();
};

// Chain multiple middleware
router.get('/api/data', addTimestamp, addRequestId, (req, res) => {
  res.json({
    data: 'example',
    timestamp: req.timestamp,
    requestId: req.requestId,
  });
});
```

### Middleware with Response Modification

```typescript
const addResponseHeaders = async (req, res, next) => {
  // Add custom headers to all responses
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Powered-By', 'BlitzBun');

  next();
};

const measureResponseTime = async (req, res, next) => {
  const startTime = Date.now();

  // Add hook to run after response is sent
  res.onEnd(() => {
    const duration = Date.now() - startTime;
    console.log(`Request took ${duration}ms`);
  });

  next();
};
```

## Authentication Middleware

### Basic Authentication

```typescript
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.bearerToken();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required',
      });
    }

    // Verify token
    const authService = app.get('authService');
    const user = await authService.verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Add user to request context
    req.setUser(user);

    // Continue to next middleware
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// Usage
router.get('/profile', authMiddleware, (req, res) => {
  const user = req.getUser();
  res.json({ user });
});
```

### Role-Based Authorization

```typescript
const requireRole = (roles: string | string[]) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    const user = req.getUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      });
    }

    next();
  };
};

// Usage
router.get('/admin', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin only content' });
});

router.get(
  '/moderator',
  authMiddleware,
  requireRole(['admin', 'moderator']),
  (req, res) => {
    res.json({ message: 'Admin or moderator content' });
  }
);
```

### Permission-Based Authorization

```typescript
const requirePermission = (permission: string) => {
  return async (req, res, next) => {
    const user = req.getUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const permissionService = app.get('permissionService');
    const hasPermission = await permissionService.userHasPermission(
      user.id,
      permission
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${permission}`,
      });
    }

    next();
  };
};

// Usage
router.delete(
  '/posts/:id',
  authMiddleware,
  requirePermission('posts.delete'),
  (req, res) => {
    // Delete post logic
  }
);
```

## Validation Middleware

### Request Validation

```typescript
const validateRequest = (rules: object) => {
  return async (req, res, next) => {
    try {
      const validator = req.getValidator('request');

      // Validate request body
      const validatedData = await validator.validate(req.getBody(), rules);

      // Replace request body with validated data
      req.setValidatedData(validatedData);

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
};

// Usage
router.post(
  '/users',
  validateRequest({
    name: 'required|string|min:2|max:255',
    email: 'required|email|unique:users',
    password: 'required|string|min:8',
  }),
  async (req, res) => {
    const validatedData = req.getValidatedData();
    const user = await userService.create(validatedData);
    res.status(201).json({ success: true, user });
  }
);
```

### Parameter Validation

```typescript
const validateParams = (paramRules: object) => {
  return async (req, res, next) => {
    try {
      const validator = req.getValidator('params');

      // Get route parameters
      const params = {};
      Object.keys(paramRules).forEach((key) => {
        params[key] = req.param(key);
      });

      // Validate parameters
      await validator.validate(params, paramRules);

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.errors,
      });
    }
  };
};

// Usage
router.get(
  '/users/:id',
  validateParams({
    id: 'required|integer|min:1',
  }),
  async (req, res) => {
    const userId = parseInt(req.param('id'));
    const user = await userService.findById(userId);
    res.json({ user });
  }
);
```

## Logging and Monitoring Middleware

### Request Logger

```typescript
const requestLogger = async (req, res, next) => {
  const logger = app.get('logger');
  const startTime = Date.now();

  // Log request start
  logger.info('Request started', {
    method: req.method,
    path: req.path,
    userAgent: req.getHeader('user-agent'),
    ip: req.getIp(),
    requestId: req.id,
  });

  // Add response end hook
  res.onEnd(() => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
    });
  });

  next();
};

// Apply globally
app.use(requestLogger);
```

### Performance Monitoring

```typescript
const performanceMonitor = async (req, res, next) => {
  const startTime = process.hrtime();
  const startMemory = process.memoryUsage();

  // Add performance data to response headers
  res.onEnd(() => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds

    const endMemory = process.memoryUsage();
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    res.setHeader('X-Memory-Usage', `${memoryDelta} bytes`);

    // Log performance metrics
    if (duration > 1000) {
      // Log slow requests
      console.warn(
        `Slow request: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`
      );
    }
  });

  next();
};
```

## Security Middleware

### CORS Middleware

```typescript
const corsMiddleware = (options = {}) => {
  const defaultOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400, // 24 hours
  };

  const config = { ...defaultOptions, ...options };

  return async (req, res, next) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', config.origin);
    res.setHeader('Access-Control-Allow-Methods', config.methods.join(', '));
    res.setHeader(
      'Access-Control-Allow-Headers',
      config.allowedHeaders.join(', ')
    );

    if (config.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', config.maxAge.toString());
      return res.status(204).send();
    }

    next();
  };
};

// Usage
router.use(
  '/api',
  corsMiddleware({
    origin: 'https://myapp.com',
    credentials: true,
  })
);
```

### Rate Limiting

```typescript
const rateLimit = (options = {}) => {
  const { max = 100, windowMs = 15 * 60 * 1000 } = options; // 100 requests per 15 minutes
  const requests = new Map();

  return async (req, res, next) => {
    const key = req.getIp();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log for this IP
    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const requestLog = requests.get(key);

    // Remove old requests outside the window
    while (requestLog.length > 0 && requestLog[0] < windowStart) {
      requestLog.shift();
    }

    // Check if limit exceeded
    if (requestLog.length >= max) {
      const resetTime = new Date(requestLog[0] + windowMs).toISOString();

      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', resetTime);

      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((requestLog[0] + windowMs - now) / 1000),
      });
    }

    // Add current request
    requestLog.push(now);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      (max - requestLog.length).toString()
    );

    next();
  };
};

// Usage
router.use('/api', rateLimit({ max: 1000, windowMs: 60 * 60 * 1000 })); // 1000 requests per hour
```

### Security Headers

```typescript
const securityHeaders = async (req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // HSTS (only for HTTPS)
  if (
    req.getHeader('x-forwarded-proto') === 'https' ||
    req.protocol === 'https'
  ) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  next();
};

// Apply globally
app.use(securityHeaders);
```

## Error Handling Middleware

### Global Error Handler

```typescript
const errorHandler = async (error, req, res, next) => {
  const logger = app.get('logger');

  // Log error with context
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    requestId: req.id,
    user: req.getUser()?.id,
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error.status) {
    // Known HTTP errors
    res.status(error.status).json({
      success: false,
      error: error.message,
      ...(isDevelopment && { stack: error.stack }),
    });
  } else if (error.name === 'ValidationError') {
    // Validation errors
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors,
    });
  } else if (error.name === 'UnauthorizedError') {
    // Authentication errors
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  } else {
    // Unknown errors
    res.status(500).json({
      success: false,
      error: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack }),
    });
  }
};

// Apply as the last middleware
app.use(errorHandler);
```

### Async Error Wrapper

```typescript
const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error); // Pass error to error handler
    }
  };
};

// Usage - wrap async route handlers
router.get(
  '/async-route',
  asyncWrapper(async (req, res) => {
    const data = await someAsyncOperation();
    res.json({ data });
  })
);

// Or create a helper
const asyncRoute = (handler) => asyncWrapper(handler);

router.get(
  '/users/:id',
  asyncRoute(async (req, res) => {
    const user = await userService.findById(req.param('id'));
    res.json({ user });
  })
);
```

## Applying Middleware

### Global Middleware

```typescript
// Apply to all routes
app.use(requestLogger);
app.use(securityHeaders);
app.use(corsMiddleware());
```

### Route-Specific Middleware

```typescript
// Single route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected content' });
});

// Multiple middleware
router.post(
  '/admin/users',
  authMiddleware,
  requireRole('admin'),
  validateRequest(userValidationRules),
  (req, res) => {
    // Route handler
  }
);
```

### Route Group Middleware

```typescript
// Apply middleware to all routes in a group
router.group(
  {
    prefix: '/api',
    middleware: [requestLogger, corsMiddleware()],
  },
  () => {
    router.get('/users', userController.index);
    router.post('/users', userController.create);
  }
);

// Nested middleware
router.group(
  {
    prefix: '/api',
    middleware: [requestLogger],
  },
  () => {
    // Public API routes
    router.post('/auth/login', authController.login);

    // Protected API routes
    router.group(
      {
        middleware: [authMiddleware],
      },
      () => {
        router.get('/profile', userController.profile);
        router.put('/profile', userController.updateProfile);

        // Admin routes
        router.group(
          {
            prefix: '/admin',
            middleware: [requireRole('admin')],
          },
          () => {
            router.get('/users', adminController.users);
            router.delete('/users/:id', adminController.deleteUser);
          }
        );
      }
    );
  }
);
```

## Session Middleware

BlitzBun includes built-in session middleware that supports both Redis and memory storage strategies. Sessions provide persistent data storage across multiple requests for the same user.

### Configuration

Configure session settings in your session config file:

```typescript
// framework/src/configs/session.ts
export default (envService: EnvContract): SessionOptions => {
  return {
    name: envService.get('SESSION_NAME', '__Secure-SessionId'),
    maxAge: parseInt(envService.get('SESSION_MAX_AGE', '604800'), 10), // 7 days
    secure: envService.get('SESSION_SECURE', 'true') === 'true',
    httpOnly: envService.get('SESSION_HTTP_ONLY', 'true') === 'true',
    sameSite: envService.get('SESSION_SAME_SITE', 'Strict') as 'Strict' | 'Lax' | 'None',
    domain: envService.get('SESSION_DOMAIN', undefined),
    csrfProtection: envService.get('SESSION_CSRF_PROTECTION', 'true') === 'true',
    regenerateOnAuth: envService.get('SESSION_REGENERATE_ON_AUTH', 'true') === 'true',
    rolling: envService.get('SESSION_ROLLING', 'false') === 'true',
    secret: envService.get('SESSION_SECRET', ''),
    strategy: envService.get('SESSION_STRATEGY', 'memory') as 'redis' | 'memory',
  };
};
```

### Environment Variables

Set these environment variables to configure session behavior:

```bash
# Session storage strategy - 'redis' or 'memory'
SESSION_STRATEGY=redis

# Session cookie name
SESSION_NAME=__Secure-SessionId

# Session lifetime in seconds (default: 7 days)
SESSION_MAX_AGE=604800

# Security settings
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=Strict

# CSRF protection
SESSION_CSRF_PROTECTION=true

# Regenerate session ID on authentication
SESSION_REGENERATE_ON_AUTH=true

# Rolling sessions (renew on each request)
SESSION_ROLLING=false

# Session secret for signing
SESSION_SECRET=your-secret-key
```

### Storage Strategies

#### Memory Strategy (Default)
```bash
SESSION_STRATEGY=memory
```
- Uses in-memory storage via the cache service
- Fast but non-persistent across server restarts
- Suitable for development and single-server deployments

#### Redis Strategy
```bash
SESSION_STRATEGY=redis
```
- Uses Redis for persistent session storage
- Scales across multiple servers
- Suitable for production deployments

### Usage in Routes

The session middleware is automatically applied when enabled. Access session data through the request object:

```typescript
// Reading session data
router.get('/profile', (req, res) => {
  const session = req.getSession();
  const userId = session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({ userId, profile: session.userProfile });
});

// Writing session data
router.post('/login', async (req, res) => {
  const { email, password } = req.getBody();
  
  // Validate credentials
  const user = await userService.authenticate(email, password);
  
  if (user) {
    const session = req.getSession();
    session.userId = user.id;
    session.userProfile = {
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Regenerate session ID for security
    req.sessionRegenerate();
    
    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Clearing session data
router.post('/logout', (req, res) => {
  const session = req.getSession();
  
  // Clear specific session data
  delete session.userId;
  delete session.userProfile;
  
  // Or clear entire session
  // req.clearSession();
  
  res.json({ success: true, message: 'Logged out' });
});
```

### CSRF Protection

When CSRF protection is enabled, the session middleware automatically:

1. Generates a unique CSRF token for each session
2. Sets the token in the `X-CSRF-Token` response header
3. Validates the token on state-changing requests (POST, PUT, PATCH, DELETE)

#### Frontend Usage

```javascript
// Get CSRF token from response header
const csrfToken = response.headers['x-csrf-token'];

// Include in subsequent requests
fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ data: 'example' })
});
```

#### Alternative Token Sources

The middleware accepts CSRF tokens from multiple sources:
- `X-CSRF-Token` header (recommended)
- `CSRF-Token` header
- `_token` field in request body

### Session Security Features

#### Session Regeneration
```typescript
// Regenerate session ID (prevents session fixation)
req.sessionRegenerate();
```

#### Rolling Sessions
When enabled, session lifetime is renewed on each request:
```bash
SESSION_ROLLING=true
```

#### Secure Cookies
Sessions automatically use secure cookies in production and when behind HTTPS proxy.

#### Session Validation
The middleware automatically:
- Validates session existence
- Checks session expiration
- Handles session cleanup

### Custom Session Middleware

Create custom session-aware middleware:

```typescript
const requireAuth = async (req, res, next) => {
  const session = req.getSession();
  
  if (!session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  // Load user data
  const user = await userService.findById(session.userId);
  if (!user) {
    // Clear invalid session
    delete session.userId;
    return res.status(401).json({
      success: false,
      error: 'Invalid session'
    });
  }
  
  // Add user to request
  req.setUser(user);
  next();
};

// Usage
router.get('/dashboard', requireAuth, (req, res) => {
  const user = req.getUser();
  const session = req.getSession();
  
  res.json({
    user,
    lastAccess: session.lastAccessed
  });
});
```

### Session Debugging

Enable session debugging in development:

```typescript
const sessionDebug = async (req, res, next) => {
  const session = req.getSession();
  
  console.log('Session Debug:', {
    sessionId: session.id,
    isNew: session.isNew,
    data: session,
    createdAt: session.createdAt,
    lastAccessed: session.lastAccessed
  });
  
  next();
};

// Apply in development only
if (process.env.NODE_ENV === 'development') {
  app.use(sessionDebug);
}
```

## Custom Middleware Examples

### Request Size Limiter

```typescript
const requestSizeLimit = (maxSize = 1024 * 1024) => {
  // 1MB default
  return async (req, res, next) => {
    const contentLength = parseInt(req.getHeader('content-length') || '0');

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Request entity too large',
        maxSize: `${maxSize} bytes`,
      });
    }

    next();
  };
};

// Usage
router.post('/upload', requestSizeLimit(10 * 1024 * 1024), (req, res) => {
  // Handle file upload
});
```

### Cache Middleware

```typescript
const cacheResponse = (ttl = 300) => {
  // 5 minutes default
  const cache = new Map();

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() < cached.expires) {
      // Return cached response
      res.setHeader('X-Cache', 'HIT');
      res.setHeader(
        'Cache-Control',
        `public, max-age=${Math.floor((cached.expires - Date.now()) / 1000)}`
      );
      return res.json(cached.data);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          expires: Date.now() + ttl * 1000,
        });

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `public, max-age=${ttl}`);
      }

      return originalJson(data);
    };

    next();
  };
};

// Usage
router.get('/api/posts', cacheResponse(600), (req, res) => {
  // This response will be cached for 10 minutes
});
```

## Best Practices

1. **Order Matters**: Apply middleware in the correct order (auth before permissions, logging before processing)
2. **Error Handling**: Always handle errors in middleware and use try/catch for async operations
3. **Performance**: Keep middleware lightweight and avoid heavy computations
4. **Reusability**: Create reusable middleware functions that can be configured with options
5. **Security**: Apply security middleware globally and validate all inputs
6. **Logging**: Log important events and errors for debugging and monitoring
7. **Testing**: Write tests for your middleware functions to ensure they work correctly

## Next Steps

- [Validation](./validation.md) - Implement comprehensive input validation
- [Authentication](./authentication.md) - Build robust authentication systems
- [Controllers](./controllers.md) - Organize your route handlers
- [Request & Response](./request-response.md) - Master request/response handling
