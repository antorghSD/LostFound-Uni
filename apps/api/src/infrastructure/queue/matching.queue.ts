import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { matchService } from '../../application/use-cases/match.service.js';
import { logger } from '../../config/logger.js';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

export const matchingQueue = new Queue('matching', { connection });

export const startMatchingWorker = () => {
  const worker = new Worker(
    'matching',
    async (job) => {
      const { itemId } = job.data;
      await matchService.findMatchesForItem(itemId);
    },
    { connection }
  );
  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'match job done'));
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'match job failed'));
};