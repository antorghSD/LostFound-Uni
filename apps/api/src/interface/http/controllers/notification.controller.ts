import { Request, Response } from 'express';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../../domain/errors/AppError.js';

export const list = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const items = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: items });
});

export const markRead = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true },
  });
  res.json({ success: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  res.json({ success: true });
});

export const unreadCount = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
  res.json({ success: true, data: { count } });
});