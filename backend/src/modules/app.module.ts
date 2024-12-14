import type { ThanhHoa } from '@thanhhoajs/thanhhoa';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CandidateModule } from './candidate/candidate.module';
import { ChatModule } from './chat/chat.module';
import { ContestModule } from './contest/contest.module';
import { DefaultModule } from './default/default.module';
import { UserModule } from './user/user.module';
import { VoteModule } from './vote/vote.module';

export class AppModule {
  constructor(app: ThanhHoa) {
    new DefaultModule(app);
    new AuthModule(app);
    new AdminModule(app);
    new UserModule(app);
    new ContestModule(app);
    new CandidateModule(app);
    new VoteModule(app);
    new ChatModule(app);
  }
}
