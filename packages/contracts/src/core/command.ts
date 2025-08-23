import type { Argv } from 'yargs';
import ApplicationContract from './application';

export default abstract class ConsoleCommand {
  constructor(protected app: ApplicationContract) {}

  abstract handle(args?: unknown): Promise<void>;
  abstract define(yargs: Argv): Argv;
}
