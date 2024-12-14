import type { IRequestContext } from '@thanhhoajs/thanhhoa';
import { customResponse } from 'src/utils/custom-response';

import type { ChatService } from './chat.service';
import { ChatCreateDto } from './dto/chat.create';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * @swagger
   * /api/chat/ask:
   *   post:
   *     tags:
   *       - chat
   *     summary: Ask a question to the chatbot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 description: The user's question or message
   *     responses:
   *       200:
   *         description: Chatbot response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: string
   *                   description: The chatbot's response message
   */
  async ask(context: IRequestContext) {
    const { message } = await context.request.json();
    const dto = new ChatCreateDto(message);
    const result = await this.chatService.ask(dto.message);
    return customResponse(result);
  }
}
