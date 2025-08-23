import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  command: string;
}

export default class CreateCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:command',
      'Creates a new command file for the given module',
      (yargs) =>
        yargs.option('command', {
          describe: 'Name of the command to create',
          demandOption: true,
          type: 'string',
        }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { command } = argv;

    if (command) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const commandName = toPascalCase(command);
      const consolePath = this.app.getRootPath('console/commands');
      const templatePath = path.join(__dirname, '../../templates');

      FileHelper.createDir(consolePath);
      const targetFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'command.txt'))
      )({
        command: commandName,
        commandSlug: command,
      });

      FileHelper.createFile(
        path.join(consolePath, `${command}.ts`),
        targetFile
      );
    }
  }
}
