import { BaseTransformer } from '@blitzbun/core';
import { UserModel } from '../models/user';

export default class UserTransformer extends BaseTransformer<
  UserModel,
  Partial<UserModel>
> {
  async toArray(model: UserModel): Promise<Partial<UserModel>> {
    return {
      uuid: model.uuid,
    };
  }
}
