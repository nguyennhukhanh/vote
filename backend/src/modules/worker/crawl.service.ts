import { Logger } from '@thanhhoajs/logger';
import pLimit from 'p-limit';

const logger = Logger.get('CrawlService');

enum EventType {
  CandidateAdded,
  VoteCreated,
  Voted,
}

const BATCH_SIZE = 100;
const BATCH_LIMIT = 20;
const limit = pLimit(BATCH_LIMIT);

export class CrawlService {
  constructor() {}
}
