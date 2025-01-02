import { Logger } from '@thanhhoajs/logger';
import TelegramBot from 'node-telegram-bot-api';
import { botConfig } from 'src/configs/bot.config';
import { TelegramEventEnum } from 'src/shared/enums';

import type { GeminiService } from './gemini.service';

const logger = Logger.get('TelegramBot');

export class TelegramService {
  private readonly botToken = botConfig.telegramBotToken;
  private telegramBot = new TelegramBot(this.botToken, { polling: true });
  private telegramBotId = this.botToken.split(':')[0];

  private message = botConfig.telegramBotMessage;

  constructor(private readonly geminiService: GeminiService) {
    this._init();
  }
  async _init(): Promise<void> {
    this.telegramBot.on(TelegramEventEnum.PollingError, (error) => {
      logger.error('Polling Error');
      logger.error(error);
    });

    this.telegramBot.on(TelegramEventEnum.NewChatMembers, async (msg) => {
      this.handleEvent(() => this.handleNewMemberJoined(msg));
    });

    this.telegramBot.on(TelegramEventEnum.LeftChatMember, async (msg) => {
      this.handleEvent(() => this.handleMemberLeft(msg));
    });

    this.telegramBot.on(TelegramEventEnum.Message, async (msg) => {
      if (msg.from && !msg.from.is_bot) {
        this.handleEvent(async () => this.handleAsk(msg));
      }
    });

    logger.info('Telegram is ready!');
  }

  handleEvent = (_cb: () => void) => {
    try {
      _cb();
    } catch (error) {
      logger.error(error);
    }
  };

  handleNewMemberJoined = ({ chat, new_chat_members }: TelegramBot.Message) => {
    const chatId = chat.id;
    const newMembers = new_chat_members;

    if (!newMembers) return;
    for (const newMember of newMembers) {
      if (String(newMember.id) === this.telegramBotId) {
        const message = this.message;
        this.telegramBot.sendMessage(chatId, message);
      } else {
        const fullName = `${newMember.first_name} ${newMember.last_name}`;
        const username = newMember.username;
        const message =
          username === undefined
            ? `Xin chào ${fullName} đã đến group của mình nha!😍`
            : `Wow, @${username} bạn đã đến rồi sao!💞`;

        this.telegramBot.sendMessage(chatId, message);
      }
    }
  };

  handleMemberLeft = ({ chat, left_chat_member }: TelegramBot.Message) => {
    const chatId = chat.id;
    const leftMember = left_chat_member;

    if (!leftMember) return;
    const fullName = `${leftMember.first_name} ${leftMember.last_name}`;
    const username = leftMember.username;
    const message =
      username === undefined
        ? `${fullName} đã rời rồi sao! 😭`
        : `@${username}, Sao người lại nỡ rời đi! 😑`;

    this.telegramBot.sendMessage(chatId, message);
  };

  handleAsk = async ({ chat, text, from }: TelegramBot.Message) => {
    if (!text) return;

    const chatId = chat.id;

    // Using Gemini Bot
    const answer = await this.geminiService.ask(text);

    try {
      await this.telegramBot.sendMessage(chatId, answer, {
        parse_mode: 'Markdown',
      });
    } catch (error: any) {
      if (
        error.message.includes(
          "ETELEGRAM: 400 Bad Request: can't parse entities: Can't find end of the entity starting at byte offset",
        )
      ) {
        await this.telegramBot.sendMessage(chatId, answer);
      } else {
        logger.error(error.message);
      }
    }
  };
}
