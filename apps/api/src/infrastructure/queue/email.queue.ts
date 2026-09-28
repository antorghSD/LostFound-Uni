import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../database/prisma.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { sendEmail } from '../email/email.service.js';
import { matchFoundTemplate } from '../email/templates/match-found.js';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email', { connection });

interface MatchEmailJob {
  userId: string;
  yourItemId: string;
  matchItemId: string;
  score: number;
}

export const startEmailWorker = () => {
  const worker = new Worker<MatchEmailJob>(
    'email',
    async (job) => {
      if (job.name !== 'match-found') return;

      const { userId, yourItemId, matchItemId, score } = job.data;
      logger.info({ jobId: job.id, userId }, 'Processing match email');

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          emailMatches: true,
          isBanned: true,
          deletedAt: true,
        },
      });

      if (!user || user.isBanned || user.deletedAt) {
        logger.info({ userId }, 'User skipped (banned/deleted)');
        return;
      }

      if (!user.emailMatches) {
        logger.info({ userId }, 'User opted out of match emails');
        return;
      }

      const [yourItem, matchItem] = await Promise.all([
        prisma.item.findUnique({
          where: { id: yourItemId },
          include: { category: true },
        }),
        prisma.item.findUnique({
          where: { id: matchItemId },
          include: { category: true },
        }),
      ]);

      if (!yourItem || !matchItem) {
        logger.warn({ yourItemId, matchItemId }, 'Item(s) not found');
        return;
      }

      const { html, text } = matchFoundTemplate({
        userName: user.name,
        yourItemTitle: yourItem.title,
        yourItemType: yourItem.type as 'LOST' | 'FOUND',
        matchItemTitle: matchItem.title,
        matchItemDescription: matchItem.description,
        matchCategoryName: matchItem.category.name,
        matchLocation: matchItem.building || undefined,
        matchScore: score,
        matchItemId: matchItem.id,
        appUrl: env.APP_URL,
      });

      const result = await sendEmail({
        to: user.email,
        subject: `🎉 Possible match for your "${yourItem.title}"`,
        html,
        text,
      });

      if (!result.success) {
        throw new Error(result.error || 'Email send failed');
      }
    },
    { connection, concurrency: 5 }
  );

  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Email job done'));
  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err: err.message }, 'Email job failed')
  );

  return worker;
};