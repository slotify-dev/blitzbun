import { Application, CronKernel } from '@blitzbun/core';

(async () =>
  await new CronKernel(new Application(__dirname))
    .handle()
    .catch((e) => console.log(e)))();
