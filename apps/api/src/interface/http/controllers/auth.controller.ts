import { Request, Response } from 'express';
import { authService } from '../../../application/use-cases/auth.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../../domain/errors/AppError.js';
import { prisma } from '../../../infrastructure/database/prisma.js';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register({
    ...req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login({
    ...req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.status(200).json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(
    req.body.refreshToken,
    req.ip,
    req.headers['user-agent']
  );
  res.status(200).json({ success: true, data: tokens });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json({ success: true, data: result });
});
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      year: true,
      studentId: true,
      phone: true,
      avatarUrl: true,
      bio: true,
      isEmailVerified: true,
      isVerified: true,
      reputationScore: true,
      createdAt: true,
      _count: {
        select: { items: true, claims: true, ownedClaims: true },
      },
    },
  });
  if (!user) throw new UnauthorizedError('User not found');
  res.json({ success: true, data: user });
});