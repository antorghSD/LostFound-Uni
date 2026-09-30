import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as c from '../controllers/claim.controller.js';

const router = Router();
router.use(authenticate);

router.get('/on-my-items', c.onMyItems);
router.get('/mine', c.mine);
router.post('/item/:itemId', c.createClaim);

// Owner: approve/reject
router.patch('/:id/status', c.decide);

// Claimant: edit message (only PENDING)
router.patch('/:id', c.updateMyClaim);

// Claimant: withdraw/delete (only PENDING)
router.delete('/:id', c.withdrawClaim);

router.get('/:id/messages', c.getMessages);
router.post('/:id/messages', c.sendMessage);

export default router;