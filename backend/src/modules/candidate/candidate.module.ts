import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';
import { RoleEnum } from 'src/shared/enums';

import { GUARD } from '../services/guard.service';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

export class CandidateModule {
  constructor(app: ThanhHoa) {
    const candidateService = new CandidateService();
    const candidateController = new CandidateController(candidateService);

    app.get('/candidate', (context: IRequestContext) =>
      candidateController.getCandidatesWithPagination(context),
    );

    app.get('/candidate/:id', (context: IRequestContext) =>
      candidateController.getCandidateById(context),
    );

    app.post(
      '/candidate/:voteId',
      GUARD(RoleEnum.ADMIN),
      (context: IRequestContext) =>
        candidateController.createCandidate(context),
    );
  }
}
