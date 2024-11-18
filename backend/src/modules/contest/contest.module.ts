import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';

export class ContestModule {
  constructor(app: ThanhHoa) {
    const contestService = new ContestService();
    const contestController = new ContestController(contestService);

    app.group('/contest', (app) => {
      app.get('', (context: IRequestContext) =>
        contestController.getContestsWithPagination(context),
      );

      app.post('', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
        contestController.createContest(context),
      );
    });
  }
}
