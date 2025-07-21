import chalk from 'chalk';
import ora from 'ora';
import path from 'path';

import type { Argv } from 'yargs';
import { ApplicationContract, ConsoleCommand, FileHelper } from '..';

export default class DBSeedCommand extends ConsoleCommand {
  constructor(app: ApplicationContract) {
    super(app);
  }

  define(yargs: Argv): Argv {
    return yargs.command('db:seed', 'Run all database seed files located in /database/seeds', (yargs: Argv) => yargs, this.handle.bind(this));
  }

  async handle(): Promise<void> {
    const spinner = ora();
    try {
      spinner.start(chalk.blue('Running database seeds'));

      const seedDirPath = this.app.getRootPath('database/seeds');
      for (const seed of FileHelper.getDirFiles(seedDirPath)) {
        const seedPath = path.join(seedDirPath, seed);
        if (FileHelper.fileExists(seedPath)) {
          await (
            await FileHelper.getFileAsync<CallableFunction>(seedPath)
          )();
        }
      }

      spinner.succeed(chalk.green('Seed ran successfully!!'));
    } catch (error) {
      spinner.fail(chalk.red('Operation failed'));
      console.error(chalk.red('Error details:'), error);
      process.exit(1);
    }
  }
}
