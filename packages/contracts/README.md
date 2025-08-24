# BlitzBun Contracts

TypeScript contracts and interfaces for the BlitzBun framework. This package provides type definitions and contracts that ensure consistency across all BlitzBun packages.

## Installation

```bash
bun add @blitzbun/contracts
```

## What's Included

This package provides TypeScript interfaces and contracts for:

### Core Framework
- **Application** - Application container interface
- **Service Provider** - Service registration and bootstrapping
- **Container** - Dependency injection container
- **Command** - CLI command structure
- **Job** - Background job processing
- **Queue** - Queue job contracts
- **Transformer** - Data transformation interface

### HTTP Package
- **Request** - HTTP request interface
- **Response** - HTTP response interface  
- **Route** - Route definition contracts
- **Router** - HTTP and WebSocket routing
- **Validator** - Input validation interface
- **Server** - HTTP server contracts

### Database & Caching
- **Repository** - Data access layer interface
- **Cache** - Caching service contracts
- **Logger** - Logging service interface
- **Profiler** - Performance monitoring

## Usage

Import contracts in your application:

```typescript
import type { 
  HttpRequestContract, 
  HttpResponseContract,
  ApplicationContract,
  ServiceProviderContract
} from '@blitzbun/contracts';

// Use in your implementations
export class MyController {
  async handle(
    request: HttpRequestContract, 
    response: HttpResponseContract
  ) {
    // Your controller logic
  }
}
```

## Documentation

For detailed usage examples and framework concepts, see the [BlitzBun Documentation](../../docs/):

- [Application](../../docs/application.md) - Application container and lifecycle
- [HTTP Package](../../docs/http/overview.md) - HTTP request handling
- [Routing](../../docs/http/routing.md) - URL routing system
- [Controllers](../../docs/http/controllers.md) - Request controllers
- [Validation](../../docs/http/validator.md) - Input validation
- [Database](../../docs/database.md) - Database operations
- [Caching](../../docs/caching.md) - Caching system
- [Commands](../../docs/commands.md) - CLI commands
- [WebSocket](../../docs/websocket.md) - Real-time communication

## Contributing

This package contains only TypeScript interfaces and type definitions. Changes should maintain backward compatibility and follow established naming conventions.