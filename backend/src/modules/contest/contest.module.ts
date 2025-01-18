import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';

export class ContestModule {
  constructor(app: ThanhHoa) {
    const contestService = new ContestService();
    const contestController = new ContestController(contestService);

    app.get('/contest', (context: IRequestContext) =>
      contestController.getContestsWithPagination(context),
    );

    app.post('/contest', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
      contestController.createContest(context),
    );

    app.get('/contest/statistics', (context: IRequestContext) =>
      contestController.getContestStatistics(context),
    );

    app.get('/contest/:contestId/pie-chart', (context: IRequestContext) =>
      contestController.getCandidatePieChart(context),
    );

    app.get('/contest/:contestId/stacked-chart', (context: IRequestContext) =>
      contestController.getCandidateStackedChart(context),
    );
  }
}
