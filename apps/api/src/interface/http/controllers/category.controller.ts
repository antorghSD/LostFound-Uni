import { Request, Response } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: categories });
});

export const listLocations = asyncHandler(async (_req: Request, res: Response) => {
  const locations = await prisma.handoverLocation.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: locations });
});