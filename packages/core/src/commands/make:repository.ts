import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
  repository: string;
}

export default class CreateRepositoryCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:repository',
      'Creates a new repository file for the given module',
      (yargs) =>
        yargs
          .option('module', {
            describe: 'Name of the module',
            demandOption: true,
            type: 'string',
          })
          .option('repository', {
            describe: 'Name of the repository to create',
            demandOption: true,
            type: 'string',
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module, repository } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const repositoryName = toPascalCase(repository);
      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');

      const targetDir = path.join(modulePath, 'repository');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'repository.txt'))
      )({
        module,
        moduleSlug: module,
        repository: repositoryName,
        repositorySlug: repository,
      });

      FileHelper.createFile(
        path.join(targetDir, `${repository}.ts`),
        targetFile
      );
    }
  }
}
