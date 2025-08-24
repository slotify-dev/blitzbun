#!/usr/bin/env bun
/* eslint-disable security/detect-non-literal-fs-filename */

import { readFile } from 'fs/promises';
import { join } from 'path';

import semver from 'semver';
import PACKAGES from './packages';

async function checkVersions(): Promise<void> {
  console.log('🔍 Checking package versions...');

  const versions = new Map<string, string>();

  for (const pkg of PACKAGES) {
    const packagePath = join(process.cwd(), 'packages', pkg, 'package.json');
    const data = JSON.parse(await readFile(packagePath, 'utf8'));

    versions.set(pkg, data.version);
    console.log(`📦 ${pkg}: ${data.version}`);
  }

  // Check if versions are valid semver
  for (const [pkg, version] of versions) {
    if (!semver.valid(version)) {
      console.error(`❌ ${pkg} has invalid version: ${version}`);
      process.exit(1);
    }
  }

  console.log('✅ All versions are valid');
}

checkVersions().catch(console.error);
