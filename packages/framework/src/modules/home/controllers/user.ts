import { HttpRequestContract, HttpResponseContract } from '@blitzbun/contracts';

import UserRepository from '@modules/home/repository/user';
import UsersTransformer from '@modules/home/transformers/user';

export default class UserController {
  home = async (req: HttpRequestContract, res: HttpResponseContract) => {
    return res.status(200).json({
      success: true,
    });
  };

  fetch = async (req: HttpRequestContract, res: HttpResponseContract) => {
    const validator = req.getValidator('user');
    const userUuid = req.query<string>('uuid') as string;

    if (await validator.fails()) {
      return res.status(400).json({
        success: false,
        errors: validator.getErrors(),
      });
    }

    const userRepository = new UserRepository();
    const userTransformer = new UsersTransformer(req);

    const user = await userRepository.getByUuid(userUuid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      data: await userTransformer.transform(user),
    });
  };
}
