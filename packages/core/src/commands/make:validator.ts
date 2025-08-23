import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  validator: string;
}

export default class CreateValidatorCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:validator',
      'Creates a new validator file for the given module',
      (yargs: Argv) =>
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('validator', {
            describe: 'Name of the validator to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module, validator } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const validatorName = toPascalCase(validator);
      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');

      const targetDir = path.join(modulePath, 'validator');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'validator.txt'))
      )({
        module,
        validator: validatorName,
        validatorSlug: validator,
        moduleSlug: module,
      });

      FileHelper.createFile(
        path.join(targetDir, `${validator}.ts`),
        targetFile
      );
    }
  }
}
