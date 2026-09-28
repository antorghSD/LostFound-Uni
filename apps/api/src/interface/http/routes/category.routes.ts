import { Router } from 'express';
import { listCategories, listLocations } from '../controllers/category.controller.js';

const router = Router();
router.get('/', listCategories);
router.get('/locations', listLocations);
export default router;