# BlitzBun Framework

A modern, Laravel-inspired web framework built with Bun and TypeScript for ultra-fast, low-latency applications.

## What is BlitzBun?

BlitzBun is a high-performance web framework that brings the elegant syntax and developer experience of Laravel to the blazing-fast runtime of Bun. It's designed for developers who want to build scalable web applications without compromising on speed or developer productivity.

> **Status: Work in Progress** ⚠️

![Work in Progress](https://img.shields.io/badge/status-work%20in%20progress-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-0.1.0--alpha-lightgrey)

A high-performance, bun-based framework for building lightning-fast applications.

## ⚠️ Project Status

This project is currently under active development and is not yet ready for production use. Features may be incomplete, unstable, or subject to change.

## Why BlitzBun?

- **⚡ Lightning Fast**: Built on Bun runtime, delivering exceptional performance for low-latency applications
- **🎯 Laravel-Inspired**: Familiar patterns and elegant syntax for PHP/Laravel developers transitioning to TypeScript
- **🛡️ Secure by Default**: Built-in security features including rate limiting, input validation, and secure headers
- **🏗️ Clean Architecture**: Modular design with dependency injection, service providers, and clear separation of concerns
- **📦 TypeScript First**: Full TypeScript support with strong typing throughout the framework
- **🔧 Developer Friendly**: Intuitive APIs, helpful error messages, and extensive tooling

## Core Features

- **Application Container**: Powerful dependency injection container with service providers
- **HTTP Kernel**: High-performance HTTP server with middleware support
- **Routing System**: Express-like routing with parameter binding and middleware
- **Request/Response**: Rich request and response objects with validation
- **Database Integration**: Built-in ORM support with migrations
- **Caching**: Multi-driver cache system (memory, Redis)
- **WebSocket Support**: Real-time communication with WebSocket routing
- **CLI Commands**: Artisan-like command-line interface for development tasks

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- Node.js (for certain development tools)
- PostgreSQL or SQLite (for database features)

### Installation

```bash
# Clone and install dependencies
bun install

# Build packages
rm -rf packages/*/dist
bunx tsc --build --clean
bunx tsc --build

# Start development server
bun run dev

# Run tests
bun test
```

### Your First Application

```typescript
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

const app = new Application(__dirname);
const kernel = new HttpKernel(app);

// Your app is ready!
await kernel.handle();
```

## Documentation

Explore the comprehensive documentation to learn about BlitzBun's concepts and features:

### Framework Concepts

- [📱 Application](./docs/application.md) - The heart of your BlitzBun application
- [⚙️ Kernels](./docs/kernels.md) - HTTP, Console, Worker, and Cron kernels
- [📦 Container & Dependency Injection](./docs/container.md) - Service container and DI system

### HTTP Package

- [🌐 HTTP Overview](./docs/http/overview.md) - Complete HTTP package guide
- [🛣️ Routing](./docs/http/routing.md) - URL routing and parameter handling
- [🎮 Controllers](./docs/http/controllers.md) - Organized request handling
- [📥 Request & Response](./docs/http/request-response.md) - HTTP data management
- [🛡️ Middleware](./docs/http/middleware.md) - Request/response processing
- [✅ Validation](./docs/http/validation.md) - Input validation system

### Database & Storage

- [💾 Database](./docs/database.md) - Database connections and queries
- [🗃️ Models & ORM](./docs/models.md) - Data modeling and relationships
- [📋 Migrations](./docs/migrations.md) - Database schema management
- [⚡ Caching](./docs/caching.md) - High-performance caching system

### Advanced Features

- [🔌 WebSocket](./docs/websocket.md) - Real-time communication
- [📋 Commands](./docs/commands.md) - CLI command system
- [👷 Workers & Queues](./docs/workers.md) - Background job processing
- [⏰ Cron Jobs](./docs/cron.md) - Scheduled task execution

### Development & Deployment

- [🧪 Testing](./docs/testing.md) - Testing your applications
- [📊 Performance](./docs/performance.md) - Optimization and benchmarks
- [🚀 Deployment](./docs/deployment.md) - Production deployment guide

## Architecture Overview

BlitzBun follows a modular architecture inspired by Laravel:

```
BlitzBun Application
├── Application Container (IoC)
├── Service Providers
├── Kernels (HTTP/Console/Worker)
├── Routing System
├── Middleware Stack
├── Controllers & Models
└── Database Layer
```

## Contributing

BlitzBun is actively developed and we welcome contributions! Please see our contributing guide for details.

## License

BlitzBun is open-source software licensed under the MIT license.

---

_BlitzBun is inspired by Laravel's elegant design patterns, reimagined for the modern TypeScript and Bun ecosystem._
