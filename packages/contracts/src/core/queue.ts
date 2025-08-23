import type { Job } from 'bullmq';
import ApplicationContract from './application';

export default abstract class BaseQueueJob {
  constructor(protected readonly app: ApplicationContract) {}

  abstract getName(): string;
  abstract handle(job: Job): Promise<void>;
}
