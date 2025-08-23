import lodash from 'lodash';
import path from 'path';

import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';
import { toPascalCase } from '../utils/common';
import * as FileHelper from '../utils/file';

interface HandlerArgv {
  module: string;
}

export default class CreateModuleCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:module',
      'Creates a new module with basic files and folder structure',
      (yargs) =>
        yargs.option('module', {
          describe: 'Name of the module',
          demandOption: true,
          type: 'string',
        }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { module } = argv;

    if (module) {
      lodash.templateSettings.interpolate = /\[\[([\s\S]+?)\]\]/g;

      const moduleName = toPascalCase(module);
      const modulePath = this.app.getModulePath(module);
      const templatePath = path.join(__dirname, '../../templates');

      const modelPath = path.join(modulePath, 'models');
      const repositoryPath = path.join(modulePath, 'repository');
      const middlewarePath = path.join(modulePath, 'middlewares');
      const controllerPath = path.join(modulePath, 'controllers');
      const transformerPath = path.join(modulePath, 'transformers');

      FileHelper.createDir(modulePath);
      FileHelper.createDir(modelPath);
      FileHelper.createDir(repositoryPath);
      FileHelper.createDir(middlewarePath);
      FileHelper.createDir(controllerPath);
      FileHelper.createDir(transformerPath);

      const controllerFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'controller.txt'))
      )({
        module: moduleName,
        controller: moduleName,
        controllerSlug: module,
        moduleSlug: module,
      });

      const middlewareFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'middleware.txt'))
      )({
        module: moduleName,
        middleware: moduleName,
        middlewareSlug: module,
        moduleSlug: module,
      });

      const modelFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'model.txt'))
      )({
        module: moduleName,
        model: moduleName,
        modelSlug: module,
        moduleSlug: module,
      });

      const repositoryFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'repository.txt'))
      )({
        module,
        repository: moduleName,
        repositorySlug: module,
        moduleSlug: module,
      });

      const transformerFile = lodash.template(
        await FileHelper.getFileAsync(
          path.join(templatePath, 'transformer.txt')
        )
      )({
        module: moduleName,
        moduleSlug: module,
        transformer: moduleName,
        transformerSlug: module,
      });

      const providerFile = lodash.template(
        await FileHelper.getFileAsync(path.join(templatePath, 'provider.txt'))
      )({ module: moduleName, moduleSlug: module });

      FileHelper.createFile(path.join(modulePath, 'index.ts'), providerFile);
      FileHelper.createFile(path.join(modelPath, `${module}.ts`), modelFile);
      FileHelper.createFile(
        path.join(middlewarePath, `${module}.ts`),
        middlewareFile
      );
      FileHelper.createFile(
        path.join(controllerPath, `${module}.ts`),
        controllerFile
      );
      FileHelper.createFile(
        path.join(transformerPath, `${module}.ts`),
        transformerFile
      );
      FileHelper.createFile(
        path.join(repositoryPath, `${module}.ts`),
        repositoryFile
      );
    }
  }
}
