import { Request, Response } from 'express';
import { itemService } from '../../../application/use-cases/item.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../../domain/errors/AppError.js';

const getId = (req: Request): string => String(req.params.id);

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const item = await itemService.create({ ...req.body, userId: req.user.id });
  res.status(201).json({ success: true, data: item });
});

export const listItems = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as any;
  const result = await itemService.list({
    type: query.type,
    categoryId: query.categoryId,
    status: query.status,
    q: query.q,
    cursor: query.cursor,
    limit: Number(query.limit) || 20,
  });
  res.json({ success: true, ...result });
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await itemService.getById(getId(req));
  res.json({ success: true, data: item });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const item = await itemService.update(getId(req), req.user.id, req.body);
  res.json({ success: true, data: item });
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  await itemService.softDelete(getId(req), req.user.id);
  res.status(204).send();
});

export const myItems = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const items = await itemService.myItems(req.user.id);
  res.json({ success: true, data: items });
});