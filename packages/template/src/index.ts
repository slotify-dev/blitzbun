#!/usr/bin/env bun

import chalk from 'chalk';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function runCommand(
  command: string,
  args: string[],
  cwd?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: true,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function updatePackageJson(projectPath: string, projectName: string) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  packageJson.name = projectName;
  delete packageJson.files;

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function createProject(projectName: string) {
  const currentDir = process.cwd();
  const projectPath = path.join(currentDir, projectName);

  // Check if directory already exists
  try {
    await fs.access(projectPath);
    throw new Error(`Directory ${projectName} already exists`);
  } catch (error) {
    // Directory doesn't exist, which is what we want
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  const spinner = ora('Downloading template...').start();

  try {
    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Initialize npm and install the framework package
    spinner.text = 'Installing @blitzbun/framework...';
    await runCommand('npm', ['init', '-y'], projectPath);
    await runCommand('npm', ['install', '@blitzbun/framework'], projectPath);

    // Copy framework files from node_modules
    const frameworkPath = path.join(
      projectPath,
      'node_modules',
      '@blitzbun/framework'
    );

    spinner.text = 'Setting up project structure...';

    // Copy framework files (excluding node_modules and package-lock.json)
    const frameworkFiles = await fs.readdir(frameworkPath);
    for (const file of frameworkFiles) {
      if (
        file === 'node_modules' ||
        file === 'package-lock.json' ||
        file === 'dist'
      ) {
        continue;
      }

      const sourcePath = path.join(frameworkPath, file);
      const destPath = path.join(projectPath, file);

      const stat = await fs.stat(sourcePath);
      if (stat.isDirectory()) {
        await fs.cp(sourcePath, destPath, { recursive: true });
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }

    // Update package.json
    await updatePackageJson(projectPath, projectName);

    // Copy .env.example to .env if it exists
    const envExamplePath = path.join(projectPath, '.env.example');
    const envPath = path.join(projectPath, '.env');
    try {
      await fs.access(envExamplePath);
      await fs.copyFile(envExamplePath, envPath);
    } catch (error) {
      // .env.example doesn't exist, which is fine
    }

    // Remove the framework from node_modules as we've copied its files
    await fs.rm(path.join(projectPath, 'node_modules'), {
      recursive: true,
      force: true,
    });
    await fs.rm(path.join(projectPath, 'package-lock.json'), { force: true });

    spinner.succeed(chalk.green(`Successfully created ${projectName}!`));
  } catch (error) {
    spinner.fail('Failed to create project');
    // Clean up on failure
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

const cli = yargs(hideBin(process.argv))
  .scriptName('create-blitzbun')
  .usage('$0 <project-name>')
  .command(
    '$0 [name]',
    'Create a new BlitzBun application',
    (yargs) => {
      return yargs.positional('name', {
        describe: 'Name of the new BlitzBun application',
        type: 'string',
      });
    },
    async (argv) => {
      // Get project name from positional argument or from the first non-option argument
      let projectName = argv.name as string;

      // If no name provided via positional, try to get it from remaining args
      if (!projectName && argv._.length > 0) {
        projectName = argv._[0] as string;
      }

      if (!projectName) {
        console.error(chalk.red('Error: Project name is required'));
        console.log(chalk.white('Usage: bun create blitzbun <project-name>'));
        process.exit(1);
      }

      console.log(
        chalk.blue(`Creating new BlitzBun application: ${projectName}`)
      );

      try {
        await createProject(projectName);

        console.log(chalk.cyan('\nNext steps:'));
        console.log(chalk.white(`  cd ${projectName}`));
        console.log(chalk.white('  bun install'));
        console.log(chalk.white('  docker compose up -d'));
        console.log(chalk.white('  docker ps'));
      } catch (error) {
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    }
  )
  .option('template', {
    alias: 't',
    type: 'string',
    default: 'default',
    description: 'Template to use for the new project',
  })
  .help()
  .version();

cli.parse();
