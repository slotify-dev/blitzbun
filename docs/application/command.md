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

## Creating Commands

### Using the Generator

Generate a new command using the built-in generator:

```bash
bun console create:command --command=my-command
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
