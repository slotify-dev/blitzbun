import type { ApplicationContract } from '@blitzbun/core';
import type { Job } from 'bullmq';

export default abstract class BaseQueueJob {
  constructor(protected readonly app: ApplicationContract) {}

  abstract getName(): string;
  abstract handle(job: Job): Promise<void>;
}
