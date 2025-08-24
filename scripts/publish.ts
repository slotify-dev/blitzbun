#!/usr/bin/env bun
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable security/detect-non-literal-fs-filename */

import { $ } from 'bun';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import PACKAGE_ORDER from './packages';

// Configuration
interface Config {
  npmRegistry: string;
  access: 'public';
  dryRun: boolean;
}

const CONFIG: Config = {
  access: 'public',
  npmRegistry: 'https://registry.npmjs.org/',
  dryRun: process.argv.includes('--dry-run'),
};

interface PackageInfo {
  data: any;
  path: string;
  name: string;
  version: string;
}

interface NpmPackageInfo {
  name: string;
  time?: Record<string, string>;
  versions: Record<string, unknown>;
  'dist-tags'?: Record<string, string>;
}

class Publisher {
  private packageData: Map<string, PackageInfo> = new Map();

  async run(): Promise<void> {
    console.log('🚀 Starting package publishing process...');
    if (CONFIG.dryRun) {
      console.log('🔍 Dry run mode - no changes will be made');
    }

    try {
      // Read all package.json files
      await this.loadPackageData();

      // Validate versions and dependencies
      await this.validatePackages();

      // Build all packages
      await this.buildPackages();

      // Publish packages in correct order
      await this.publishPackages();

      console.log('✅ All packages processed successfully!');
    } catch (error) {
      console.error('❌ Publishing failed:', (error as Error).message);
      process.exit(1);
    }
  }

  private async loadPackageData(): Promise<void> {
    for (const pkgName of PACKAGE_ORDER) {
      const packagePath = join(
        process.cwd(),
        'packages',
        pkgName,
        'package.json'
      );
      try {
        const data = JSON.parse(await readFile(packagePath, 'utf8'));
        this.packageData.set(pkgName, {
          path: join(process.cwd(), 'packages', pkgName),
          data,
          name: data.name,
          version: data.version,
        });
      } catch (error) {
        throw new Error(
          `Failed to read package.json for ${pkgName}: ${(error as Error).message}`
        );
      }
    }
  }

  private async validatePackages(): Promise<void> {
    console.log('🔍 Validating packages...');

    for (const [pkgName, pkgInfo] of this.packageData) {
      // Check if package has all required fields
      if (!pkgInfo.name || !pkgInfo.version) {
        throw new Error(`Package ${pkgName} is missing name or version`);
      }

      // Check if dependencies are valid
      if (pkgInfo.data.dependencies) {
        for (const [depName, depVersion] of Object.entries(
          pkgInfo.data.dependencies
        )) {
          if (depVersion === 'workspace:*') {
            // Find if this is a local package
            const localDep = PACKAGE_ORDER.find((pkg) => {
              const depInfo = this.packageData.get(pkg);
              return depInfo && depInfo.name === depName;
            });

            if (localDep) {
              console.log(
                `⚠️  ${pkgName} has workspace dependency on ${depName}`
              );
            }
          }
        }
      }
    }
  }

  private async buildPackages(): Promise<void> {
    try {
      console.log('🏗️  Building packages...');
      await $`bun run build:all`;
      console.log('✅ All packages built successfully');
    } catch (error) {
      throw new Error(`Build failed: ${(error as Error).message}`);
    }
  }

  private async checkIfVersionExists(
    packageName: string,
    version: string
  ): Promise<boolean> {
    try {
      // Properly encode the package name for the URL
      let encodedPackageName: string;

      if (packageName.startsWith('@')) {
        // Handle scoped packages: @scope/package -> @scope%2Fpackage
        const [scope, name] = packageName.slice(1).split('/');
        encodedPackageName = `@${encodeURIComponent(scope)}%2F${encodeURIComponent(name)}`;
      } else {
        encodedPackageName = encodeURIComponent(packageName);
      }

      const registryUrl = `https://registry.npmjs.org/${encodedPackageName}`;
      const response = await fetch(registryUrl);

      if (response.status === 200) {
        const packageInfo = (await response.json()) as NpmPackageInfo;
        return (
          packageInfo.versions && packageInfo.versions[version] !== undefined
        );
      }

      // 404 means the package doesn't exist, so this version doesn't exist
      if (response.status === 404) {
        return false;
      }

      // For other status codes, log a warning but assume version doesn't exist
      console.warn(
        `⚠️  Registry returned HTTP ${response.status} for ${packageName}`
      );
      return false;
    } catch (error) {
      console.warn(
        `⚠️  Failed to check ${packageName}@${version}: ${(error as Error).message}`
      );
      return false;
    }
  }

  private async publishPackages(): Promise<void> {
    console.log('📦 Publishing packages...');

    for (const pkgName of PACKAGE_ORDER) {
      const pkgInfo = this.packageData.get(pkgName);
      if (!pkgInfo) continue;

      console.log(`\nProcessing ${pkgInfo.name}@${pkgInfo.version}...`);

      // Check if package already exists with this version
      const versionExists = await this.checkIfVersionExists(
        pkgInfo.name,
        pkgInfo.version
      );

      if (versionExists) {
        console.log(
          `⏩ ${pkgInfo.name}@${pkgInfo.version} already exists, skipping`
        );
        continue;
      }

      // Publish the package
      if (CONFIG.dryRun) {
        console.log(
          `📦 [DRY RUN] Would publish ${pkgInfo.name}@${pkgInfo.version}`
        );
      } else {
        try {
          const publishArgs = ['publish', '--access', CONFIG.access];
          if (CONFIG.npmRegistry !== 'https://registry.npmjs.org/') {
            publishArgs.push('--registry', CONFIG.npmRegistry);
          }

          // Special handling for framework package - publish all files instead of just dist
          if (pkgName === 'framework') {
            // Create a temporary package.json backup
            const originalPackageJsonPath = join(pkgInfo.path, 'package.json');
            const backupPackageJsonPath = join(pkgInfo.path, 'package.json.backup');
            
            // Read current package.json
            const originalPackageJson = JSON.parse(
              await readFile(originalPackageJsonPath, 'utf8')
            );
            
            // Create backup
            await $`cp ${originalPackageJsonPath} ${backupPackageJsonPath}`;
            
            try {
              // Modify package.json to include all files (remove or modify files field)
              const modifiedPackageJson = { ...originalPackageJson };
              delete modifiedPackageJson.files; // This will include all files
              
              // Write modified package.json
              await writeFile(
                originalPackageJsonPath,
                JSON.stringify(modifiedPackageJson, null, 2),
                'utf8'
              );
              
              // Publish with all files
              await $`cd ${pkgInfo.path} && bun ${publishArgs}`;
              
              console.log(
                `✅ Successfully published ${pkgInfo.name}@${pkgInfo.version} (all files)`
              );
            } finally {
              // Restore original package.json
              await $`mv ${backupPackageJsonPath} ${originalPackageJsonPath}`;
            }
          } else {
            // Normal publish for other packages
            await $`cd ${pkgInfo.path} && bun ${publishArgs}`;
            console.log(
              `✅ Successfully published ${pkgInfo.name}@${pkgInfo.version}`
            );
          }
        } catch (error) {
          throw new Error(
            `Failed to publish ${pkgInfo.name}: ${(error as Error).message}`
          );
        }
      }
    }
  }
}

// Run the publisher
const publisher = new Publisher();
await publisher.run();
