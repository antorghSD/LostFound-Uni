import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validator.js';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Rahim Uddin" }
 *               email: { type: string, example: "rahim@university.edu" }
 *               password: { type: string, example: "RahimPass123" }
 *               department: { type: string, example: "CSE" }
 *               year: { type: integer, example: 3 }
 *     responses:
 *       201:
 *         description: User registered
 *       422:
 *         description: Validation failed
 */
router.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "rahim@university.edu" }
 *               password: { type: string, example: "RahimPass123" }
 *     responses:
 *       200:
 *         description: Logged in
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New tokens issued
 */
router.post('/refresh', validate(refreshSchema), refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       204:
 *         description: Logged out
 */
router.post('/logout', validate(refreshSchema), logout);

export default router;