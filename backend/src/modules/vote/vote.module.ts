import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';

import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';

export class VoteModule {
  constructor(app: ThanhHoa) {
    const voteService = new VoteService();
    const voteController = new VoteController(voteService);

    app.group('/vote', (app) => {
      app.get('', (context: IRequestContext) =>
        voteController.getVotesWithPagination(context),
      );
    });
  }
}
