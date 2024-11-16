import { redisService } from '../services/shared.service';
import { CrawlService } from './crawl.service';

export class WorkerModule {
  constructor() {
    new CrawlService(redisService);
  }
}
