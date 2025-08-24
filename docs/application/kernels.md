# Kernels Overview

Kernels are the entry points that bootstrap your BlitzBun application for different purposes. Think of kernels as different "modes" your application can run in - like having different ways to start your car for different driving conditions.

## What are Kernels?

A kernel is a specialized class that knows how to start and configure your application for a specific purpose. Each kernel takes your Application and sets it up with the right services and configurations for its specific job.

## Purpose

Kernels provide:

- **Specialized Bootstrap**: Each kernel sets up the application differently based on its needs
- **Environment Isolation**: Different kernels can run with different configurations
- **Lifecycle Management**: Proper startup, execution, and shutdown procedures
- **Error Handling**: Graceful handling of errors specific to each environment
- **Resource Management**: Efficient use of resources for each type of operation

## Available Kernels

BlitzBun provides several built-in kernels for different purposes:

### [HTTP Kernel](./kernels/http-kernel.md)

The HTTP Kernel handles web requests and serves your web application.

- Sets up HTTP and WebSocket routing
- Configures security middleware
- Starts the web server
- Handles graceful shutdown

### [Console Kernel](./kernels/console-kernel.md)

The Console Kernel manages command-line operations and CLI commands.

- Discovers and loads CLI commands
- Sets up the command-line interface
- Provides help and usage information
- Handles command execution with proper context

### [Worker Kernel](./kernels/worker-kernel.md)

The Worker Kernel processes background jobs from Redis-based queues.

- Connects to Redis for job queues
- Discovers and loads job handlers
- Processes jobs concurrently
- Handles job failures and retries

### [Cron Kernel](./kernels/cron-kernel.md)

The Cron Kernel runs scheduled tasks automatically at specified intervals.

- Discovers and loads cron job classes
- Validates cron schedules
- Prevents overlapping job execution
- Handles job failures gracefully

## Kernel Lifecycle

All kernels follow a similar lifecycle:

### 1. Initialization

```typescript
const kernel = new HttpKernel(app);
```

### 2. Bootstrap

```typescript
await kernel.handle();
```

- Application is booted
- Services are loaded and configured
- Kernel-specific setup is performed

### 3. Execution

- **HTTP Kernel**: Serves web requests
- **Console Kernel**: Executes CLI commands
- **Worker Kernel**: Processes background jobs
- **Cron Kernel**: Runs scheduled tasks

### 4. Shutdown

- Graceful cleanup of resources
- Application shutdown procedures
- Process termination

## Creating Custom Kernels

You can create custom kernels for specialized needs by following the same pattern as the built-in kernels. Each kernel is essentially an entry point script that boots the application and performs specific operations.

## Running Different Kernels

Set up different npm scripts in your `package.json`:

```json
{
  "scripts": {
    "dev": "bun --hot src/index.ts", // HTTP Kernel
    "console": "bun run src/console.ts", // Console Kernel
    "worker": "bun --hot src/worker.ts", // Worker Kernel
    "cron": "bun --hot src/cron.ts" // Cron Kernel
  }
}
```

## Best Practices

1. **One Kernel Per Process**: Each process should run only one kernel
2. **Environment Configuration**: Use different configurations for different kernels
3. **Error Handling**: Always implement proper error handling in kernel operations
4. **Graceful Shutdown**: Handle SIGINT and SIGTERM signals for clean shutdowns
5. **Resource Cleanup**: Ensure all resources are properly cleaned up on shutdown
6. **Logging**: Use the logger service for proper logging throughout kernel operations

## Next Steps

Explore the specific kernel documentation to learn how to use each type:

- [HTTP Kernel](./kernels/http-kernel.md) - Web server and request handling
- [Console Kernel](./kernels/console-kernel.md) - CLI commands and console operations
- [Worker Kernel](./kernels/worker-kernel.md) - Background job processing
- [Cron Kernel](./kernels/cron-kernel.md) - Scheduled task execution

For related concepts, see:

- [Application](./application.md) - Learn how kernels use the Application
- [Container & Dependency Injection](./container.md) - Service management in kernels
- [HTTP Package](./http/overview.md) - Deep dive into HTTP features
