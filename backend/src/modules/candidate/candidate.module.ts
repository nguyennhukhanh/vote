import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';

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
    });
  }
}
