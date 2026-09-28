import { prisma } from '../../infrastructure/database/prisma.js';
import { scoreMatch } from '../../domain/services/matchScore.js';
import { logger } from '../../config/logger.js';

const MATCH_THRESHOLD = 0.55;

export class MatchService {
  async findMatchesForItem(itemId: string) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return [];

    const opposite = item.type === 'LOST' ? 'FOUND' : 'LOST';
    const candidates = await prisma.item.findMany({
      where: { type: opposite, status: 'OPEN', deletedAt: null, userId: { not: item.userId } },
    });

    const matches = [];
    for (const c of candidates) {
      const { score, signals } = scoreMatch(item, c);
      if (score >= MATCH_THRESHOLD) {
        const [lostItemId, foundItemId] =
          item.type === 'LOST' ? [item.id, c.id] : [c.id, item.id];

        const existing = await prisma.match.findUnique({
          where: { lostItemId_foundItemId: { lostItemId, foundItemId } },
        });
        if (existing) continue;

        const match = await prisma.match.create({
          data: { lostItemId, foundItemId, score, signals },
        });
        matches.push(match);

        // Notify both
        await prisma.notification.createMany({
          data: [
            { userId: item.userId, type: 'MATCH_FOUND', title: 'Possible match found!', body: `Your "${item.title}" may match "${c.title}" (score ${score})`, link: `/items/${c.id}` },
            { userId: c.userId, type: 'MATCH_FOUND', title: 'Possible match found!', body: `Your "${c.title}" may match "${item.title}" (score ${score})`, link: `/items/${item.id}` },
          ],
        });
      }
    }

    logger.info({ itemId, matches: matches.length }, 'matching complete');
    return matches;
  }

  async listMatchesForItem(itemId: string) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return [];
    const where = item.type === 'LOST' ? { lostItemId: itemId } : { foundItemId: itemId };
    return prisma.match.findMany({
      where,
      include: {
        lostItem: { include: { images: true, category: true } },
        foundItem: { include: { images: true, category: true } },
      },
      orderBy: { score: 'desc' },
    });
  }
}

export const matchService = new MatchService();