import type { AppRegistry } from '@blitzbun/contracts';
import { AppContext, BasePgRepository } from '@blitzbun/core';

import Users, { UsersModel } from '../models/user';

export default class UsersRepository<
  AR extends AppRegistry = AppRegistry,
> extends BasePgRepository<typeof Users, AR> {
  protected table = Users;

  constructor() {
    super(AppContext.get<AR>());
  }

  async getByUuid(uuid: string): Promise<UsersModel | null> {
    return await this.findBy('uuid', uuid);
  }
}
