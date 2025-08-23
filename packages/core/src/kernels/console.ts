import {
  ApplicationContract,
  AppRegistry,
  ConsoleCommand,
} from '@blitzbun/contracts';
import { AppContext } from '@blitzbun/core';

import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { FileHelper } from '..';
import AppKernel from './app';

export default class ConsoleKernel<
  TRegistry extends AppRegistry = AppRegistry,
> extends AppKernel<TRegistry> {
  async handle(): Promise<void> {
    const scopedContainer = this.app.getContainer().clone();

    await AppContext.run(scopedContainer, async () => {
      await this.app.boot();
      const yargCmd = yargs(hideBin(process.argv))
        .scriptName('console')
        .usage('Usage: $0 <command> [options]')
        .recommendCommands()
        .help()
        .alias('h', 'help');

      await FileHelper.loadFiles(
        path.join(__dirname, '../commands'),
        (CmdClass: unknown) => {
          if (
            typeof CmdClass === 'function' &&
            CmdClass.prototype instanceof ConsoleCommand
          ) {
            const instance = new (CmdClass as new (
              app: ApplicationContract<TRegistry>
            ) => ConsoleCommand)(this.app);
            if (typeof instance.define === 'function') {
              instance.define(yargCmd);
            }
          }
        }
      );

      await FileHelper.loadFiles(
        this.app.getRootPath('console/commands'),
        (CmdClass: unknown) => {
          if (
            typeof CmdClass === 'function' &&
            CmdClass.prototype instanceof ConsoleCommand
          ) {
            const instance = new (CmdClass as new (
              app: ApplicationContract<TRegistry>
            ) => ConsoleCommand)(this.app);
            if (typeof instance.define === 'function') {
              instance.define(yargCmd);
            }
          }
        }
      );

      if (process.argv.length <= 2) {
        yargCmd.showHelp();
        return;
      }

      await yargCmd.parseAsync();
      await this.app.shutdown();
    });
  }
}
