import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createItemSchema,
  updateItemSchema,
  listItemsSchema,
  idParamSchema,
} from '../validators/item.validator.js';
import {
  createItem, listItems, getItem, updateItem, deleteItem, myItems,
} from '../controllers/item.controller.js';

const router = Router();

/**
 * @openapi
 * /items:
 *   get:
 *     tags: [Items]
 *     summary: List items with filters
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [LOST, FOUND] }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of items
 *   post:
 *     tags: [Items]
 *     summary: Create a new item
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, description, categoryId, lostFoundDate]
 *             properties:
 *               type: { type: string, enum: [LOST, FOUND] }
 *               title: { type: string, example: "Black iPhone 13" }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               brand: { type: string }
 *               color: { type: string }
 *               building: { type: string }
 *               lostFoundDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Item created
 */
router.get('/', validate(listItemsSchema), listItems);
router.post('/', authenticate, validate(createItemSchema), createItem);

/**
 * @openapi
 * /items/mine:
 *   get:
 *     tags: [Items]
 *     summary: Get my items
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: My items
 */
router.get('/mine', authenticate, myItems);

/**
 * @openapi
 * /items/{id}:
 *   get:
 *     tags: [Items]
 *     summary: Get item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item found
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Items]
 *     summary: Update item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Items]
 *     summary: Delete item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.get('/:id', validate(idParamSchema), getItem);
router.patch('/:id', authenticate, validate(idParamSchema), validate(updateItemSchema), updateItem);
router.delete('/:id', authenticate, validate(idParamSchema), deleteItem);

export default router;