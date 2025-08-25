# BlitzBun Framework

A modern, Laravel-inspired web framework built with Bun and TypeScript for ultra-fast, low-latency applications.

## What is BlitzBun?

BlitzBun is a high-performance web framework that brings the elegant syntax and developer experience of Laravel to the blazing-fast runtime of Bun. It's designed for developers who want to build scalable web applications without compromising on speed or developer productivity.

> **Status: Work in Progress** ⚠️

![Work in Progress](https://img.shields.io/badge/status-work%20in%20progress-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/npm/v/%40blitzbun%2Fframework)

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

### How to install

```bash
# install using npm
npm install -g @blitzbun/create-blitzbun

# install using yarn
yarn global add @blitzbun/create-blitzbun

# install using pnpm
pnpm add -g @blitzbun/create-blitzbun

# install using bun
bun add -g @blitzbun/create-blitzbun
```

## Documentation

Explore the comprehensive documentation organized by package:

### Core Packages

- **[Contracts](./packages/contracts/README.md)** - Core interfaces and contracts that define the framework's architecture
- **[Core](./packages/core/README.md)** - Essential framework components including application container, providers, and kernels
  - [Application](./packages/core/docs/application.md) - Application bootstrapping and lifecycle
  - [Container](./packages/core/docs/container.md) - Dependency injection container
  - [Caching](./packages/core/docs/caching.md) - Multi-driver cache system
  - [Database](./packages/core/docs/database.md) - Database integration and ORM
  - [Kernels](./packages/core/docs/kernels.md) - HTTP, Console, Cron, and Worker kernels
  - [Providers](./packages/core/docs/provider.md) - Service provider architecture
  - [Commands](./packages/core/docs/command.md) - CLI command system
  - [Jobs & Queues](./packages/core/docs/job.md) - Background job processing
  - [Repository Pattern](./packages/core/docs/repository.md) - Data access layer abstraction
  - [Models](./packages/core/docs/models.md) - Database model definitions
  - [Modules](./packages/core/docs/modules.md) - Modular application architecture
- **[HTTP](./packages/http/README.md)** - HTTP server, routing, middleware, and WebSocket support
  - [Overview](./packages/http/docs/overview.md) - HTTP package overview
  - [Routing](./packages/http/docs/routing.md) - Route definition and parameter binding
  - [Controllers](./packages/http/docs/controllers.md) - Request handling and response generation
  - [Middleware](./packages/http/docs/middleware.md) - Request/response pipeline middleware
  - [Request & Response](./packages/http/docs/request-response.md) - HTTP request and response objects
  - [Validation](./packages/http/docs/validation.md) - Input validation and sanitization
  - [Transformers](./packages/http/docs/transformer.md) - Data transformation and serialization
  - [WebSocket](./packages/http/docs/websocket.md) - Real-time WebSocket communication

## Contributing

BlitzBun is actively developed and we welcome contributions! Please see our contributing guide for details.

## License

BlitzBun is open-source software licensed under the MIT license.

---

_BlitzBun is inspired by Laravel's elegant design patterns, reimagined for the modern TypeScript and Bun ecosystem._
