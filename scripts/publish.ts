#!/usr/bin/env bun

import { $ } from 'bun';
import { readFile, writeFile } from 'fs/promises';

const packages = ['contracts', 'core', 'http'];

async function updateDependencies(pkgName, newVersion) {
  for (const pkg of packages) {
    if (pkg === pkgName) continue;

    const pkgPath = `./packages/${pkg}/package.json`;
    const pkgJson = JSON.parse(await readFile(pkgPath, 'utf8'));

    if (
      pkgJson.dependencies &&
      pkgJson.dependencies[`@your-scope/${pkgName}`]
    ) {
      pkgJson.dependencies[`@your-scope/${pkgName}`] = `^${newVersion}`;
      await writeFile(pkgPath, JSON.stringify(pkgJson, null, 2));
    }
  }
}

async function publishPackage(pkg) {
  console.log(`Publishing ${pkg}...`);

  // Build the package
  await $`cd packages/${pkg} && bun run build`;

  // Get current version
  const pkgJson = JSON.parse(
    await readFile(`./packages/${pkg}/package.json`, 'utf8')
  );
  const currentVersion = pkgJson.version;

  // Update dependent packages
  await updateDependencies(pkg, currentVersion);

  // Publish
  await $`cd packages/${pkg} && bun publish --access public`;

  console.log(`Published ${pkg}@${currentVersion}`);
}

// Publish in dependency order
for (const pkg of packages) {
  await publishPackage(pkg);
}
