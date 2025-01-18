import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';

import { voteService } from '../services/shared.service';
import { VoteController } from './vote.controller';

export class VoteModule {
  constructor(app: ThanhHoa) {
    const voteController = new VoteController(voteService);

    app.get('/vote', (context: IRequestContext) =>
      voteController.getVotesWithPagination(context),
    );
  }
}
