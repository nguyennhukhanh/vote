import type { IRequestContext, ThanhHoa } from '@thanhhoajs/thanhhoa';

import { geminiService, voteService } from '../services/shared.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

export class ChatModule {
  constructor(app: ThanhHoa) {
    const chatService = new ChatService(geminiService, voteService);
    const chatController = new ChatController(chatService);

    app.post('/chat/ask', (context: IRequestContext) =>
      chatController.ask(context),
    );
  }
}
