import { ConsoleCommand } from '@blitzbun/contracts';
import type { Argv } from 'yargs';

interface HandlerArgv {
  name?: string;
  count?: number;
}

export default class TestCommand extends ConsoleCommand {
  /**
   * Define command
   *
   * @param yargs
   * @returns
   */
  define(yargs: Argv): Argv {
    return yargs.command<HandlerArgv>(
      'test:command',
      'Sample test command for demonstration',
      (yargs: Argv) =>
        yargs
          .option('name', {
            describe: 'Name to greet',
            type: 'string',
            default: 'World',
          })
          .option('count', {
            describe: 'Number of times to greet',
            type: 'number',
            default: 1,
          }),
      this.handle.bind(this)
    );
  }

  /**
   * Function to handle command execution
   *
   * @param argv
   */
  async handle(argv: HandlerArgv): Promise<void> {
    const { name = 'World', count = 1 } = argv;

    console.log(`Starting test command...`);
    
    for (let i = 1; i <= count; i++) {
      console.log(`${i}. Hello, ${name}!`);
    }
    
    console.log(`Test command completed successfully.`);
  }
}