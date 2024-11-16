import { Logger } from '@thanhhoajs/logger';

import { runValidators } from './configs';
import { WorkerModule } from './modules/worker/worker.module';

// Set the timezone to UTC
process.env.TZ = 'Etc/Universal';

const logger = Logger.get('Worker');

runValidators();

export function startWorker() {
  new WorkerModule();
  logger.info('Worker started');
}

void startWorker();
