import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as c from '../controllers/notification.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', c.list);
router.get('/unread-count', c.unreadCount);
router.patch('/:id/read', c.markRead);
router.patch('/read-all', c.markAllRead);
export default router;