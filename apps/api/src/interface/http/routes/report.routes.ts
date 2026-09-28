import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.post('/', asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, details } = req.body;
  const r = await prisma.report.create({
    data: { reporterId: req.user!.id, targetType, targetId, reason, details, itemId: targetType === 'item' ? targetId : null },
  });
  res.status(201).json({ success: true, data: r });
}));

export default router;