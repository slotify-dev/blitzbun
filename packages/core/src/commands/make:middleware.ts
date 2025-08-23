import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  middleware: string;
}
export default class CreateMiddlewareCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:middleware',
      'Creates a new middleware file for the given module',
      (yargs) =>
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('middleware', {
            describe: 'Name of the middleware to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module, middleware } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const middlewareName = toPascalCase(middleware);
      const modulePath = this.app.getModulePath(module);
      const targetDir = path.join(modulePath, 'middlewares');
      const templatePath = path.join(__dirname, '../../templates');

      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'middleware.txt'))
      )({
        module,
        middleware: middlewareName,
        middlewareSlug: middleware,
        moduleSlug: module,
      });

      FileHelper.createFile(
        path.join(targetDir, `${middleware}.ts`),
        targetFile
      );
    }
  }
}
