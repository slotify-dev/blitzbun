# Service Container

The Service Container is the core of BlitzBun's dependency injection system. It stores, manages, and resolves service instances throughout your application, providing a centralized registry for all your application's dependencies.

## What is the Service Container?

The Service Container is like a smart warehouse for your application's services. It keeps track of what services are available, how to create them, and when to provide them to different parts of your application.

Think of it as a highly organized toolbox - you put tools (services) in labeled compartments, and when you need a specific tool, you just ask for it by name and the container provides it instantly.

## Purpose

The Service Container provides:

- **Service Registration**: Store service instances with unique keys
- **Service Resolution**: Retrieve services by their registered keys
- **Type Safety**: Full TypeScript support with strongly-typed service keys
- **Service Sharing**: Share single instances across your application
- **Container Cloning**: Create isolated copies for scoped operations
- **Lifecycle Management**: Handle service creation and cleanup

## Basic Container Operations

### Service Registration

The most basic operation is registering services in the container:

```typescript
import { Application } from '@blitzbun/core';

const app = new Application(__dirname);

// Register a simple service
app.use('userService', new UserService());

// Register with dependencies
const emailService = new EmailService(
  app.get('config'),
  app.get('logger')
);
app.use('emailService', emailService);

// Register a factory function (lazy loading)
app.use('paymentService', () => {
  const config = app.get('config');
  return new StripeService(config.get('stripe.secret_key'));
});
```

### Service Resolution

Retrieving services from the container:

```typescript
// Get a service
const userService = app.get('userService');
const users = await userService.getAllUsers();

// Check if service exists
if (app.has('emailService')) {
  const emailService = app.get('emailService');
  await emailService.send('user@example.com', 'Welcome!');
}

// Type-safe resolution with generics
const userService = app.get<UserService>('userService');
```

### Service Keys and Type Safety

BlitzBun provides type-safe service resolution:

```typescript
// Define your service registry type
interface AppRegistry {
  userService: UserService;
  emailService: EmailService;
  paymentService: PaymentService;
  database: DatabaseConnection;
  logger: Logger;
  config: ConfigService;
}

// The container is now type-safe
const app = new Application<AppRegistry>(__dirname);

// TypeScript will enforce correct types
const userService: UserService = app.get('userService'); // ✅ Correct
const wrongType: EmailService = app.get('userService');  // ❌ Type error
```

## Advanced Container Usage

### Factory Services

Use factory functions for lazy loading and dependency resolution:

```typescript
// Simple factory
app.use('databaseConnection', () => {
  const config = app.get('config');
  return new DatabaseConnection(config.get('database.url'));
});

// Factory with complex logic
app.use('paymentProcessor', () => {
  const config = app.get('config');
  const logger = app.get('logger');
  
  const provider = config.get('payment.provider');
  
  switch (provider) {
    case 'stripe':
      return new StripeProcessor(config.get('stripe'), logger);
    case 'paypal':
      return new PaypalProcessor(config.get('paypal'), logger);
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
});

// Singleton factory (created once, reused)
let cacheInstance: CacheService | null = null;
app.use('cache', () => {
  if (!cacheInstance) {
    const config = app.get('config');
    cacheInstance = new CacheService(config.get('cache'));
  }
  return cacheInstance;
});
```

### Conditional Service Registration

Register different services based on environment or configuration:

```typescript
const env = app.get('env');
const config = app.get('config');

// Environment-based services
if (env.get('NODE_ENV') === 'production') {
  app.use('logger', new ProductionLogger());
} else {
  app.use('logger', new DevelopmentLogger());
}

// Configuration-based services
if (config.get('cache.driver') === 'redis') {
  app.use('cache', new RedisCache(config.get('cache.redis')));
} else {
  app.use('cache', new MemoryCache());
}

// Feature flag-based services
if (config.get('features.email_queue', false)) {
  app.use('emailService', new QueuedEmailService(
    app.get('queue'),
    app.get('config')
  ));
} else {
  app.use('emailService', new DirectEmailService(app.get('config')));
}
```

### Service Composition

Build complex services by composing simpler ones:

```typescript
// Base services
app.use('httpClient', new HttpClient());
app.use('database', new DatabaseService());
app.use('cache', new CacheService());

// Composed services
app.use('apiService', new ApiService(
  app.get('httpClient'),
  app.get('cache'),
  app.get('logger')
));

app.use('userService', new UserService(
  app.get('database'),
  app.get('cache'),
  app.get('logger')
));

app.use('authService', new AuthService(
  app.get('userService'),
  app.get('apiService'),
  app.get('config')
));

// High-level composed service
app.use('applicationService', new ApplicationService(
  app.get('userService'),
  app.get('authService'),
  app.get('apiService')
));
```

## Container Scoping

### Scoped Containers for Requests

Create isolated containers for specific contexts:

```typescript
// HTTP request handling with scoped container
export async function handleRequest(request: Request, response: Response) {
  // Clone the main container
  const scopedContainer = app.getContainer().clone();
  
  // Add request-specific services
  scopedContainer.bind('currentRequest', request);
  scopedContainer.bind('currentResponse', response);
  scopedContainer.bind('requestId', generateRequestId());
  
  // Run request processing in scoped context
  await AppContext.run(scopedContainer, async () => {
    // All services resolved here use the scoped container
    const controller = new UserController(app);
    await controller.handleRequest();
  });
}
```

### Scoped Services in Controllers

```typescript
export class OrderController {
  constructor(private app: ApplicationContract) {}

  async processOrder(req: HttpRequestContract, res: HttpResponseContract) {
    // Get scoped container from request context
    const scopedContainer = app.getContainer().clone();
    
    // Add order-specific services
    const order = req.getBody();
    scopedContainer.bind('currentOrder', order);
    scopedContainer.bind('orderProcessor', new OrderProcessor(
      order,
      app.get('paymentService'),
      app.get('inventoryService')
    ));
    
    await AppContext.run(scopedContainer, async () => {
      // Process order with scoped services
      const processor = scopedContainer.resolve('orderProcessor');
      const result = await processor.process();
      
      res.json({ success: true, order: result });
    });
  }
}
```

## Service Resolution Patterns

### Constructor Injection

```typescript
class UserController {
  private userService: UserService;
  private emailService: EmailService;
  private logger: Logger;

  constructor(app: ApplicationContract) {
    // Resolve dependencies in constructor
    this.userService = app.get('userService');
    this.emailService = app.get('emailService');
    this.logger = app.get('logger');
  }

  async createUser(userData: any) {
    const user = await this.userService.create(userData);
    await this.emailService.sendWelcomeEmail(user);
    this.logger.info('User created', { userId: user.id });
    return user;
  }
}
```

### Property Injection

```typescript
class UserController {
  constructor(private app: ApplicationContract) {}

  async createUser(userData: any) {
    // Resolve dependencies when needed
    const userService = this.app.get('userService');
    const emailService = this.app.get('emailService');
    const logger = this.app.get('logger');

    const user = await userService.create(userData);
    await emailService.sendWelcomeEmail(user);
    logger.info('User created', { userId: user.id });
    return user;
  }
}
```

### Method Injection

```typescript
class UserController {
  constructor(private app: ApplicationContract) {}

  async createUser(
    userData: any,
    userService = this.app.get('userService'),
    emailService = this.app.get('emailService'),
    logger = this.app.get('logger')
  ) {
    const user = await userService.create(userData);
    await emailService.sendWelcomeEmail(user);
    logger.info('User created', { userId: user.id });
    return user;
  }
}
```

## Error Handling

### Service Resolution Errors

```typescript
// Safe service resolution
function safeResolve<T>(app: ApplicationContract, key: string): T | null {
  try {
    if (app.has(key)) {
      return app.get(key);
    }
    return null;
  } catch (error) {
    console.error(`Failed to resolve service '${key}':`, error.message);
    return null;
  }
}

// Usage
const userService = safeResolve<UserService>(app, 'userService');
if (userService) {
  const users = await userService.getAllUsers();
}

// With fallback
function resolveWithFallback<T>(
  app: ApplicationContract, 
  primary: string, 
  fallback: string
): T {
  if (app.has(primary)) {
    return app.get(primary);
  }
  
  if (app.has(fallback)) {
    return app.get(fallback);
  }
  
  throw new Error(`Neither '${primary}' nor '${fallback}' services are available`);
}

// Usage
const emailService = resolveWithFallback<EmailService>(
  app,
  'emailService',
  'fallbackEmailService'
);
```

### Container Validation

```typescript
// Validate required services are registered
function validateServices(app: ApplicationContract, requiredServices: string[]) {
  const missing: string[] = [];
  
  for (const service of requiredServices) {
    if (!app.has(service)) {
      missing.push(service);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required services: ${missing.join(', ')}`);
  }
}

// Usage
const requiredServices = [
  'database',
  'logger',
  'config',
  'userService',
  'emailService'
];

try {
  validateServices(app, requiredServices);
  console.log('✅ All required services are registered');
} catch (error) {
  console.error('❌ Service validation failed:', error.message);
  process.exit(1);
}
```

## Container Debugging

### Service Introspection

```typescript
// Debug helper to inspect container contents
function debugContainer(app: ApplicationContract) {
  const container = app.getContainer();
  
  console.log('📦 Container Contents:');
  console.log('====================');
  
  // This would require exposing bindings publicly or via debug method
  // For now, we'll track registered services manually
  const registeredServices = [
    'config', 'env', 'logger', 'profiler', // Core services
    'database', 'cache', 'queue',          // Infrastructure
    'userService', 'emailService'          // Application services
  ];
  
  registeredServices.forEach(service => {
    const hasService = app.has(service);
    const status = hasService ? '✅' : '❌';
    console.log(`${status} ${service}`);
    
    if (hasService) {
      try {
        const instance = app.get(service);
        console.log(`    Type: ${instance.constructor.name}`);
      } catch (error) {
        console.log(`    Error: ${error.message}`);
      }
    }
  });
}

// Usage in development
if (process.env.NODE_ENV === 'development') {
  debugContainer(app);
}
```

### Service Dependency Graph

```typescript
// Track service dependencies (conceptual)
class ServiceTracker {
  private dependencies = new Map<string, string[]>();
  
  trackDependency(service: string, dependency: string) {
    if (!this.dependencies.has(service)) {
      this.dependencies.set(service, []);
    }
    this.dependencies.get(service)!.push(dependency);
  }
  
  printDependencyGraph() {
    console.log('📊 Service Dependency Graph:');
    console.log('============================');
    
    for (const [service, deps] of this.dependencies) {
      console.log(`${service}:`);
      deps.forEach(dep => console.log(`  └── ${dep}`));
    }
  }
}

const tracker = new ServiceTracker();

// Track when registering services
app.use('userService', (() => {
  tracker.trackDependency('userService', 'database');
  tracker.trackDependency('userService', 'logger');
  
  return new UserService(
    app.get('database'),
    app.get('logger')
  );
})());

// Print graph in development
if (process.env.NODE_ENV === 'development') {
  tracker.printDependencyGraph();
}
```

## Performance Considerations

### Lazy Loading

```typescript
// Expensive service that should be loaded only when needed
app.use('expensiveService', () => {
  console.log('🔄 Creating expensive service...');
  return new ExpensiveService();
});

// Service will only be created when first requested
const service = app.get('expensiveService'); // Service created here
```

### Service Caching

```typescript
// Cache resolved services to avoid repeated factory calls
const serviceCache = new Map<string, any>();

function getCachedService<T>(app: ApplicationContract, key: string): T {
  if (serviceCache.has(key)) {
    return serviceCache.get(key);
  }
  
  const service = app.get(key);
  serviceCache.set(key, service);
  return service;
}

// Usage
const userService = getCachedService<UserService>(app, 'userService');
```


## Next Steps

- [Service Providers](./service-providers.md) - Organize services with providers
- [Dependency Injection](./dependency-injection.md) - Learn DI patterns
- [Testing with DI](./testing.md) - Test your services effectively
- [Container Overview](../container.md) - Back to container overview