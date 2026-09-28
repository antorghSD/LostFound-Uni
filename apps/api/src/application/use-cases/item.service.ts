import { prisma } from '../../infrastructure/database/prisma.js';
import { ForbiddenError, NotFoundError } from '../../domain/errors/AppError.js';

interface CreateItemInput {
  userId: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  categoryId: string;
  brand?: string;
  color?: string;
  building?: string;
  floor?: string;
  room?: string;
  latitude?: number;
  longitude?: number;
  lostFoundDate: string;
  reward?: string;
  visibility: 'PUBLIC' | 'UNIVERSITY_ONLY';
}

interface ListItemsInput {
  type?: 'LOST' | 'FOUND';
  categoryId?: string;
  status?: string;
  q?: string;
  cursor?: string;
  limit: number;
  userId?: string;
}

export class ItemService {
  async create(input: CreateItemInput) {
    const item = await prisma.item.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        brand: input.brand,
        color: input.color,
        building: input.building,
        floor: input.floor,
        room: input.room,
        latitude: input.latitude,
        longitude: input.longitude,
        lostFoundDate: new Date(input.lostFoundDate),
        reward: input.reward,
        visibility: input.visibility,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      include: { category: true, images: true, user: { select: { id: true, name: true } } },
    });

    await prisma.auditLog.create({
      data: {
        actorId: input.userId,
        action: 'item.create',
        targetType: 'item',
        targetId: item.id,
      },
    });

    return item;
  }

  async list(input: ListItemsInput) {
    const where: any = { deletedAt: null, status: { not: 'ARCHIVED' } };
    if (input.type) where.type = input.type;
    if (input.categoryId) where.categoryId = input.categoryId;
    if (input.status) where.status = input.status;
    if (input.q) {
      where.OR = [
        { title: { contains: input.q } },
        { description: { contains: input.q } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > input.limit;
    const data = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { data, nextCursor, hasMore };
  }

  async getById(id: string) {
    const item = await prisma.item.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
      },
    });
    if (!item) throw new NotFoundError('Item not found');
    return item;
  }

  async update(id: string, userId: string, data: Partial<CreateItemInput>) {
    const item = await prisma.item.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundError('Item not found');
    if (item.userId !== userId) throw new ForbiddenError('Not your item');

    const updated = await prisma.item.update({
      where: { id },
      data: {
        ...data,
        ...(data.lostFoundDate ? { lostFoundDate: new Date(data.lostFoundDate) } : {}),
      },
    });

    await prisma.auditLog.create({
      data: { actorId: userId, action: 'item.update', targetType: 'item', targetId: id },
    });
    return updated;
  }

  async softDelete(id: string, userId: string) {
    const item = await prisma.item.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new NotFoundError('Item not found');
    if (item.userId !== userId) throw new ForbiddenError('Not your item');

    await prisma.item.update({ where: { id }, data: { deletedAt: new Date() } });
    await prisma.auditLog.create({
      data: { actorId: userId, action: 'item.delete', targetType: 'item', targetId: id },
    });
  }

  async myItems(userId: string) {
    return prisma.item.findMany({
      where: { userId, deletedAt: null },
      include: { category: true, images: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const itemService = new ItemService();