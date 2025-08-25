import { BaseQueueJob } from '@blitzbun/contracts';
import type { Job } from 'bullmq';

interface TestJobData {
  userId?: number;
  email?: string;
  message?: string;
}

export default class TestJob extends BaseQueueJob {
  /**
   * Get the job name (used for queue identification)
   * 
   * @returns job name
   */
  getName(): string {
    return 'test-job';
  }

  /**
   * Handle the queue job execution
   * 
   * @param job BullMQ job instance containing data and metadata
   */
  async handle(job: Job<TestJobData>): Promise<void> {
    const { userId, email, message } = job.data;
    
    console.log(`Processing job ${job.id}: ${this.getName()}`);
    console.log('Job data:', { userId, email, message });
    
    try {
      // Update job progress
      await job.updateProgress(10);
      
      // Simulate some async processing
      console.log('Starting job processing...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await job.updateProgress(50);
      
      // Example: Send email, process data, etc.
      if (email && message) {
        console.log(`Sending message to ${email}: ${message}`);
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await job.updateProgress(100);
      console.log(`Job ${job.id} completed successfully`);
      
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error; // This will mark the job as failed and potentially retry
    }
  }
}