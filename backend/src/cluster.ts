import { cpus } from 'node:os';

import { Logger } from '@thanhhoajs/logger';
import cluster from 'cluster';

import { startServer } from './main';

const logger = Logger.get('Cluster');
const numCPUs = cpus().length / 2;
logger.verbose(`Number of CPUs: ${numCPUs}`);

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died`);
  });
} else {
  void startServer();
  logger.verbose(`Worker ${process.pid} started`);
}
