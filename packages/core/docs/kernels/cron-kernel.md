# Cron Kernel

The Cron Kernel runs scheduled tasks automatically at specified intervals in your BlitzBun application. It provides a reliable way to execute recurring jobs like data cleanup, report generation, backup creation, and maintenance tasks.

## What is the Cron Kernel?

The Cron Kernel transforms your BlitzBun application into a task scheduler. It discovers cron job classes, validates their schedules, and executes them at the correct times while preventing overlapping executions and handling failures gracefully.

Think of it as your application's built-in alarm clock system - it wakes up at specific times to perform important tasks that keep your application running smoothly.

## Purpose

The Cron Kernel provides:

- **Scheduled Execution**: Run tasks at specific times using cron syntax
- **Job Discovery**: Automatically find and load cron job classes
- **Overlap Prevention**: Prevent multiple instances of the same job from running simultaneously
- **Error Handling**: Gracefully handle job failures without stopping the scheduler
- **Context Isolation**: Execute jobs with proper application context
- **Graceful Shutdown**: Wait for running jobs to complete during shutdown

## Basic Usage

### Starting the Cron Kernel

```typescript
import { Application } from '@blitzbun/core';
import { CronKernel } from '@blitzbun/core';

const app = new Application(__dirname);
const kernel = new CronKernel(app);

// Start running scheduled jobs
await kernel.handle();
```

### Complete Cron Setup

```typescript
// src/cron.ts
import { Application } from '@blitzbun/core';
import { CronKernel } from '@blitzbun/core';

(async () => {
  try {
    const app = new Application(__dirname);
    const kernel = new CronKernel(app);

    console.log('⏰ Starting BlitzBun Cron Scheduler...');
    await kernel.handle();
  } catch (error) {
    console.error('❌ Cron error:', error);
    process.exit(1);
  }
})();
```

## Creating Cron Jobs

### Basic Cron Job Structure

```typescript
// console/crons/example-job.ts
import { CronJob } from '@blitzbun/contracts';
import { ApplicationContract } from '@blitzbun/contracts';

export default class ExampleJob extends CronJob {
  constructor(private app: ApplicationContract) {
    super();
  }

  // Define when this job should run (every day at 2 AM)
  getSchedule(): string {
    return '0 2 * * *';
  }

  async handle(): Promise<void> {
    // Your cron job logic goes here
    console.log('Cron job executed at:', new Date());
    
    // Access application services through dependency injection
    // const logger = this.app.get('logger');
    // const config = this.app.get('config');
    
    // Implement your scheduled task logic
  }
}
```

## Cron Schedule Formats

Cron jobs use standard cron expressions to define when they should run:

```text
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 7) (Sunday to Saturday; 7 is also Sunday)
│ │ │ │ │
* * * * *
```

Common schedule patterns:
- `'0 2 * * *'` - Every day at 2 AM
- `'*/5 * * * *'` - Every 5 minutes
- `'0 9 * * 1'` - Every Monday at 9 AM
- `'0 8 * * 1-5'` - Every weekday at 8 AM

## Running the Cron Kernel

```bash
# Start cron kernel
bun run cron
```

## Best Practices

1. **Descriptive Job Names**: Use clear, descriptive class names for cron jobs
2. **Proper Scheduling**: Choose appropriate schedules that don't overload your system
3. **Error Handling**: Handle errors gracefully in your job implementations
4. **Logging**: Log job execution for monitoring and debugging
5. **Resource Management**: Clean up resources and avoid memory leaks in jobs

## Next Steps

- [Worker Kernel](./worker-kernel.md) - Process background jobs
- [Console Kernel](./console-kernel.md) - CLI commands and maintenance
- [HTTP Kernel](./http-kernel.md) - Web server functionality
- [Application](../application.md) - Understanding the application context
