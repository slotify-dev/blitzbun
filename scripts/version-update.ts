#!/usr/bin/env bun
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable security/detect-non-literal-fs-filename */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import semver from 'semver';
import PACKAGE_ORDER from './packages';

interface PackageData {
  path: string;
  data: any;
}

async function updateVersions(): Promise<void> {
  const versionType = (process.argv[2] || 'patch') as semver.ReleaseType; // patch, minor, major

  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ Version type must be one of: patch, minor, major');
    process.exit(1);
  }

  console.log(`🔄 Updating versions (${versionType})...`);
  const packageData = new Map<string, PackageData>();

  // First pass: read all current versions
  for (const pkg of PACKAGE_ORDER) {
    const packagePath = join(process.cwd(), 'packages', pkg, 'package.json');
    const data = JSON.parse(await readFile(packagePath, 'utf8'));
    packageData.set(pkg, { path: packagePath, data });
  }

  // Second pass: update versions
  for (const pkg of PACKAGE_ORDER) {
    const pkgData = packageData.get(pkg);
    if (!pkgData) continue;

    const { path, data } = pkgData;
    const oldVersion = data.version;
    data.version = semver.inc(oldVersion, versionType);

    if (!data.version) {
      console.error(`❌ Failed to increment version for ${pkg}`);
      continue;
    }

    // Update dependencies on other packages in the monorepo
    if (data.dependencies) {
      for (const [depName, depVersion] of Object.entries(data.dependencies)) {
        // Check if this is a dependency on another package in our monorepo
        const isInternalDependency = PACKAGE_ORDER.some((internalPkg) => {
          const internalData = packageData.get(internalPkg);
          return internalData && internalData.data.name === depName;
        });

        if (isInternalDependency && depVersion === 'workspace:*') {
          // Find the internal package and get its new version
          const internalPkg = PACKAGE_ORDER.find((p) => {
            const internalData = packageData.get(p);
            return internalData && internalData.data.name === depName;
          });

          if (internalPkg) {
            const internalData = packageData.get(internalPkg);
            if (internalData) {
              // Update to the new version with caret
              data.dependencies[depName] = `^${internalData.data.version}`;
            }
          }
        }
      }
    }

    await writeFile(path, JSON.stringify(data, null, 2));
    console.log(`📦 ${pkg}: ${oldVersion} → ${data.version}`);
  }

  console.log('✅ All versions updated successfully');
}

updateVersions().catch(console.error);
