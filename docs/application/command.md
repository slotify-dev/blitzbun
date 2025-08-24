# Commands

BlitzBun commands provide a powerful CLI interface for your application, allowing you to perform administrative tasks, run maintenance operations, and interact with your application through the terminal. Built on top of yargs, commands offer robust argument parsing, validation, and help generation.

## What are BlitzBun Commands?

BlitzBun commands are TypeScript classes that extend the `ConsoleCommand` abstract class from `@blitzbun/contracts`. Each command defines its signature, arguments, options, and execution logic. Commands are automatically discovered and registered by the Console Kernel.

Key features:
- **Automatic Discovery**: Commands are loaded from `console/commands/` and core command directories
- **Yargs Integration**: Full yargs functionality for argument parsing and validation
- **Application Context**: Access to the full application container and services
- **Type Safety**: Strongly typed arguments and options with TypeScript interfaces

## Command Structure

Every BlitzBun command must implement two abstract methods:

### Basic Command Template

```typescript
import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';

export default class MyCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command(
      'my-command',
      'Sample command description',
      (yargs: Argv) => yargs,
      this.handle.bind(this)
    );
  }

  async handle(): Promise<void> {
    // Command implementation here
  }
}
```

### Command with Arguments and Options

```typescript
interface HandlerArgv {
  name: string;
  email: string;
  admin?: boolean;
}

export default class CreateUserCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:user <name>',
      'Create a new user account',
      (yargs) =>
        yargs
          .positional('name', {
            describe: 'User name',
            type: 'string',
          })
          .option('email', {
            describe: 'User email address',
            demandOption: true,
            type: 'string',
          })
          .option('admin', {
            describe: 'Create as admin user',
            type: 'boolean',
            default: false,
          }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { name, email, admin } = argv;
    console.log(`Creating user: ${name} (${email})`);
    if (admin) console.log('User will have admin privileges');
  }
}
```

## Command Registration

Commands are automatically registered by the Console Kernel through file system scanning:

1. **Core Commands**: Located in `/packages/core/src/commands/`
2. **Application Commands**: Located in your app's `console/commands/` directory

The Console Kernel loads and registers commands like this:

```typescript
// From ConsoleKernel
await FileHelper.loadFiles(
  path.join(__dirname, '../commands'),  // Core commands
  (CmdClass: unknown) => {
    if (
      typeof CmdClass === 'function' &&
      CmdClass.prototype instanceof ConsoleCommand
    ) {
      const instance = new CmdClass(this.app);
      instance.define(yargCmd);
    }
  }
);

await FileHelper.loadFiles(
  this.app.getRootPath('console/commands'),  // App commands
  // Same registration logic
);
```

## Built-in Commands

BlitzBun includes several built-in commands:

### Database Commands
- `db:seed` - Run database seed files from `/database/seeds`

### Generator Commands  
- `create:command --command=<name>` - Generate new command file
- `create:controller --module=<module> --controller=<name>` - Generate controller
- `create:model --module=<module> --model=<name>` - Generate model
- `create:middleware --module=<module> --middleware=<name>` - Generate middleware
- `create:repository --module=<module> --repository=<name>` - Generate repository
- `create:transformer --module=<module> --transformer=<name>` - Generate transformer
- `create:validator --module=<module> --validator=<name>` - Generate validator
- `create:module --module=<name>` - Generate complete module structure

### Testing Commands
- `test:cron --job=<job-name>` - Test cron job execution without scheduler

## Real Examples from the Codebase

### Database Seed Command

```typescript
// From db:seed.ts
export default class DBSeedCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command(
      'db:seed',
      'Run all database seed files located in /database/seeds',
      (yargs: Argv) => yargs,
      this.handle.bind(this)
    );
  }

  async handle(): Promise<void> {
    const spinner = ora();
    try {
      spinner.start(chalk.blue('Running database seeds'));

      const seedDirPath = this.app.getRootPath('database/seeds');
      for (const seed of FileHelper.getDirFiles(seedDirPath)) {
        const seedPath = path.join(seedDirPath, seed);
        if (FileHelper.fileExists(seedPath)) {
          await (
            await FileHelper.getFileAsync<CallableFunction>(seedPath)
          )();
        }
      }

      spinner.succeed(chalk.green('Seed ran successfully!!'));
    } catch (error) {
      spinner.fail(chalk.red('Operation failed'));
      console.error(chalk.red('Error details:'), error);
      process.exit(1);
    }
  }
}
```

### Command Generator

```typescript
// From make:command.ts
interface HandlerArgv {
  command: string;
}

export default class CreateCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'create:command',
      'Creates a new command file for the given module',
      (yargs) =>
        yargs.option('command', {
          describe: 'Name of the command to create',
          demandOption: true,
          type: 'string',
        }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { command } = argv;
    
    const commandName = toPascalCase(command);
    const consolePath = this.app.getRootPath('console/commands');
    const templatePath = path.join(__dirname, '../../templates');

    FileHelper.createDir(consolePath);
    const targetFile = lodash.template(
      await FileHelper.getFileAsync(path.join(templatePath, 'command.txt'))
    )({
      command: commandName,
      commandSlug: command,
    });

    FileHelper.createFile(
      path.join(consolePath, `${command}.ts`),
      targetFile
    );
  }
}
```

### Cron Job Test Command

```typescript
// From test:cron.ts
interface HandlerArgv {
  job: string;
}

export default class TestCronJob extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'test:cron',
      'Runs test cron job without actually running a cron',
      (yargs: Argv) =>
        yargs.option('job', {
          describe: 'Name of the job to run',
          demandOption: true,
          type: 'string',
        }),
      this.handle.bind(this)
    );
  }

  async handle(argv: HandlerArgv): Promise<void> {
    const { job } = argv;

    const cronDir = this.app.getRootPath('console/crons');
    const JobClass = await FileHelper.getFileAsync(path.join(cronDir, job));
    
    if (
      typeof JobClass === 'function' &&
      JobClass.prototype instanceof CronJob
    ) {
      const jobInstance = new JobClass(this.app);
      await jobInstance.handle();
    }
  }
}
```

## Creating Commands

### Using the Generator

Generate a new command using the built-in generator:

```bash
bun run console create:command --command=my-command
```

This creates a new file at `console/commands/my-command.ts` using this template:

```typescript
import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';

export default class MyCommandCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command(
      'my-command',
      'Sample command description',
      (yargs: Argv) => yargs,
      this.handle.bind(this)
    );
  }

  async handle(): Promise<void> {
    // write logic here
  }
}
```

### Manual Creation

1. Create a new file in `console/commands/`
2. Extend `ConsoleCommand` from `@blitzbun/contracts`
3. Implement the `define()` and `handle()` methods
4. Export as default

## Integration with Console Kernel

Commands are executed within the application context provided by the Console Kernel:

1. **Application Booting**: The kernel boots the application before command execution
2. **Container Access**: Commands have access to the application container via `this.app`
3. **Service Resolution**: Use `this.app.get()` to resolve services
4. **Path Helpers**: Use `this.app.getRootPath()` for application paths
5. **Module Access**: Use `this.app.getModulePath()` for module-specific paths

### Example Service Usage

```typescript
async handle(argv: any): Promise<void> {
  // Get services from the container
  const userService = this.app.get('userService');
  const logger = this.app.get('logger');
  const database = this.app.get('database');
  
  // Use application paths
  const configPath = this.app.getRootPath('config');
  const modulePath = this.app.getModulePath('users');
  
  // Your command logic here
}
```

## Best Practices

1. **Use TypeScript Interfaces**: Define typed interfaces for command arguments
2. **Validate Input**: Use yargs validation options like `demandOption`, `choices`, and `type`
3. **Handle Errors**: Always wrap command logic in try-catch blocks
4. **Provide Progress**: Use libraries like `ora` for spinners and progress indication
5. **Exit Codes**: Use `process.exit(1)` for command failures
6. **Clear Descriptions**: Write helpful command and option descriptions
7. **Use Colors**: Use `chalk` for colored console output to improve readability

Commands provide a powerful way to interact with your BlitzBun application from the command line, offering the full power of your application context in a CLI-friendly interface.