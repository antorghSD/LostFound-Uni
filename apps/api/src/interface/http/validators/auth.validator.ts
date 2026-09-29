import { z } from 'zod';

export const registerBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z
    .string()
    .email()
    .refine(
  (email) =>
    email.endsWith('@bscse.uiu.ac.bd') ||
    email.endsWith('@bseee.uiu.ac.bd') ||
    email.endsWith('@bspharmecy.uiu.ac.bd') ||
    email.endsWith('@bsds.uiu.ac.bd') ||
    email.endsWith('@bsbba.uiu.ac.bd'),
  {
    message: 'Only UIU student email addresses are allowed',
  }
),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  studentId: z.string().optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(10).optional(),
});

export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
  }),
});