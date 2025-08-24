# HTTP Kernel

The HTTP Kernel is responsible for handling web requests and serving your web application. It transforms your BlitzBun application into a high-performance web server capable of handling HTTP requests, WebSocket connections, and serving web content.

## What is the HTTP Kernel?

The HTTP Kernel is the entry point for web applications. When someone visits your website or API, the HTTP Kernel receives their request, processes it through your application's routing and middleware systems, and sends back the appropriate response.

Think of it as the receptionist at a busy office - it greets every visitor (HTTP request), figures out where they need to go (routing), makes sure they have the right permissions (middleware), and ensures they get the help they need (response).

## Purpose

The HTTP Kernel provides:

- **Web Server Management**: Starts and manages the underlying Bun HTTP server
- **Request Processing**: Handles incoming HTTP requests and WebSocket connections
- **Routing Integration**: Connects URLs to your application logic
- **Middleware Pipeline**: Processes requests through security and application middleware
- **Response Generation**: Formats and sends responses back to clients
- **Graceful Shutdown**: Properly closes connections and cleans up resources

## Basic Usage

### Starting the HTTP Server

```typescript
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

const app = new Application(__dirname);
const kernel = new HttpKernel(app);

// Start handling HTTP requests
await kernel.handle();
```

### Complete Server Setup

```typescript
// src/index.ts
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

(async () => {
  try {
    const app = new Application(__dirname);
    const kernel = new HttpKernel(app);
    
    console.log('🚀 Starting BlitzBun HTTP server...');
    await kernel.handle();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
```

This setup will:

1. Create an application instance
2. Set up HTTP routing and WebSocket support
3. Apply security middleware globally
4. Start the web server on the configured port (default: 8000)
5. Handle graceful shutdown on SIGINT/SIGTERM signals


## Configuration

### Server Configuration

Configure the HTTP server through your application's config files:

```typescript
// configs/app.ts
export default (env: EnvService) => ({
  // Server settings
  port: env.get('APP_PORT', 8000),
  host: env.get('APP_HOST', 'localhost'),
  
  // Security settings
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  
  // CORS settings
  cors: {
    origin: env.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Request limits
  limits: {
    bodySize: '10mb',
    timeout: 30000
  }
});
```

### Environment Variables

```env
# .env file
APP_PORT=3000
APP_HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
```

## Built-in Features

### Automatic Security Middleware

The HTTP Kernel automatically applies security middleware:

```typescript
// Applied automatically to all routes
server.use(createSecurityMiddleware(configService.get('app.csp', {})));
```

This includes:
- Content Security Policy (CSP) headers
- CORS configuration
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting protection
- Request size limits

### Request Logging

All HTTP requests are automatically logged:

```typescript
// Automatic request logging includes:
// - Request method and URL
// - Response status code and time
// - User agent and IP address
// - Request and response sizes
// - Unique request ID for tracing
```

### WebSocket Support

The HTTP Kernel includes built-in WebSocket support:

```typescript
// WebSocket routing is automatically available
const wsRouter = app.get('wsRouter');

wsRouter.on('chat:message', (data, ws) => {
  // Handle WebSocket messages
});
```

## Graceful Shutdown

The HTTP Kernel provides graceful shutdown capabilities:

```typescript
// Automatic graceful shutdown
server.enableGracefulShutdown({
  timeout: 30000,  // 30 second timeout
  onShutdown: async () => {
    console.log('Application shutting down gracefully');
    // Custom cleanup logic here
  },
});
```

### Custom Shutdown Handling

```typescript
// Add custom cleanup logic
app.onCleanup(async () => {
  console.log('Performing custom cleanup...');
  await closeDatabase();
  await flushCaches();
  await notifyServices();
});
```

## Error Handling

### Global Error Handling

The HTTP Kernel includes comprehensive error handling:

```typescript
// Automatic error handling includes:
// - Unhandled route errors
// - Middleware errors  
// - Application errors
// - Server errors

// Errors are automatically:
// - Logged with full context
// - Converted to appropriate HTTP responses
// - Prevented from crashing the server
```

### Custom Error Handling

```typescript
// You can add custom error handling middleware
const errorHandler = (error: Error, req, res, next) => {
  const logger = app.get('logger');
  
  logger.error('Request failed', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    requestId: req.id
  });

  if (req.isJson()) {
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.id
    });
  } else {
    res.status(500).html('<h1>Something went wrong</h1>');
  }
};

// Apply to all routes
server.use(errorHandler);
```

## Performance Features

### Request Context Isolation

Each request gets its own isolated container scope:

```typescript
// Prevents memory leaks and ensures thread safety
const scopedContainer = app.getContainer().clone();

await AppContext.run(scopedContainer, async () => {
  // All services resolved here use the scoped container
  // Request-specific data is isolated
  // No data leaks between requests
});
```

### Efficient Route Matching

Routes are compiled into efficient regular expressions:

```typescript
// Route patterns are compiled once and reused
const { pattern, keys } = parse('/users/:id/posts/:postId');
// Fast matching even with hundreds of routes
```

### Connection Management

The HTTP Kernel efficiently manages connections:

- **Connection pooling** for database and external services
- **Keep-alive connections** for better performance
- **Proper connection cleanup** on shutdown
- **Memory-efficient request handling**

## Advanced Usage

### Custom Middleware

Add custom middleware to the HTTP Kernel:

```typescript
// Global middleware (applied to all routes)
const customMiddleware = async (req, res, next) => {
  // Custom logic here
  console.log(`Processing ${req.method} ${req.path}`);
  next();
};

// This would be added in a service provider
server.use(customMiddleware);
```

### Route-Specific Configuration

Different routes can have different configurations:

```typescript
// High-traffic API routes
router.group({
  prefix: '/api',
  middleware: [rateLimitMiddleware]
}, () => {
  // Routes with rate limiting
});

// Admin routes with extra security
router.group({
  prefix: '/admin',
  middleware: [authMiddleware, adminMiddleware, auditMiddleware]
}, () => {
  // Highly secured admin routes
});
```

### Health Checks

Built-in health check support:

```typescript
// Automatic health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```


## Best Practices

1. **Use Environment Variables**: Configure port, host, and other settings via environment variables
2. **Implement Health Checks**: Always provide health check endpoints for monitoring
3. **Handle Errors Gracefully**: Implement proper error handling and logging
4. **Use Middleware Wisely**: Apply middleware at the appropriate level (global vs route-specific)
5. **Monitor Performance**: Log response times and monitor server metrics
6. **Implement Graceful Shutdown**: Always handle shutdown signals properly
7. **Security First**: Use built-in security middleware and keep it updated

## Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
Error: listen EADDRINUSE :::8000
```
Solution: Change the port in your configuration or stop the conflicting process.

**Memory Leaks**:
- Ensure proper request context isolation
- Clean up event listeners and timers
- Monitor memory usage in production

**Slow Response Times**:
- Check middleware performance
- Optimize database queries
- Use connection pooling
- Implement caching

## Next Steps

- [Routing](../../http/routing.md) - Learn how to define routes for the HTTP Kernel
- [Controllers](../../http/controllers.md) - Organize your request handlers
- [Middleware](../../http/middleware.md) - Add processing logic to requests
- [Request & Response](../../http/request-response.md) - Work with HTTP data