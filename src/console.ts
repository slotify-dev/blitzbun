import { Application, ConsoleKernel } from '@blitzbun/core';

(async () =>
  await new ConsoleKernel(new Application(__dirname))
    .handle()
    .catch((e) => console.log(e)))();
