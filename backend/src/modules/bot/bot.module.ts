import { geminiService } from '../services/shared.service';
import { TelegramService } from './telegram.service';

export class BotModule {
  constructor() {
    new TelegramService(geminiService);
  }
}
