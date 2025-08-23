import { Application } from '@blitzbun/core';
import { HttpKernel } from '@blitzbun/http';

(async () => {
  const application = new Application(__dirname);
  const kernel = new HttpKernel(application);
  await kernel.handle();
})().catch((e) => console.error('❌ Error during boot:', e));
