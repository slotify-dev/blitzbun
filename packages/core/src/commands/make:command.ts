import lodash from 'lodash';
import path from 'path';

import type { Argv } from 'yargs';
import { ConsoleCommand, FileHelper } from '..';

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
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('command', {
            describe: 'Name of the command to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module, command } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');
      const commandName = (command + '').replace(/^([a-z])|\s+([a-z])/g, ($1) => $1.toUpperCase());

      const targetDir = path.join(modulePath, 'commands');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(await FileHelper.getFileAsync(path.join(templatePath, 'command.txt')))({
        module,
        moduleSlug: module,
        command: commandName,
        commandSlug: command,
      });

      FileHelper.createFile(path.join(targetDir, `${command}.ts`), targetFile);
    }
  }
}
