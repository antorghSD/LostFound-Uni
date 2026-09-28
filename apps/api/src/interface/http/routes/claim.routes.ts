import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as c from '../controllers/claim.controller.js';

const router = Router();
router.use(authenticate);

router.get('/on-my-items', c.onMyItems);
router.get('/mine', c.mine);
router.post('/item/:itemId', c.createClaim);
router.patch('/:id', c.decide);
router.get('/:id/messages', c.getMessages);
router.post('/:id/messages', c.sendMessage);

export default router;