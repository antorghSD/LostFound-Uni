import { Request, Response } from 'express';
import { claimService } from '../../../application/use-cases/claim.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../../domain/errors/AppError.js';

const getId = (req: Request): string => String(req.params.id);

export const createClaim = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.create(
    String(req.params.itemId),
    req.user.id,
    req.body.message,
    req.body.proofUrl,
    req.body.challengeAnswers
  );
  res.status(201).json({ success: true, data: c });
});

export const onMyItems = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.listOnMyItems(req.user.id);
  res.json({ success: true, data: c });
});

export const mine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.listMine(req.user.id);
  res.json({ success: true, data: c });
});

export const decide = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.decide(getId(req), req.user.id, req.body.status, req.body.reason);
  res.json({ success: true, data: c });
});

// 🆕 Claimant nijer claim edit korbe
export const updateMyClaim = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.updateMine(
    getId(req),
    req.user.id,
    req.body.message
  );
  res.json({ success: true, data: c });
});

// 🆕 Claimant nijer claim withdraw/delete korbe
export const withdrawClaim = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  await claimService.withdraw(getId(req), req.user.id);
  res.json({ success: true, message: 'Claim withdrawn' });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const msgs = await claimService.getMessages(getId(req), req.user.id);
  res.json({ success: true, data: msgs });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const msg = await claimService.sendMessage(getId(req), req.user.id, req.body.message);
  res.status(201).json({ success: true, data: msg });
});