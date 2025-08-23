import { ProfilerSnapshot } from '../types';

export default interface ProfilerContract {
  /**
   * Start a named timer.
   * @param label Unique label to track elapsed time.
   */
  start(label: string): void;

  /**
   * End a timer and return the duration string.
   * @param label Timer label previously started.
   */
  end(label: string): string;

  /**
   * Log current memory usage to the console.
   * @param label Optional label prefix for clarity.
   */
  logMemory(label?: string): void;

  /**
   * Capture current memory and uptime info.
   */
  snapshot(): ProfilerSnapshot;
}
