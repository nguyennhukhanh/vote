import { Logger } from '@thanhhoajs/logger';

import { runValidators } from './configs';
import { BotModule } from './modules/bot/bot.module';

const logger = Logger.get('Bot');

runValidators();

export function startBot() {
  new BotModule();
  logger.info('Bot started');
}

void startBot();
