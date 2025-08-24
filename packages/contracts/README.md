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
  ServiceProviderContract,
} from '@blitzbun/contracts';

// Use in your implementations
export class MyController {
  async handle(request: HttpRequestContract, response: HttpResponseContract) {
    // Your controller logic
  }
}
```

## Documentation

This package provides type definitions and interfaces used across the BlitzBun framework. For detailed usage examples and implementation guides, refer to the documentation in the respective packages:

- **Core Framework**: See [@blitzbun/core documentation](../core/docs/)
- **HTTP Features**: See [@blitzbun/http documentation](../http/docs/)

### Contract Categories

**Core Contracts** - Application, Container, Providers, Commands, Jobs
**HTTP Contracts** - Request, Response, Routing, Validation, WebSocket
**Data Contracts** - Repository, Cache, Logger, Database models

## Contributing

This package contains only TypeScript interfaces and type definitions. Changes should maintain backward compatibility and follow established naming conventions.
