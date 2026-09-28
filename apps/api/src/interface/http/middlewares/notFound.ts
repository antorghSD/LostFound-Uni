import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../../domain/errors/AppError.js';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route not found'));
};