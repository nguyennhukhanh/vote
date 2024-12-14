import { SortEnum } from 'src/shared/enums';

import type { GeminiService } from '../bot/gemini.service';
import type { VoteService } from '../vote/vote.service';

export class ChatService {
  private replacer(key: string, value: any) {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }

  constructor(
    private readonly geminiService: GeminiService,
    private readonly voteService: VoteService,
  ) {}

  async ask(message: string): Promise<string> {
    const response = await this.voteService.getVotesWithPagination({
      sort: SortEnum.DESC,
      page: 1,
      limit: 50,
    });
    return await this.geminiService.ask(
      message + '```' + JSON.stringify(response.items, this.replacer) + '```',
    );
  }
}
