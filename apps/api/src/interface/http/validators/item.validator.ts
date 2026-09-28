import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    type: z.enum(['LOST', 'FOUND']),
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    categoryId: z.string().min(1),
    brand: z.string().optional(),
    color: z.string().optional(),
    building: z.string().optional(),
    floor: z.string().optional(),
    room: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    lostFoundDate: z.string(),
    reward: z.string().optional(),
    visibility: z.enum(['PUBLIC', 'UNIVERSITY_ONLY']).default('UNIVERSITY_ONLY'),
  }),
});

export const updateItemSchema = z.object({
  body: createItemSchema.shape.body.partial(),
});

export const listItemsSchema = z.object({
  query: z.object({
    type: z.enum(['LOST', 'FOUND']).optional(),
    categoryId: z.string().optional(),
    status: z.string().optional(),
    q: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});