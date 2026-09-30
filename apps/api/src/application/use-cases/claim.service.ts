import { prisma } from '../../infrastructure/database/prisma.js';
import { ForbiddenError, NotFoundError, ConflictError } from '../../domain/errors/AppError.js';

export class ClaimService {
  async create(itemId: string, claimantId: string, message: string, proofUrl?: string, challengeAnswers?: any) {
    const item = await prisma.item.findFirst({ where: { id: itemId, deletedAt: null } });
    if (!item) throw new NotFoundError('Item not found');
    if (item.userId === claimantId) throw new ConflictError('Cannot claim your own item');
    if (item.status === 'RESOLVED') throw new ConflictError('Item already resolved');

    const existing = await prisma.claim.findFirst({ where: { itemId, claimantId, status: { in: ['PENDING', 'IN_REVIEW'] } } });
    if (existing) throw new ConflictError('You already have an active claim');

    const claim = await prisma.claim.create({
      data: { itemId, claimantId, ownerId: item.userId, message, proofUrl, challengeAnswers },
    });

    await prisma.notification.create({
      data: {
        userId: item.userId,
        type: 'CLAIM_NEW',
        title: 'New claim on your item',
        body: `Someone claims "${item.title}"`,
        link: `/claims/${claim.id}`,
      },
    });

    return claim;
  }

  async listOnMyItems(userId: string) {
    return prisma.claim.findMany({
      where: { ownerId: userId },
      include: { item: { select: { id: true, title: true } }, claimant: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMine(userId: string) {
    return prisma.claim.findMany({
      where: { claimantId: userId },
      include: { item: { select: { id: true, title: true } }, owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async decide(claimId: string, ownerId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const claim = await prisma.claim.findUnique({ where: { id: claimId }, include: { item: true } });
    if (!claim) throw new NotFoundError('Claim not found');
    if (claim.ownerId !== ownerId) throw new ForbiddenError('Not your item');

    const updated = await prisma.claim.update({
      where: { id: claimId },
      data: { status, rejectionReason: reason, approvedAt: status === 'APPROVED' ? new Date() : null },
    });

    if (status === 'APPROVED') {
      await prisma.item.update({ where: { id: claim.itemId }, data: { status: 'RESOLVED' } });
      await prisma.user.update({ where: { id: ownerId }, data: { reputationScore: { increment: 5 } } });
    }

    await prisma.notification.create({
      data: {
        userId: claim.claimantId,
        type: status === 'APPROVED' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED',
        title: `Claim ${status.toLowerCase()}`,
        body: `Your claim on "${claim.item.title}" was ${status.toLowerCase()}`,
        link: `/claims/${claim.id}`,
      },
    });

    return updated;
  }

  // 🆕 Claimant nijer claim edit korbe (only PENDING)
  async updateMine(claimId: string, userId: string, message: string) {
    if (!message || message.trim().length === 0) {
      throw new ConflictError('Message cannot be empty');
    }

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Claim not found');

    // 🛡️ Only claimant
    if (claim.claimantId !== userId) throw new ForbiddenError('Not your claim');

    // 🛡️ Only PENDING
    if (claim.status !== 'PENDING') {
      throw new ConflictError('You can only edit pending claims');
    }

    return prisma.claim.update({
      where: { id: claimId },
      data: { message: message.trim() },
    });
  }

  // 🆕 Claimant nijer claim withdraw korbe (only PENDING)
  async withdraw(claimId: string, userId: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: { select: { status: true } } },
    });
    if (!claim) throw new NotFoundError('Claim not found');

    // 🛡️ Only claimant
    if (claim.claimantId !== userId) throw new ForbiddenError('Not your claim');

    // 🛡️ Only PENDING
    if (claim.status !== 'PENDING') {
      throw new ConflictError('You can only withdraw pending claims');
    }

    // 🛡️ Item RESOLVED hole withdraw block
    if (claim.item?.status === 'RESOLVED') {
      throw new ConflictError('Item already resolved — cannot withdraw');
    }

    await prisma.claim.delete({ where: { id: claimId } });
  }

  async getMessages(claimId: string, userId: string) {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) throw new NotFoundError();
    if (claim.ownerId !== userId && claim.claimantId !== userId) throw new ForbiddenError();
    return prisma.claimMessage.findMany({ where: { claimId }, orderBy: { createdAt: 'asc' } });
  }

  async sendMessage(claimId: string, senderId: string, message: string) {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) throw new NotFoundError();
    if (claim.ownerId !== senderId && claim.claimantId !== senderId) throw new ForbiddenError();

    const msg = await prisma.claimMessage.create({ data: { claimId, senderId, message } });

    const recipient = claim.ownerId === senderId ? claim.claimantId : claim.ownerId;
    await prisma.notification.create({
      data: { userId: recipient, type: 'CLAIM_MESSAGE', title: 'New message', body: message.slice(0, 80), link: `/claims/${claimId}` },
    });

    return msg;
  }
}

export const claimService = new ClaimService();