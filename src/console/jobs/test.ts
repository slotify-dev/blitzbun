import { BaseQueueJob } from '@blitzbun/core';
import { Job } from 'bullmq';

export default class EmailSendJob extends BaseQueueJob {
  getName(): string {
    return 'email:send';
  }

  async handle(job: Job): Promise<void> {
    const { email } = job.data;
    console.log('📧 Sending email to:', email);
  }
}
