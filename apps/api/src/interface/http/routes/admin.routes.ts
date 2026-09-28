import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', asyncHandler(async (_req, res) => {
  const [users, items, claims, matches, reports] = await Promise.all([
    prisma.user.count(),
    prisma.item.count({ where: { deletedAt: null } }),
    prisma.claim.count(),
    prisma.match.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);
  res.json({ success: true, data: { users, items, claims, matches, reports } });
}));

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, isVerified: true, isBanned: true, createdAt: true } });
  res.json({ success: true, data: users });
}));

router.patch('/users/:id/ban', asyncHandler(async (req, res) => {
  const u = await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: req.body.ban, banReason: req.body.reason } });
  res.json({ success: true, data: u });
}));

router.patch('/users/:id/verify', asyncHandler(async (req, res) => {
  const u = await prisma.user.update({ where: { id: req.params.id }, data: { isVerified: true } });
  res.json({ success: true, data: u });
}));

router.get('/audit-logs', asyncHandler(async (req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data: logs });
}));

router.get('/reports', asyncHandler(async (_req, res) => {
  const r = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: r });
}));

export default router;