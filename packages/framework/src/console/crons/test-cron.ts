import { CronJob } from '@blitzbun/contracts';

export default class TestCron extends CronJob {
  /**
   * Get the cron schedule expression
   * Format: second minute hour day month day-of-week
   * Examples:
   * - '0 * * * * *' - Every minute
   * - '0 0 * * * *' - Every hour
   * - '0 0 0 * * *' - Every day at midnight
   * - '0 30 2 * * 1-5' - At 02:30 on weekdays (Mon-Fri)
   * 
   * @returns cron schedule string
   */
  getSchedule(): string {
    return '0 */5 * * * *'; // Every 5 minutes
  }

  /**
   * Handle the cron job execution
   */
  async handle(): Promise<void> {
    const now = new Date();
    console.log(`[${now.toISOString()}] Test cron job executed`);
    
    // Example: Perform some cleanup or maintenance task
    try {
      console.log('Performing scheduled task...');
      
      // Simulate some async work
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Scheduled task completed successfully');
    } catch (error) {
      console.error('Error in cron job:', error);
      throw error;
    }
  }
}