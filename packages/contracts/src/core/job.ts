import ApplicationContract from './application';

export default abstract class CronJob {
  constructor(protected app: ApplicationContract) {}

  abstract getSchedule(): string;
  abstract handle(): Promise<void>;
}
