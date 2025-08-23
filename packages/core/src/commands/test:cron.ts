import path from 'path';

import {
  AppRegistry,
  ApplicationContract,
  ConsoleCommand,
  CronJob,
} from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  job: string;
}

export default class TestCronJob extends ConsoleCommand {
  /**
   * Define command
   *
   * @param yargs
   * @returns
   */
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'test:cron',
      'Runs test cron job without actually running a cron',
      (yargs: Argv) =>
        yargs.option('job', {
          describe: 'Name of the job to run',
          demandOption: true,
          type: 'string',
        }),
      this.handle.bind(this)
    );
  }

  /**
   * Function to handle command creation
   *
   * @param argv
   */
  async handle(argv: HandlerArgv): Promise<void> {
    const { job } = argv;

    if (!job) {
      console.error('Job name is required');
      return;
    }

    const cronDir = this.app.getRootPath('console/crons');
    if (!FileHelper.directoryExists(cronDir)) {
      console.error(`Cron directory does not exist: ${cronDir}`);
      return;
    }

    const JobClass = await FileHelper.getFileAsync(path.join(cronDir, job));
    if (
      typeof JobClass === 'function' &&
      JobClass.prototype instanceof CronJob
    ) {
      const jobInstance = new (JobClass as new (
        app: ApplicationContract<AppRegistry>
      ) => CronJob)(this.app);
      await jobInstance.handle();
    }
  }
}
