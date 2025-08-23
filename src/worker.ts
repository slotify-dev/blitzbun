import { Application, WorkerKernel } from '@blitzbun/core';

const application = new Application(__dirname);

(async () =>
  await new WorkerKernel(application)
    .handle()
    .catch((e) => console.log(e)))();
