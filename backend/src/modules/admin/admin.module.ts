import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { AdminController } from './admin.controller';

export class AdminModule {
  constructor(app: ThanhHoa) {
    const adminController = new AdminController();

    app.get('/admin', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
      adminController.getProfile(context),
    );
  }
}
