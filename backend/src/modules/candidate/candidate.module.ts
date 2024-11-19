import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

export class CandidateModule {
  constructor(app: ThanhHoa) {
    const candidateService = new CandidateService();
    const candidateController = new CandidateController(candidateService);

    app.group('/candidate', (app) => {
      app.get('', (context: IRequestContext) =>
        candidateController.getCandidatesWithPagination(context),
      );

      app.get('/:id', (context: IRequestContext) =>
        candidateController.getCandidateById(context),
      );

      app.post('/:voteId', GUARD(RoleEnum.ADMIN), (context: IRequestContext) =>
        candidateController.createCandidate(context),
      );
    });
  }
}
