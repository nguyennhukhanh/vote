import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { UserController } from './user.controller';

export class UserModule {
  constructor(app: ThanhHoa) {
    const userController = new UserController();

    app.get('/user', GUARD(RoleEnum.USER), (context: IRequestContext) =>
      userController.getProfile(context),
    );
  }
}
