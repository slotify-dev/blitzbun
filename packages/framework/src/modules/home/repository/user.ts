import type { AppRegistry, ContainerContract } from '@blitzbun/contracts';
import { BasePgRepository } from '@blitzbun/core';

import Users, { UsersModel } from '../models/user';

export default class UsersRepository<
  AR extends AppRegistry = AppRegistry,
> extends BasePgRepository<typeof Users, AR> {
  protected table = Users;

  constructor(container: ContainerContract<AR>) {
    super(container);
  }

  async getByUuid(uuid: string): Promise<UsersModel | null> {
    return await this.findBy('uuid', uuid);
  }
}
