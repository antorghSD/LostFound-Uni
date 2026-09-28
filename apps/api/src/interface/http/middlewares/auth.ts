import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors/AppError.js';
import { verifyAccessToken, JwtPayload } from '../../../utils/jwt.js';
import { prisma } from '../../../infrastructure/database/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isBanned: true, deletedAt: true },
    });
    if (!user) throw new UnauthorizedError('User not found');
    if (user.isBanned) throw new UnauthorizedError('Account banned');
    if (user.deletedAt) throw new UnauthorizedError('Account deleted');

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (e) {
    if (e instanceof UnauthorizedError) return next(e);
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError('Insufficient permissions'));
    next();
  };