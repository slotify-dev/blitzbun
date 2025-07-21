/* eslint-disable security/detect-object-injection */
import { Job, Worker } from 'bullmq';
import Redis, { RedisOptions } from 'ioredis';
import { ApplicationContract, AppRegistry, BaseQueueJob, FileHelper } from '..';
import AppKernel from './app';

export default class WorkerKernel<TRegistry extends AppRegistry> extends AppKernel<TRegistry> {
  private workers: Worker[] = [];

  private async shutdown(): Promise<void> {
    this.app.get('logger')?.info('🛑 Shutting down workers...');
    await Promise.all(this.workers.map((worker) => worker.close()));
    await this.app.shutdown();
    this.app.get('logger')?.info('✅ WorkerKernel stopped cleanly');
    process.exit(0);
  }

  async handle(): Promise<void> {
    await this.app.boot();

    const logger = this.app.get('logger');
    const jobsPath = this.app.getRootPath('console/jobs');
    const config = this.app.get('config').get('cache.stores.queue') as RedisOptions;

    if (!config?.host || !config?.port) {
      logger?.error('❌ Invalid Redis configuration');
      return;
    }

    const redis = new Redis(config as RedisOptions);

    if (!redis) {
      logger.error('❌ No Redis queue connection found');
      return;
    }

    const jobMap: Record<string, BaseQueueJob[]> = {};

    await FileHelper.loadFiles(jobsPath, (JobClass: unknown) => {
      if (typeof JobClass === 'function' && typeof JobClass.prototype.getName === 'function' && typeof JobClass.prototype.handle === 'function') {
        const job = new (JobClass as new (app: ApplicationContract<TRegistry>) => BaseQueueJob)(this.app);

        const [queue, jobName] = job.getName().split(':');
        if (!queue || !jobName) {
          throw new Error(`Invalid job name format: ${job.getName()}`);
        }

        if (!jobMap[queue]) jobMap[queue] = [];
        jobMap[queue].push(job);
      }
    });

    for (const [queue, jobs] of Object.entries(jobMap)) {
      const worker = new Worker(
        queue,
        async (job: Job) => {
          const handler = jobs.find((j) => j.getName() === `${queue}:${job.name}`);
          if (!handler) {
            logger?.error(`❌ No handler found for job: ${job.name}`);
            return;
          }
          await handler.handle(job);
        },
        { connection: redis }
      );

      worker.on('completed', (job: Job) => {
        logger?.info(`✅ Completed job: ${job.name}`);
      });

      worker.on('failed', (job: Job | undefined, err: Error) => {
        logger?.error(`❌ Failed job: ${job?.name} - ${err.message}`);
      });

      worker.on('stalled', (jobId: string, prev: string) => {
        logger?.warn(`⚠️ Job stalled: ${jobId} (prev: ${prev})`);
      });

      worker.on('error', (err: Error) => {
        logger?.error(`❌ Worker error: ${err.message}`);
      });

      worker.on('closing', () => {
        logger?.info(`👋 Worker for ${queue} is closing`);
      });

      this.workers.push(worker);
    }

    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    console.log(`🚀 WorkerKernel started with ${this.workers.length} jobs`);
  }
}
