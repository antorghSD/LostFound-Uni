import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validator.js';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', validate(refreshSchema), logout);

export default router;