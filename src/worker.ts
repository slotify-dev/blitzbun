import { Application, WorkerKernel } from '@blitzbun/core';

(async () =>
  await new WorkerKernel(new Application(__dirname))
    .handle()
    .catch((e) => console.log(e)))();
