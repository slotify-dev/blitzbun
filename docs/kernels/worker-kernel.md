# Worker Kernel

The Worker Kernel processes background jobs from Redis-based queues in your BlitzBun application. It enables you to offload time-consuming tasks from your web requests, improving your application's responsiveness and user experience.

## What is the Worker Kernel?

The Worker Kernel transforms your BlitzBun application into a background job processor. It connects to Redis queues, discovers job handlers, and processes jobs asynchronously while your web server continues to handle user requests.

Think of it as a dedicated team of workers in a factory - while the front desk (HTTP Kernel) handles customer requests, the workers (Worker Kernel) are busy processing orders in the background.

## Purpose

The Worker Kernel provides:

- **Background Processing**: Execute long-running tasks without blocking web requests
- **Queue Management**: Connect to Redis-based job queues for reliable task distribution
- **Job Discovery**: Automatically find and load job handler classes
- **Concurrent Processing**: Handle multiple jobs simultaneously for better throughput
- **Error Handling**: Retry failed jobs and handle errors gracefully
- **Monitoring**: Track job progress, failures, and performance metrics

## Basic Usage

### Starting the Worker Kernel

```typescript
import { Application } from '@blitzbun/core';
import { WorkerKernel } from '@blitzbun/core';

const app = new Application(__dirname);
const kernel = new WorkerKernel(app);

// Start processing background jobs
await kernel.handle();
```

### Complete Worker Setup

```typescript
// src/worker.ts
import { Application } from '@blitzbun/core';
import { WorkerKernel } from '@blitzbun/core';

(async () => {
  try {
    const app = new Application(__dirname);
    const kernel = new WorkerKernel(app);
    
    console.log('👷 Starting BlitzBun Worker...');
    await kernel.handle();
  } catch (error) {
    console.error('❌ Worker error:', error);
    process.exit(1);
  }
})();
```

## Creating Jobs

### Basic Job Structure

```typescript
// console/jobs/example-job.ts
import { BaseQueueJob } from '@blitzbun/contracts';
import { ApplicationContract } from '@blitzbun/contracts';
import { Job } from 'bullmq';

export default class ExampleJob extends BaseQueueJob {
  constructor(private app: ApplicationContract) {
    super();
  }

  getName(): string {
    return 'queue-name:job-name';  // queue:job-name format
  }

  async handle(job: Job): Promise<void> {
    // Access job data
    const jobData = job.data;
    
    // Access application services through dependency injection
    // const logger = this.app.get('logger');
    // const someService = this.app.get('someService');

    // Your job processing logic goes here
    console.log('Processing job:', job.id);
    
    // Job completion is automatic if no error is thrown
  }
}
```

## Dispatching Jobs

Add jobs to queues from your controllers or services.

## Running Workers

```bash
# Start worker kernel
bun run worker
```

## Best Practices

1. **Job Naming**: Use descriptive names with queue:job-name format
2. **Error Handling**: Handle errors gracefully and decide on retry strategy
3. **Progress Tracking**: Update job progress for long-running tasks
4. **Resource Cleanup**: Clean up temporary resources in job handlers
5. **Logging**: Log job execution for debugging and monitoring

## Next Steps

- [Cron Kernel](./cron-kernel.md) - Schedule jobs to run automatically
- [Console Kernel](./console-kernel.md) - CLI commands for queue management
- [HTTP Kernel](./http-kernel.md) - Dispatching jobs from web requests
- [Application](../application.md) - Understanding the application context


## Running Workers


## Best Practices

1. **Job Naming**: Use descriptive names with queue:job-name format
2. **Error Handling**: Handle errors gracefully and decide on retry strategy
3. **Progress Tracking**: Update job progress for long-running tasks
4. **Resource Cleanup**: Clean up temporary resources in job handlers
5. **Logging**: Log job execution for debugging and monitoring

## Next Steps

- [Cron Kernel](./cron-kernel.md) - Schedule jobs to run automatically
- [Console Kernel](./console-kernel.md) - CLI commands for queue management
- [HTTP Kernel](./http-kernel.md) - Dispatching jobs from web requests
- [Application](../application.md) - Understanding the application context