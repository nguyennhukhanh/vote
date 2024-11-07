import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';

import { DefaultController } from './default.controller';
import { DefaultService } from './default.service';

export class DefaultModule {
  constructor(app: ThanhHoa) {
    const defaultService = new DefaultService();
    const defaultController = new DefaultController(defaultService);

    app.get('', (context: IRequestContext) => defaultController.hello());

    app.get('/user-agent', (context: IRequestContext) =>
      defaultController.userAgent(context),
    );
  }
}
