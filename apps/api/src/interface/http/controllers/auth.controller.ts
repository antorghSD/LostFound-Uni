import { Request, Response } from 'express';
import { authService } from '../../../application/use-cases/auth.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

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