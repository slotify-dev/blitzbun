import lodash from 'lodash';
import path from 'path';

import type { Argv } from 'yargs';
import { ConsoleCommand, FileHelper } from '..';

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

      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');
      const transformerName = (transformer + '').replace(/^([a-z])|\s+([a-z])/g, ($1) => $1.toUpperCase());

      const targetDir = path.join(modulePath, 'transformers');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(await FileHelper.getFileAsync(path.join(templatePath, 'transformer.txt')))({
        module,
        transformer: transformerName,
        transformerSlug: transformer,
        moduleSlug: module,
      });

      FileHelper.createFile(path.join(targetDir, `${transformer}.ts`), targetFile);
    }
  }
}
