import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { uploadItemImages } from '../controllers/upload.controller.js';

const router = Router();
router.post('/items/:id/images', authenticate, upload.array('images', 5), uploadItemImages);
export default router;