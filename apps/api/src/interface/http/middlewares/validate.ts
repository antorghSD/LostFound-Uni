import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../../../domain/errors/AppError.js';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const details = e.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new AppError('Validation failed', 422, details));
      } else {
        next(e);
      }
    }
  };