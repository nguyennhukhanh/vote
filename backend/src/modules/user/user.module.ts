import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { userService } from '../services/shared.service';
import { UserController } from './user.controller';

export class UserModule {
  constructor(app: ThanhHoa) {
    const userController = new UserController(userService);

    app.get('/user', GUARD(RoleEnum.USER), (context: IRequestContext) =>
      userController.getProfile(context),
    );

    app.get('/users', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
      userController.getUsersWithPagination(context),
    );

    app.patch('/user', GUARD(RoleEnum.USER), (context: IRequestContext) =>
      userController.updateProfile(context),
    );
  }
}
