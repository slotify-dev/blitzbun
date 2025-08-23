import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  controller: string;
}

export default class CreateControllerCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:controller',
      'Creates a new controller file for the given module',
      (yargs) =>
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('controller', {
            describe: 'Name of the controller to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module, controller } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const controllerName = toPascalCase(controller);
      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');

      const targetDir = path.join(modulePath, 'controllers');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'controller.txt'))
      )({
        module,
        moduleSlug: module,
        controllerSlug: controller,
        controller: controllerName,
      });

      FileHelper.createFile(
        path.join(targetDir, `${controller}.ts`),
        targetFile
      );
    }
  }
}
