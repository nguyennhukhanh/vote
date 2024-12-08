import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { adminService } from '../services/shared.service';
import { AdminController } from './admin.controller';

export class AdminModule {
  constructor(app: ThanhHoa) {
    const adminController = new AdminController(adminService);

    app.get('/admin', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
      adminController.getProfile(context),
    );

    app.get('/admins', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
      adminController.getAdminsWithPagination(context),
    );
  }
}
