import { Router } from 'express';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';
import categoryRoutes from './category.routes.js';
import claimRoutes from './claim.routes.js';
import notificationRoutes from './notification.routes.js';
import matchRoutes from './match.routes.js';
import uploadRoutes from './upload.routes.js';
import adminRoutes from './admin.routes.js';
import reportRoutes from './report.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/categories', categoryRoutes);
router.use('/claims', claimRoutes);
router.use('/notifications', notificationRoutes);
router.use('/matches', matchRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);

export default router;