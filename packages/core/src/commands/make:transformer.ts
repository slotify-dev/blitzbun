import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  transformer: string;
}

export default class CreateTransformerCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:transformer',
      'Creates a new transformer file for the given module',
      (yargs: Argv) =>
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('transformer', {
            describe: 'Name of the transformer to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module, transformer } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const transformerName = toPascalCase(transformer);
      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');

      const targetDir = path.join(modulePath, 'transformers');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(
        await FileHelper.getFileAsync(
          path.join(templatePath, 'transformer.txt')
        )
      )({
        module,
        moduleSlug: module,
        transformerSlug: transformer,
        transformer: transformerName,
      });

      FileHelper.createFile(
        path.join(targetDir, `${transformer}.ts`),
        targetFile
      );
    }
  }
}
