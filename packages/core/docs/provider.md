# Service Providers

Service providers are the fundamental building blocks of a BlitzBun application. They are responsible for registering services into the application's service container and bootstrapping application components. Every BlitzBun application has several core providers that register essential services like database connections, caching, and configuration management.

## What are Service Providers?

Service providers are classes that extend the `AppProvider` base class and implement the `AppProviderContract` interface. They serve as the central place to:

- Register services into the dependency injection container
- Configure and initialize application components
- Set up cleanup routines for graceful shutdown
- Bootstrap modular components

## Creating a Service Provider

### Basic Structure

All service providers extend the `AppProvider` class from `@blitzbun/core`:

```typescript
import { AppProvider } from '@blitzbun/core';
import { ApplicationContract, AppRegistry } from '@blitzbun/contracts';

export default class MyServiceProvider<
  T extends AppRegistry,
> extends AppProvider<T> {
  /**
   * Register services into the container.
   * This method is required and called during application initialization.
   */
  register(app: ApplicationContract<T>): void {
    // Register your services here
    const myService = new MyService();
    app.use('myService', myService);
  }

  /**
   * Optional: Bootstrap services after all providers are registered.
   * This method runs after all providers have been registered.
   */
  async boot(app: ApplicationContract<T>): Promise<void> {
    // Optional initialization logic
    const config = app.get('config');
    const myService = app.get('myService');
    await myService.initialize(config);
  }

  /**
   * Optional: Clean up resources before shutdown.
   * This method is called in reverse order during application shutdown.
   */
  async shutdown(app: ApplicationContract<T>): Promise<void> {
    // Optional cleanup logic
    const myService = app.get('myService');
    await myService.destroy();
  }
}
```

## Provider Lifecycle

Service providers have three lifecycle methods:

### 1. `register(app)` - Required

The `register` method is called immediately when the provider is registered with the application. This is where you should:

- Bind services to the container using `app.use(key, value)`
- Register cleanup callbacks using `app.onCleanup(callback)`
- Perform any synchronous setup

```typescript
register(app: ApplicationContract<T>): void {
  const myService = new MyService();
  app.use('myService', myService);

  // Register cleanup callback
  app.onCleanup(async () => {
    await myService.close();
  });
}
```

### 2. `boot(app)` - Optional

The `boot` method is called after all providers have been registered. This is where you should:

- Access other services from the container
- Perform asynchronous initialization
- Configure services that depend on other registered services

```typescript
async boot(app: ApplicationContract<T>): Promise<void> {
  const config = app.get('config');
  const logger = app.get('logger');
  const myService = app.get('myService');

  await myService.connect(config.get('myservice.url'));
  logger.info('MyService connected successfully');
}
```

### 3. `shutdown(app)` - Optional

The `shutdown` method is called during application shutdown, in reverse order of registration. Use this for:

- Graceful cleanup of resources
- Closing connections
- Saving state before exit

```typescript
async shutdown(app: ApplicationContract<T>): Promise<void> {
  const myService = app.get('myService');
  await myService.disconnect();
}
```

## Integration with Service Container

Service providers interact with BlitzBun's service container through the `ApplicationContract`:

### Registering Services

```typescript
// Bind a service instance
app.use('serviceName', serviceInstance);

// Check if a service exists
if (app.has('logger')) {
  const logger = app.get('logger');
}

// Access registered services
const config = app.get('config');
const db = app.get('db');
```

### Container Registry

The `AppRegistry` type defines the shape of available services:

```typescript
export interface AppRegistry<T extends WsSessionData = WsSessionData> {
  env: EnvContract;
  dbSchema: DBSchema;
  config: ConfigContract;
  logger: LoggerContract;
  profiler: ProfilerContract;
  db: DrizzleClient<DBSchema>;
  cache: CacheManagerContract;
  router: HttpRouterContract;
  request: HttpRequestContract;
  wsRouter: WebSocketRouterContract<T>;
  wsSession: WSSessionManagerContract<T>;
}
```

## Provider Registration

### Core Providers

BlitzBun automatically registers core providers in the `Application` class:

```typescript
private registerCoreProviders(): void {
  this.registerProvider(new ModularAppProvider<T>());
  this.registerProvider(new CacheServiceProvider<T>());
  this.registerProvider(new DatabaseServiceProvider<T>());
}
```

### Custom Providers

Register your custom providers in your application bootstrap:

```typescript
import { Application } from '@blitzbun/core';
import MyServiceProvider from './providers/MyServiceProvider';

const app = new Application();

// Register custom provider
app.registerProvider(new MyServiceProvider());

// Register multiple providers
app.registerProviders([new MyServiceProvider(), new AnotherServiceProvider()]);

// Boot the application
await app.boot();
```

### Module Providers

For modular applications, place a provider in your module directory:

```bash
modules/
  my-module/
    provider.ts    # Default provider file
    controllers/
    models/
    ...
```

The `ModularAppProvider` will automatically discover and register module providers during the boot phase.

## Best Practices

1. **Keep registration logic simple**: The `register` method should only bind services to the container
2. **Use boot for initialization**: Perform complex initialization in the `boot` method after all services are registered
3. **Always clean up**: Register cleanup callbacks or implement the `shutdown` method for graceful resource cleanup
4. **Type safety**: Extend the `AppRegistry` interface if you're adding custom services to maintain type safety
5. **Error handling**: Implement proper error handling, especially in async methods
6. **Dependencies**: Access dependent services in the `boot` method, not in `register`

## Conclusion

Service providers are the backbone of BlitzBun applications, enabling modular, testable, and maintainable code architecture. By following the provider pattern, you can easily organize your application's services, manage their lifecycle, and ensure proper resource cleanup.
