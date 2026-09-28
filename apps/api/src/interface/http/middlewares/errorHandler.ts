import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../domain/errors/AppError.js';
import { logger } from '../../../config/logger.js';
import { env } from '../../../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  logger.error({
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(isAppError && err.details ? { details: err.details } : {}),
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};