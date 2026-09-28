import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { uploadImage } from '../../../infrastructure/storage/cloudinary.service.js';
import { UnauthorizedError } from '../../../domain/errors/AppError.js';
import { prisma } from '../../../infrastructure/database/prisma.js';

export const uploadItemImages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const itemId = String(req.params.id);
  const files = req.files as Express.Multer.File[];
  if (!files?.length) return res.status(400).json({ success: false, error: 'No files' });

  const urls = await Promise.all(files.map((f) => uploadImage(f.buffer)));

  await prisma.itemImage.createMany({
    data: urls.map((url, i) => ({ itemId, url, order: i })),
  });

  res.status(201).json({ success: true, data: urls });
});