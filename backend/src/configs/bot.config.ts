import { createValidator } from '@thanhhoajs/validator';

const botValidator = createValidator();

botValidator.field('geminiPrivateKey').required().string();
botValidator.field('geminiModel').required().string();
botValidator.field('geminiBotMessage').required().string();
botValidator.field('telegramBotToken').required().string();
botValidator.field('telegramBotMessage').required().string();

const botConfig = {
  geminiPrivateKey: process.env.GEMINI_PRIVATE_KEY as string,
  geminiModel: process.env.GEMINI_MODEL as string,
  geminiBotMessage: process.env.GEMINI_BOT_MESSAGE as string,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN as string,
  telegramBotMessage: process.env.TELEGRAM_BOT_MESSAGE as string,
};

export { botConfig, botValidator };
