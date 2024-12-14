import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';

import { voteService } from '../services/shared.service';
import { VoteController } from './vote.controller';

export class VoteModule {
  constructor(app: ThanhHoa) {
    const voteController = new VoteController(voteService);

    app.group('/vote', (app) => {
      app.get('', (context: IRequestContext) =>
        voteController.getVotesWithPagination(context),
      );
    });
  }
}
