# Container & Dependency Injection Overview

The Container is BlitzBun's powerful dependency injection system that manages all your application's services and their dependencies. It provides a clean, organized way to register, resolve, and manage services throughout your application lifecycle.

## What is Dependency Injection?

Dependency Injection (DI) is a design pattern where instead of creating dependencies inside a class, you "inject" them from the outside. It's like having a personal assistant who brings you exactly what you need, when you need it.

### The Problem Without DI

```typescript
class UserController {
  private database: Database;
  private logger: Logger;

  constructor() {
    // Tightly coupled - hard to test and change
    this.database = new PostgresDatabase('localhost:5432');
    this.logger = new FileLogger('/var/log/app.log');
  }
}
```

### The Solution With DI

```typescript
class UserController {
  constructor(
    private database: Database,
    private logger: Logger
  ) {
    // Dependencies are injected - flexible and testable
  }
}
```

## What is the Container?

The Container is a service locator that:

- **Stores Services**: Keeps track of all your application's services
- **Resolves Dependencies**: Automatically provides services when requested
- **Manages Lifecycle**: Handles creation, sharing, and cleanup of services
- **Provides Isolation**: Creates scoped containers for different contexts
- **Enables Testing**: Makes it easy to swap services for testing

## Container Components

The BlitzBun container system includes several key concepts:

### [Service Container](./container/service-container.md)

The core container that stores and manages service instances.

- Service registration and resolution
- Type-safe service keys
- Container cloning for scoped contexts
- Service lifecycle management

### [Service Providers](./container/service-providers.md)

Classes that organize and bootstrap related services.

- Service registration logic
- Bootstrap and shutdown hooks
- Modular service organization
- Configuration-based setup

### [Dependency Injection Patterns](./container/dependency-injection.md)

Common patterns for using DI effectively.

- Constructor injection
- Factory patterns
- Service interfaces
- Scoped services

### [Testing with DI](./container/testing.md)

How to leverage DI for better testing.

- Mock services
- Test-specific containers
- Integration testing strategies
- Service stubbing

## Quick Start

### Basic Service Registration

```typescript
import { Application } from '@blitzbun/core';

const app = new Application(__dirname);

// Register a simple service
app.use('userService', new UserService());

// Register with dependencies
app.use('emailService', new EmailService(app.get('config'), app.get('logger')));

// Use the service
const userService = app.get('userService');
const users = await userService.getAllUsers();
```

### Using Service Providers

```typescript
// providers/email-provider.ts
import { AppProvider } from '@blitzbun/core';

export class EmailServiceProvider extends AppProvider<AppRegistry> {
  register(app: ApplicationContract): void {
    app.use(
      'emailService',
      new EmailService(app.get('config'), app.get('logger'))
    );
  }

  async boot(app: ApplicationContract): Promise<void> {
    const emailService = app.get('emailService');
    await emailService.connect();
  }
}

// Register the provider
app.registerProvider(new EmailServiceProvider());
```

### Controller with DI

```typescript
// controllers/user-controller.ts
export class UserController {
  constructor(private app: ApplicationContract) {}

  async createUser(req, res) {
    // Access services through the container
    const userService = this.app.get('userService');
    const emailService = this.app.get('emailService');
    const logger = this.app.get('logger');

    try {
      const user = await userService.create(req.getBody());
      await emailService.sendWelcomeEmail(user);
      logger.info('User created', { userId: user.id });

      res.status(201).json({ success: true, user });
    } catch (error) {
      logger.error('User creation failed', { error });
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

## Architecture Overview

The container follows a layered architecture:

```bash
Application
    ↓
Service Providers
    ↓
Service Container
    ↓
Service Instances
    ↓
Business Logic
```

## Container Concepts

Explore the detailed documentation for each container concept:

### Core Concepts

- [🗂️ Service Container](./container/service-container.md) - Core container functionality
- [⚙️ Service Providers](./container/service-providers.md) - Service organization and bootstrapping
- [💉 Dependency Injection](./container/dependency-injection.md) - DI patterns and best practices
- [🧪 Testing with DI](./container/testing.md) - Testing strategies using dependency injection

### Advanced Topics

- [🔄 Service Lifecycles](./container/lifecycles.md) - Managing service creation and cleanup
- [🎯 Scoped Containers](./container/scoping.md) - Request-specific and context-aware containers
- [🏭 Factory Patterns](./container/factories.md) - Dynamic service creation
- [🔌 Service Interfaces](./container/interfaces.md) - Contract-based development

## Best Practices

1. **Use Interfaces**: Define service contracts for better testing and flexibility
2. **Single Responsibility**: Each service should have a focused responsibility
3. **Lazy Loading**: Use factory functions for expensive services
4. **Error Handling**: Handle service resolution errors gracefully
5. **Provider Organization**: Group related services in providers
6. **Type Safety**: Leverage TypeScript for type-safe service resolution
7. **Testing**: Always provide mock implementations for testing

## Common Patterns

### Repository Pattern

```typescript
// Register repository and service
app.use('userRepository', new UserRepository(app.get('database')));
app.use('userService', new UserService(app.get('userRepository')));
```

### Service Layer Pattern

```typescript
// Layer services appropriately
app.use('userService', new UserService(app.get('userRepository')));
app.use('userController', new UserController(app.get('userService')));
```

### Decorator Pattern

```typescript
// Add functionality through decoration
app.use('baseEmailService', new EmailService());
app.use(
  'emailService',
  new RateLimitedEmailService(app.get('baseEmailService'))
);
```

## Next Steps

Start with the core concepts and gradually explore advanced patterns:

1. **Start Here**: [Service Container](./container/service-container.md) - Learn the basics
2. **Organize Services**: [Service Providers](./container/service-providers.md) - Structure your services
3. **Learn Patterns**: [Dependency Injection](./container/dependency-injection.md) - Master DI patterns
4. **Test Effectively**: [Testing with DI](./container/testing.md) - Write better tests

For related concepts, see:

- [Application](./application.md) - How the Application uses the Container
- [HTTP Controllers](./http/controllers.md) - Using DI in HTTP handlers
- [Kernels](./kernels.md) - How different kernels leverage the container
