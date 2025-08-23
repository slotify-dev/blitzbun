# Console Kernel

The Console Kernel manages command-line operations and CLI commands in your BlitzBun application. It provides an Artisan-like command-line interface that allows you to interact with your application through the terminal.

## What is the Console Kernel?

The Console Kernel transforms your BlitzBun application into a command-line tool. It discovers CLI commands, sets up argument parsing, provides help documentation, and executes commands with proper application context.

Think of it as your application's command center - a powerful interface that lets you perform administrative tasks, run maintenance operations, and interact with your application without a web browser.

## Purpose

The Console Kernel provides:

- **Command Discovery**: Automatically finds and loads CLI commands
- **Argument Parsing**: Handles command-line arguments and options with validation
- **Help System**: Provides comprehensive help and usage information
- **Context Isolation**: Executes commands with proper application context
- **Error Handling**: Graceful handling of command errors and failures
- **Interactive Interface**: Support for interactive prompts and confirmations

## Basic Usage

### Starting the Console Kernel

```typescript
import { Application } from '@blitzbun/core';
import { ConsoleKernel } from '@blitzbun/core';

const app = new Application(__dirname);
const kernel = new ConsoleKernel(app);

// Handle CLI commands
await kernel.handle();
```

### Complete Console Setup

```typescript
// src/console.ts
import { Application } from '@blitzbun/core';
import { ConsoleKernel } from '@blitzbun/core';

(async () => {
  try {
    const app = new Application(__dirname);
    const kernel = new ConsoleKernel(app);

    await kernel.handle();
  } catch (error) {
    console.error('❌ Console error:', error);
    process.exit(1);
  }
})();
```

## Creating Commands

### Basic Command Structure

```typescript
// console/commands/create-user.ts
import { ConsoleCommand } from '@blitzbun/contracts';
import { ApplicationContract } from '@blitzbun/contracts';
import { Argv } from 'yargs';

export default class CreateUserCommand extends ConsoleCommand {
  constructor(private app: ApplicationContract) {
    super();
  }

  define(yargs: Argv): Argv {
    return yargs.command(
      'create-user <name>', // Command signature
      'Create a new user account', // Description
      (yargs) => {
        return yargs
          .positional('name', {
            describe: 'User name',
            type: 'string',
          })
          .option('email', {
            describe: 'User email address',
            type: 'string',
            demandOption: true,
          })
          .option('admin', {
            describe: 'Create as admin user',
            type: 'boolean',
            default: false,
          })
          .option('password', {
            describe: 'User password (optional)',
            type: 'string',
          });
      },
      this.handle.bind(this)
    );
  }

  async handle(argv: any): Promise<void> {
    const { name, email, admin, password } = argv;
    const userService = this.app.get('userService');
    const logger = this.app.get('logger');

    try {
      logger.info('Creating new user', { name, email, admin });

      const userData = {
        name,
        email,
        isAdmin: admin,
        password: password || this.generateRandomPassword(),
      };

      const user = await userService.create(userData);

      console.log('✅ User created successfully!');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`);

      if (!password) {
        console.log(`Generated Password: ${userData.password}`);
        console.log('⚠️  Please save this password securely');
      }
    } catch (error) {
      logger.error('Failed to create user', { error: error.message });
      console.error('❌ Failed to create user:', error.message);
      process.exit(1);
    }
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-12);
  }
}
```

### Command with Validation

```typescript
// console/commands/seed-database.ts
export default class SeedDatabaseCommand extends ConsoleCommand {
  define(yargs: Argv): Argv {
    return yargs.command(
      'db:seed [table]',
      'Seed database with sample data',
      (yargs) => {
        return yargs
          .positional('table', {
            describe: 'Specific table to seed',
            type: 'string',
            choices: ['users', 'posts', 'categories', 'all'],
          })
          .option('count', {
            describe: 'Number of records to create',
            type: 'number',
            default: 10,
          })
          .option('force', {
            describe: 'Force seed even in production',
            type: 'boolean',
            default: false,
          });
      },
      this.handle.bind(this)
    );
  }

  async handle(argv: any): Promise<void> {
    const { table = 'all', count, force } = argv;
    const env = this.app.get('env');

    // Safety check for production
    if (env.get('NODE_ENV') === 'production' && !force) {
      console.error('❌ Cannot seed production database without --force flag');
      process.exit(1);
    }

    const seederService = this.app.get('seederService');

    try {
      console.log(`🌱 Seeding ${table} table(s) with ${count} records...`);

      if (table === 'all') {
        await seederService.seedAll(count);
      } else {
        await seederService.seed(table, count);
      }

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      process.exit(1);
    }
  }
}
```

## Built-in Commands

BlitzBun provides several built-in commands:

### Database Commands

- `db:seed` - Seed database with sample data
- `db:migrate` - Run database migrations
- `db:rollback` - Rollback database migrations

### Generator Commands

- `make:controller` - Generate a new controller
- `make:model` - Generate a new model
- `make:middleware` - Generate middleware
- `make:command` - Generate a new console command
- `make:validator` - Generate input validator

### Testing Commands

- `test:cron` - Test cron job execution

## Running Commands

### Command Line Usage

```bash
# Show all available commands
bun run console

# Run specific command
bun run console create-user "John Doe" --email="john@example.com"

# Command with flags
bun run console db:seed users --count=50 --force

# Interactive setup
bun run console app:setup

# Get help for specific command
bun run console create-user --help
```

### Package.json Scripts

```json
{
  "scripts": {
    "console": "bun run src/console.ts",
    "console:dev": "bun --hot src/console.ts",

    // Convenience shortcuts for common commands
    "db:seed": "bun run console db:seed",
    "db:migrate": "bun run console db:migrate",
    "make:controller": "bun run console make:controller",
    "user:create": "bun run console create-user"
  }
}
```

## Command Generation

Use the built-in generator to create new commands:

```bash
# Generate a new command
bun run console make:command --name=send-emails

# This creates: console/commands/send-emails.ts
```

Generated command template:

```typescript
import { ConsoleCommand } from '@blitzbun/contracts';
import { ApplicationContract } from '@blitzbun/contracts';
import { Argv } from 'yargs';

export default class SendEmailsCommand extends ConsoleCommand {
  constructor(private app: ApplicationContract) {
    super();
  }

  define(yargs: Argv): Argv {
    return yargs.command(
      'send-emails',
      'Send emails command description',
      {},
      this.handle.bind(this)
    );
  }

  async handle(argv: any): Promise<void> {
    // Command implementation here
    console.log('Command executed successfully');
  }
}
```

## Error Handling

### Command-Level Error Handling

```typescript
export default class BackupDatabaseCommand extends ConsoleCommand {
  async handle(argv: any): Promise<void> {
    const logger = this.app.get('logger');

    try {
      console.log('🗄️  Starting database backup...');

      const backupService = this.app.get('backupService');
      const backupPath = await backupService.createBackup();

      console.log('✅ Backup completed successfully');
      console.log(`Backup saved to: ${backupPath}`);
    } catch (error) {
      logger.error('Backup failed', {
        error: error.message,
        stack: error.stack,
      });

      console.error('❌ Backup failed:', error.message);

      // Exit with error code for scripts
      process.exit(1);
    }
  }
}
```

### Global Error Handling

The Console Kernel provides global error handling:

```typescript
// Automatic error handling includes:
// - Unhandled command errors
// - Application boot errors
// - Service resolution errors
// - Command not found errors

// Errors are automatically:
// - Logged with full context
// - Displayed in user-friendly format
// - Cause proper exit codes
```

## Best Practices

1. **Clear Command Names**: Use descriptive, action-oriented command names
2. **Comprehensive Help**: Provide detailed descriptions and examples
3. **Input Validation**: Always validate command arguments and options
4. **Error Handling**: Handle errors gracefully with proper exit codes
5. **Logging**: Log command execution for debugging and auditing
6. **Progress Indication**: Show progress for long-running commands
7. **Confirmation Prompts**: Ask for confirmation before destructive operations
8. **Environment Awareness**: Check environment before running dangerous commands

## Next Steps

- [Worker Kernel](./worker-kernel.md) - Learn about background job processing
- [Cron Kernel](./cron-kernel.md) - Schedule commands to run automatically
- [HTTP Kernel](./http-kernel.md) - Web server functionality
- [Application](../application.md) - Understanding the application context
