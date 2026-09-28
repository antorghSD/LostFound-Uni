import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { matchService } from '../../../application/use-cases/match.service.js';

const router = Router();
router.get('/item/:itemId', authenticate, asyncHandler(async (req, res) => {
  const matches = await matchService.listMatchesForItem(req.params.itemId);
  res.json({ success: true, data: matches });
}));
export default router;