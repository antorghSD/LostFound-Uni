import { prisma } from '../../infrastructure/database/prisma.js';
import { randomBytes } from 'crypto';
import { NotFoundError, ForbiddenError } from '../../domain/errors/AppError.js';

export class HandoverService {
  async schedule(claimId: string, ownerId: string, locationId: string, scheduledAt: string) {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) throw new NotFoundError();
    if (claim.ownerId !== ownerId) throw new ForbiddenError();
    if (claim.status !== 'APPROVED') throw new ForbiddenError('Claim must be approved first');

    const qrCode = randomBytes(16).toString('hex');
    const h = await prisma.handover.create({
      data: { claimId, scheduledAt: new Date(scheduledAt), locationId, qrCode },
    });

    await prisma.notification.create({
      data: { userId: claim.claimantId, type: 'HANDOVER_SCHEDULED', title: 'Handover scheduled', body: `Pickup scheduled for ${scheduledAt}`, link: `/claims/${claimId}` },
    });
    return h;
  }
}

export const handoverService = new HandoverService();