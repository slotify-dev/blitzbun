# BlitzBun

A blazing-fast, secure, and clean backend framework built with Bun and TypeScript.

## Features

- High-performance HTTP server powered by Bun
- Secure defaults: input validation, rate limiting, secure headers
- Clean architecture for scalable apps
- Built-in TypeScript support
- Easy setup and developer-friendly DX
- Benchmarks comparing Bun to Node.js frameworks

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- Node.js (for certain tools if needed)
- PostgreSQL / SQLite (optional for ORM)

### Installation

```bash
# Install library
bun install

# build packages
rm -rf packages/*/dist
bunx tsc --build --clean
bunx tsc --build

# Run tests with
bun test
```

Blizbun is inspired by laravel framework. We are building laravel style framework using typescript/bun.
Work is in progress...
