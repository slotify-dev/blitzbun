import cron, { ScheduledTask } from 'node-cron';
import { AppKernel, AppRegistry, FileHelper } from '..';
import { ApplicationContract, CronJob } from '../contracts';

export default class CronKernel<TRegistry extends AppRegistry = AppRegistry> extends AppKernel<TRegistry> {
  private isShuttingDown = false;
  private crons: ScheduledTask[] = [];
  private runningJobs = new Set<string>();

  private async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;
    console.log('Gracefully shutting down cron jobs...');

    for (const cronJob of this.crons) {
      cronJob.stop();
    }

    // Wait for running jobs to finish or timeout after 10 seconds
    const waitForJobs = new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.runningJobs.size === 0) {
          clearInterval(interval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        console.error('Timeout waiting for jobs to finish. Forcing exit.');
        resolve();
      }, 10000);
    });

    await waitForJobs;
    await this.app.shutdown();

    console.log('All cron jobs stopped.');
  }

  async handle(): Promise<void> {
    try {
      await this.app.boot();
      const cronDir = this.app.getRootPath('console/crons');

      await FileHelper.loadFiles(cronDir, (JobClass: unknown) => {
        if (typeof JobClass === 'function' && JobClass.prototype instanceof CronJob) {
          const jobInstance = new (JobClass as new (app: ApplicationContract<TRegistry>) => CronJob)(this.app);
          const schedules = jobInstance
            .getSchedule()
            .split('|')
            .map((s) => s.trim());

          for (const schedule of schedules) {
            if (!cron.validate(schedule)) {
              console.error(`Invalid cron schedule "${schedule}" for job ${jobInstance.constructor.name}`);
              continue;
            }

            const task = cron.schedule(schedule, async () => {
              const jobName = jobInstance.constructor.name;

              if (this.runningJobs.has(jobName)) {
                console.warn(`Skipping overlapping run of cron job: ${jobName}`);
                return;
              }

              this.runningJobs.add(jobName);
              try {
                await jobInstance.handle();
              } catch (error) {
                console.error(`Error executing cron job "${jobName}":`, error);
              } finally {
                this.runningJobs.delete(jobName);
              }
            });

            this.crons.push(task);
            task.start();
          }
        }
      });

      process.on('SIGINT', async () => await this.shutdown());
      process.on('SIGTERM', async () => await this.shutdown());

      console.log('Cron jobs running in background');
    } catch (e) {
      console.error('Error in CronKernel:', e);
      process.exit(1);
    }
  }
}
