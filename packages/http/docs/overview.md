# HTTP Package Overview

The HTTP package is BlitzBun's comprehensive web server solution that handles HTTP requests, routing, middleware, and responses. Built on top of Bun's high-performance runtime, it provides a Laravel-inspired API for building web applications and APIs.

## What is the HTTP Package?

The HTTP package transforms your BlitzBun application into a web server capable of handling HTTP requests and responses. It provides all the tools you need to build modern web applications, from simple APIs to complex web services.

Think of it as your application's "front door" - it receives visitors (HTTP requests), processes them through your application logic, and sends back appropriate responses.

## Purpose

The HTTP package provides:

- **High-Performance Web Server**: Built on Bun's native HTTP server for maximum speed
- **Flexible Routing System**: Express-like routing with parameter binding and pattern matching
- **Middleware Pipeline**: Composable request/response processing chain
- **Rich Request/Response Objects**: Comprehensive APIs for handling HTTP data
- **WebSocket Support**: Real-time communication capabilities
- **Security Features**: Built-in security middleware and protections
- **Validation System**: Robust input validation and sanitization

## Core Components

The HTTP package includes several key components:

### [HTTP Server](../application/kernels/http-kernel.md)

- High-performance server powered by Bun's native HTTP implementation
- Graceful shutdown handling with proper resource cleanup
- Error handling with comprehensive logging and recovery
- WebSocket support for real-time features

### [Routing System](./routing.md)

- Route registration with support for GET, POST, PUT, DELETE, PATCH methods
- Parameter binding with automatic type conversion
- Route groups for organizing and applying middleware
- Route matching with efficient pattern matching algorithms

### [Request Object](./request-response.md#request-object)

- Parameter access from body, query string, and route parameters
- Header and cookie handling with easy access methods
- File upload processing for multipart form data
- Validation with built-in validator integration
- Context management for request-specific data

### [Response Object](./request-response.md#response-object)

- JSON responses with automatic serialization
- File streaming for efficient file serving
- Template rendering for server-side HTML generation
- Cookie management with secure defaults
- Status codes and headers management

### [Controllers](./controllers.md)

- Organized request handling with class-based controllers
- Dependency injection support for clean architecture
- RESTful resource controllers with standard CRUD operations
- Custom actions for specific business logic

### [Middleware System](./middleware.md)

- Request processing pipeline with composable middleware
- Built-in middleware for security, logging, CORS, and authentication
- Custom middleware support for application-specific logic
- Error handling middleware for graceful error processing

### [Validation](./validation.md)

- Input validation with comprehensive rule system
- Request data sanitization and transformation
- Error handling with detailed validation messages
- Custom validation rules for specific requirements

## Quick Start

### Basic HTTP Server

```typescript
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

// Create application and kernel
const app = new Application(__dirname);
const kernel = new HttpKernel(app);

// Start the server
await kernel.handle();
```

### Simple Routes

```typescript
// Get the router from the application
const router = app.get('router');

// Define routes
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to BlitzBun!' });
});

router.get('/users/:id', (req, res) => {
  const userId = req.param('id');
  res.json({ userId, message: `User ${userId} profile` });
});

router.post('/users', (req, res) => {
  const userData = req.getBody();
  res.json({ success: true, user: userData });
});
```

### Using Controllers

```typescript
// controllers/user-controller.ts
export class UserController {
  async index(req, res) {
    const users = await this.getUserService().getAllUsers();
    res.json({ users });
  }

  async show(req, res) {
    const id = req.param('id');
    const user = await this.getUserService().findById(id);
    res.json({ user });
  }
}

// Register routes with controller
const userController = new UserController();
router.get('/users', userController.index.bind(userController));
router.get('/users/:id', userController.show.bind(userController));
```

## Built-in Features

### Automatic Security

The HTTP package automatically applies security middleware:

- Content Security Policy (CSP) headers
- CORS configuration
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting protection
- Request size limits

### Request Parsing

Automatic parsing of different content types:

- JSON requests
- Form data (application/x-www-form-urlencoded)
- Multipart form data (file uploads)
- Query parameters
- Route parameters

### WebSocket Support

Built-in WebSocket support for real-time features:

```typescript
const wsRouter = app.get('wsRouter');

wsRouter.on('chat:message', (data, ws) => {
  // Handle WebSocket messages
  ws.send({ type: 'message', data });
});
```

## Performance Features

### Request Context Isolation

Each request gets its own isolated container scope, preventing memory leaks and ensuring thread safety.

### Efficient Route Matching

Routes are compiled into efficient regular expressions for fast matching, even with hundreds of routes.

### Streaming Support

Large files and responses can be streamed efficiently without loading everything into memory.

## Configuration

Configure the HTTP server through your application's config files:

```typescript
// configs/app.ts
export default (env: EnvService) => ({
  port: env.get('APP_PORT', 8000),
  host: env.get('APP_HOST', 'localhost'),

  // Security settings
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },

  // CORS settings
  cors: {
    origin: env.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
```

## Architecture Overview

The HTTP package follows a clean architecture pattern:

```
HTTP Request
    ↓
HTTP Server
    ↓
Route Matching
    ↓
Middleware Pipeline
    ↓
Controller Action
    ↓
Service Layer
    ↓
Response Generation
    ↓
HTTP Response
```

## Complete Example

Here's a complete HTTP application example:

```typescript
// src/index.ts
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

// Create application
const app = new Application(__dirname);
const router = app.get('router');

// Basic routes
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BlitzBun!',
    version: '1.0.0',
  });
});

// API routes with validation
router.post('/api/users', async (req, res) => {
  const validator = req.getValidator('users');
  const userData = await validator.validate(req.getBody(), {
    name: 'required|string|min:2',
    email: 'required|email|unique:users',
  });

  const userService = app.get('userService');
  const user = await userService.create(userData);

  res.status(201).json({
    success: true,
    user,
  });
});

// Start server
const kernel = new HttpKernel(app);
await kernel.handle();

console.log('🚀 BlitzBun server is running!');
```

## HTTP Package Components

Explore the detailed documentation for each HTTP package component:

### Core Features

- [🛣️ Routing](./routing.md) - URL routing and parameter handling
- [🎮 Controllers](./controllers.md) - Organized request handling
- [📥 Request & Response](./request-response.md) - HTTP data management
- [🛡️ Middleware](./middleware.md) - Request/response processing
- [✅ Validation](./validation.md) - Input validation and sanitization

### Advanced Features

- [🔌 WebSocket](./websocket.md) - Real-time communication
- [📁 File Uploads](./file-uploads.md) - Handle file uploads securely
- [🔐 Authentication](./authentication.md) - User authentication and authorization
- [⚡ Caching](./caching.md) - Response caching strategies
- [📊 Rate Limiting](./rate-limiting.md) - Protect against abuse

## Best Practices

1. **Use Route Groups**: Organize related routes with groups and middleware
2. **Controller Organization**: Keep controllers focused and use dependency injection
3. **Middleware Order**: Apply middleware in the correct order (auth before permissions)
4. **Error Handling**: Always handle errors gracefully with proper HTTP status codes
5. **Validation**: Validate all input data before processing
6. **Security**: Use built-in security middleware and keep it updated
7. **Performance**: Optimize database queries and use caching where appropriate

## Next Steps

Start with the core concepts and gradually explore advanced features:

1. **Start Here**: [HTTP Kernel](../application/kernels/http-kernel.md) - Set up your web server
2. **Learn Routing**: [Routing](./routing.md) - Define your application routes
3. **Organize Code**: [Controllers](./controllers.md) - Structure your request handlers
4. **Handle Data**: [Request & Response](./request-response.md) - Work with HTTP data
5. **Add Processing**: [Middleware](./middleware.md) - Add request processing logic
6. **Validate Input**: [Validation](./validation.md) - Ensure data quality

For related concepts, see:

- [Application](../application/application.md) - Understanding the application foundation
- [Container & Dependency Injection](../application/container.md) - Service management
- [Kernels Overview](../application/kernels.md) - Different application modes
