import type { GenerativeModel } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '@thanhhoajs/logger';
import { botConfig } from 'src/configs/bot.config';

const logger = Logger.get('CrawlService');

export class GeminiService {
  private geminiKey!: string;
  private model!: string;
  private genAI!: GoogleGenerativeAI;
  private bot!: GenerativeModel;

  constructor() {
    this.init();
  }

  init(): void {
    this.geminiKey = botConfig.geminiPrivateKey;
    this.model = botConfig.geminiModel;

    this.genAI = new GoogleGenerativeAI(this.geminiKey);
    this.bot = this.genAI.getGenerativeModel({ model: this.model });

    logger.info('Gemini is ready!');
  }

  async ask(question: string): Promise<string> {
    try {
      const result = await this.bot.generateContent(
        botConfig.geminiBotMessage + question,
      );
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      throw error;
    }
  }
}
