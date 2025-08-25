import { ApplicationContract, AppRegistry } from '@blitzbun/contracts';
import { AppProvider } from '@blitzbun/core';

import UserController from './controllers/user';

export default class HomeModuleProvider<
  T extends AppRegistry,
> extends AppProvider<T> {
  async boot(app: ApplicationContract<T>): Promise<void> {
    const router = app.get('router');
    const user = new UserController();

    router.setModule('home', app.getModulePath('home'));

    // home route
    router.get('/', user.home);

    // user routes
    router.group({ prefix: 'user' }, () => {
      router.get('/:uuid', user.fetch);
    });
  }
}
