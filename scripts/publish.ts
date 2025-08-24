#!/usr/bin/env bun
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { $ } from 'bun';
import { readFile } from 'fs/promises';
import { join } from 'path';

import PACKAGE_ORDER from './packages';

// Configuration
interface Config {
  dryRun: boolean;
  npmRegistry: string;
  access: 'public' | 'restricted';
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
          data,
          name: data.name,
          version: data.version,
          path: join(process.cwd(), 'packages', pkgName),
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

  private async publishPackages(): Promise<void> {
    console.log('📦 Publishing packages...');

    for (const pkgName of PACKAGE_ORDER) {
      const pkgInfo = this.packageData.get(pkgName);
      if (!pkgInfo) continue;

      console.log(`\nProcessing ${pkgInfo.name}@${pkgInfo.version}...`);

      // Check if package already exists with this version
      try {
        const checkCmd =
          await $`bun info ${pkgInfo.name}@${pkgInfo.version} --json`;
        const info = JSON.parse(checkCmd.stdout.toString());

        if (info.version === pkgInfo.version) {
          console.log(
            `⏩ ${pkgInfo.name}@${pkgInfo.version} already exists, skipping`
          );
          continue;
        }
      } catch (error) {
        console.log(error);
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

          await $`cd ${pkgInfo.path} && bun ${publishArgs}`;
          console.log(
            `✅ Successfully published ${pkgInfo.name}@${pkgInfo.version}`
          );
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
