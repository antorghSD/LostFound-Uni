import { z } from 'zod';

// Auth
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Item
export const createItemSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  categoryId: z.string().cuid(),
  brand: z.string().optional(),
  color: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lostFoundDate: z.string().datetime(),
  reward: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;