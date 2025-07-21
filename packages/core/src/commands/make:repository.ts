import lodash from 'lodash';
import path from 'path';

import type { Argv } from 'yargs';
import { ConsoleCommand, FileHelper } from '..';

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

      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');
      const repositoryName = (repository + '').replace(/^([a-z])|\s+([a-z])/g, ($1) => $1.toUpperCase());

      const targetDir = path.join(modulePath, 'repository');
      FileHelper.createDir(targetDir);

      const targetFile = lodash.template(await FileHelper.getFileAsync(path.join(templatePath, 'repository.txt')))({
        module,
        repository: repositoryName,
        repositorySlug: repository,
        moduleSlug: module,
      });

      FileHelper.createFile(path.join(targetDir, `${repository}.ts`), targetFile);
    }
  }
}
