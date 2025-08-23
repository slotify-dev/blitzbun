import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  model: string;
}

export default class CreateModelCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:model',
      'Creates a new model file for the given module',
      (yargs) =>
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('model', {
            describe: 'Name of the model to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }
  async handle(argv: HandlerArgv): Promise<void> {
    const { module, model } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const modelName = toPascalCase(model);
      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');

      const targetDir = path.join(modulePath, 'models');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'model.txt'))
      )({ module, model: modelName, moduleSlug: module, modelSlug: model });

      FileHelper.createFile(path.join(targetDir, `${model}.ts`), targetFile);
    }
  }
}
