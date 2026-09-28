import { Router } from 'express';
import { listCategories, listLocations } from '../controllers/category.controller.js';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', listCategories);

/**
 * @openapi
 * /categories/locations:
 *   get:
 *     tags: [Categories]
 *     summary: List handover locations
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get('/locations', listLocations);

export default router;