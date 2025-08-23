# Application Overview

The Application is the heart of every BlitzBun application. It serves as the main container that holds all your application's services, manages their lifecycle, and provides a central point for configuration and bootstrapping.

## What is the Application?

The Application is the central orchestrator of your BlitzBun framework. It manages the service container, loads configuration, coordinates service providers, and handles the application lifecycle from startup to shutdown.

Think of the Application as the "conductor" of an orchestra - it brings together all the different components (services, providers, configurations) and ensures they work together harmoniously.

## Purpose

The Application provides:

- **Service Container Management**: Central registry for all application services
- **Configuration Loading**: Automatic loading and management of configuration files
- **Service Provider Orchestration**: Coordinated bootstrapping of service providers
- **Lifecycle Management**: Proper startup, boot, and shutdown procedures
- **Path Resolution**: Consistent file and directory path management
- **Environment Integration**: Seamless integration with environment variables

## Application Components

The BlitzBun application system includes several key concepts:

### [Service Container Integration](./application/service-container-integration.md)

How the Application uses and manages the service container.

- Container creation and management
- Service registration and resolution
- Scoped container creation for isolated contexts

### [Configuration System](./application/configuration.md)

Automatic configuration loading and management.

- Config file discovery and loading
- Environment variable integration
- Configuration merging and validation
- Runtime configuration access

### [Service Provider Management](./application/service-providers.md)

Coordinated service provider registration and lifecycle.

- Provider registration and discovery
- Bootstrap sequence management
- Shutdown coordination
- Provider dependency resolution

### [Application Lifecycle](./application/lifecycle.md)

Complete application lifecycle from creation to shutdown.

- Construction phase
- Configuration loading
- Service provider bootstrapping
- Graceful shutdown procedures

### [Path Management](./application/paths.md)

Consistent path resolution throughout the application.

- Root path management
- Module path resolution
- Configuration and asset paths
- Public and storage directories

## Quick Start

### Basic Application Setup

```typescript
import { Application } from '@blitzbun/core';

// Create application instance
const app = new Application(__dirname);

// Application automatically:
// - Creates service container
// - Registers core services (env, config, logger, profiler)
// - Registers core service providers

// Boot the application
await app.boot();

// Use application services
const config = app.get('config');
const logger = app.get('logger');
const userService = app.get('userService');
```

### Application with Custom Services

```typescript
import { Application } from '@blitzbun/core';

const app = new Application(__dirname);

// Register custom services
app.use('userService', new UserService());
app.use('emailService', new EmailService(app.get('config'), app.get('logger')));

// Register service provider
app.registerProvider(new EmailServiceProvider());

// Boot application
await app.boot();

// Handle shutdown
process.on('SIGINT', async () => {
  await app.shutdown();
  process.exit(0);
});
```

### Application in Different Contexts

```typescript
// HTTP Server
import { HttpKernel } from '@blitzbun/http';

const app = new Application(__dirname);
const kernel = new HttpKernel(app);
await kernel.handle(); // Boots app internally

// Console Application
import { ConsoleKernel } from '@blitzbun/core';

const app = new Application(__dirname);
const kernel = new ConsoleKernel(app);
await kernel.handle(); // Boots app internally

// Worker Application
import { WorkerKernel } from '@blitzbun/core';

const app = new Application(__dirname);
const kernel = new WorkerKernel(app);
await kernel.handle(); // Boots app internally
```

## Core Services

The Application automatically registers several core services:

### Environment Service

```typescript
const env = app.get('env');
const nodeEnv = env.get('NODE_ENV', 'development');
const dbUrl = env.get('DATABASE_URL');
```

### Configuration Service

```typescript
const config = app.get('config');
const appName = config.get('app.name');
const dbConfig = config.get('database');
```

### Logger Service

```typescript
const logger = app.get('logger');
logger.info('Application started');
logger.error('Something went wrong', { error });
```

### Profiler Service

```typescript
const profiler = app.get('profiler');
profiler.start('operation');
// ... do work
profiler.end('operation');
```

## Application Architecture

The Application follows a structured initialization and lifecycle:

```
Application Creation
    ↓
Core Services Registration
    ↓
Core Providers Registration
    ↓
Custom Services Registration
    ↓
Custom Providers Registration
    ↓
Application Boot
    ↓
Configuration Loading
    ↓
Provider Bootstrapping
    ↓
Application Ready
    ↓
Application Shutdown
    ↓
Provider Cleanup
    ↓
Application Terminated
```

## Core Features

### Automatic Configuration Loading

The Application automatically loads configuration files:

```typescript
// configs/app.ts
export default (env: EnvService) => ({
  name: env.get('APP_NAME', 'BlitzBun App'),
  port: env.get('APP_PORT', 8000),
  debug: env.get('APP_DEBUG', false),
});

// configs/database.ts
export default (env: EnvService) => ({
  default: 'postgres',
  connections: {
    postgres: {
      host: env.get('DB_HOST', 'localhost'),
      port: env.get('DB_PORT', 5432),
      database: env.get('DB_NAME'),
      username: env.get('DB_USER'),
      password: env.get('DB_PASSWORD'),
    },
  },
});

// Access in application
const config = app.get('config');
const appName = config.get('app.name');
const dbConfig = config.get('database.connections.postgres');
```

### Service Provider Coordination

```typescript
// The Application coordinates service providers
app.registerProvider(new DatabaseServiceProvider());
app.registerProvider(new CacheServiceProvider());
app.registerProvider(new EmailServiceProvider());

await app.boot(); // Calls register() then boot() on all providers

// On shutdown
await app.shutdown(); // Calls shutdown() on all providers in reverse order
```

### Path Management

```typescript
// Application provides consistent path resolution
const rootPath = app.getRootPath(); // /path/to/your/app
const configPath = app.getConfigPath(); // /path/to/your/app/configs
const modulePath = app.getModulePath(); // /path/to/your/app/modules
const userModulePath = app.getModulePath('user'); // /path/to/your/app/modules/user
const publicPath = app.getPublicPath(); // /path/to/public
```

### Cleanup Callbacks

```typescript
// Register cleanup callbacks
app.onCleanup(async () => {
  console.log('Cleaning up database connections...');
  await database.close();
});

app.onCleanup(async () => {
  console.log('Flushing caches...');
  await cache.flush();
});

// Callbacks are executed during shutdown
await app.shutdown(); // Executes all cleanup callbacks
```

## Environment Integration

### Environment Variables

```typescript
// Automatic environment loading
const env = app.get('env');

// Get with defaults
const port = env.get('PORT', 3000);
const debug = env.get('DEBUG', false);

// Required variables
const dbUrl = env.get('DATABASE_URL'); // Throws if not set

// Type conversion
const maxConnections = env.get('MAX_CONNECTIONS', 10, 'number');
const enableFeature = env.get('ENABLE_FEATURE', false, 'boolean');
```

### Configuration with Environment

```typescript
// configs/cache.ts
export default (env: EnvService) => ({
  default: env.get('CACHE_DRIVER', 'memory'),

  stores: {
    memory: {
      driver: 'memory',
      maxSize: env.get('MEMORY_CACHE_SIZE', 100, 'number'),
    },

    redis: {
      driver: 'redis',
      host: env.get('REDIS_HOST', 'localhost'),
      port: env.get('REDIS_PORT', 6379, 'number'),
      password: env.get('REDIS_PASSWORD', null),
      database: env.get('REDIS_DB', 0, 'number'),
    },
  },
});
```


## Application Concepts

Explore the detailed documentation for each application concept:

### Core Concepts

- [🏗️ Service Container Integration](./application/service-container-integration.md) - How Application manages the container
- [⚙️ Configuration System](./application/configuration.md) - Automatic config loading and management
- [🔧 Service Provider Management](./application/service-providers.md) - Provider coordination and lifecycle
- [🔄 Application Lifecycle](./application/lifecycle.md) - From startup to shutdown
- [📁 Path Management](./application/paths.md) - Consistent path resolution

### Advanced Topics

- [🌍 Environment Integration](./application/environment.md) - Environment variable handling
- [🧪 Testing Applications](./application/testing.md) - Testing strategies for applications
- [🚀 Production Deployment](./application/deployment.md) - Production configuration and deployment
- [📊 Application Monitoring](./application/monitoring.md) - Health checks and metrics

## Best Practices

1. **Single Application Instance**: Create one application instance per process
2. **Service Organization**: Use service providers to organize related services
3. **Configuration Management**: Use configuration files instead of hardcoded values
4. **Environment Variables**: Use environment variables for deployment-specific settings
5. **Graceful Shutdown**: Always implement proper shutdown handling
6. **Error Handling**: Handle unhandled rejections and exceptions
7. **Path Consistency**: Use application path methods for consistent file access

## Common Patterns

### Service Registration Pattern

```typescript
// Register related services together
const registerUserServices = (app: Application) => {
  app.use('userRepository', new UserRepository(app.get('database')));
  app.use('userService', new UserService(app.get('userRepository')));
  app.use('userController', new UserController(app.get('userService')));
};

registerUserServices(app);
```


### Modular Application Structure

```typescript
// Organize application into modules
const registerModules = (app: Application) => {
  // User module
  app.registerProvider(new UserModuleProvider());

  // Order module
  app.registerProvider(new OrderModuleProvider());

  // Payment module
  app.registerProvider(new PaymentModuleProvider());

  // Notification module
  app.registerProvider(new NotificationModuleProvider());
};

registerModules(app);
```

## Next Steps

Start with the core concepts and gradually explore advanced topics:

1. **Start Here**: [Service Container Integration](./application/service-container-integration.md) - How Application manages services
2. **Configure**: [Configuration System](./application/configuration.md) - Set up your application configuration
3. **Organize**: [Service Provider Management](./application/service-providers.md) - Structure your services
4. **Understand**: [Application Lifecycle](./application/lifecycle.md) - Master the application flow
5. **Navigate**: [Path Management](./application/paths.md) - Handle file and directory paths

For related concepts, see:

- [Container & Dependency Injection](./container.md) - Deep dive into the service container
- [Kernels](./kernels.md) - Different ways to run your application
- [HTTP Package](./http/overview.md) - Building web applications
