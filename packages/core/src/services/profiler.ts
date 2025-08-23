import { ProfilerContract, ProfilerSnapshot } from '@blitzbun/contracts';

export default class ProfilerService implements ProfilerContract {
  private timers = new Map<string, number>();

  start(label: string) {
    this.timers.set(label, performance.now());
  }

  end(label: string): string {
    const start = this.timers.get(label);
    if (start === undefined) return `No start time for "${label}"`;
    const duration = performance.now() - start;
    this.timers.delete(label);
    return `${label}: ${duration.toFixed(2)} ms`;
  }

  logMemory(label: string = 'Memory'): void {
    const mem = process.memoryUsage();
    console.log(
      `[${label}] RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB | Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB | External: ${(mem.external / 1024 / 1024).toFixed(2)} MB`
    );
  }

  snapshot(): ProfilerSnapshot {
    const mem = process.memoryUsage();
    return {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
      uptime: `${process.uptime().toFixed(2)} s`,
    };
  }
}
