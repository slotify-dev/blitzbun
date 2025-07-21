import { CacheProvider } from '@blitzbun/cache';
import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

const application = new Application(__dirname);

application.registerProviders([
  // cache provider
  new CacheProvider(),
]);

(async () => await new HttpKernel(application).handle().catch((e) => console.log(e)))();
