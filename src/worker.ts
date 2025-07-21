import { CacheProvider } from '@blitzbun/cache';
import { Application, WorkerKernel } from '@blitzbun/core';

const application = new Application(__dirname);
application.registerProvider(new CacheProvider());

(async () => await new WorkerKernel(application).handle().catch((e) => console.log(e)))();
