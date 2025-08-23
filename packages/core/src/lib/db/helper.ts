import type {
  ApplicationContract,
  AppRegistry,
  DBSchema,
} from '@blitzbun/contracts';
import type { Table } from 'drizzle-orm';

import path from 'path';
import * as FileHelper from '../../utils/file';

export default async function loadSchemasFromModules<T extends AppRegistry>(
  app: ApplicationContract<T>
): Promise<DBSchema> {
  const result: DBSchema = {};
  const modulesDir = app.getModulePath();

  if (!FileHelper.directoryExists(modulesDir)) {
    return result;
  }

  const modules = await FileHelper.getDirFilesAsync(modulesDir);

  for (const moduleName of modules) {
    const modelsPath = path.join(modulesDir, moduleName, 'models');
    if (!FileHelper.directoryExists(modelsPath)) continue;

    const exports = await FileHelper.getFileAsync(modelsPath, {});
    for (const [key, value] of Object.entries(exports)) {
      result[key as keyof DBSchema] = value as Table;
    }
  }

  return result;
}
