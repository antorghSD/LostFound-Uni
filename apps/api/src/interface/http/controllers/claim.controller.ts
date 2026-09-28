import { Request, Response } from 'express';
import { claimService } from '../../../application/use-cases/claim.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { UnauthorizedError } from '../../../domain/errors/AppError.js';

export const createClaim = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.create(req.params.itemId, req.user.id, req.body.message, req.body.proofUrl, req.body.challengeAnswers);
  res.status(201).json({ success: true, data: c });
});

export const onMyItems = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.listOnMyItems(req.user.id);
  res.json({ success: true, data: c });
});

export const mine = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.listMine(req.user.id);
  res.json({ success: true, data: c });
});

export const decide = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const c = await claimService.decide(req.params.id, req.user.id, req.body.status, req.body.reason);
  res.json({ success: true, data: c });
});

export const getMessages = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const msgs = await claimService.getMessages(req.params.id, req.user.id);
  res.json({ success: true, data: msgs });
});

export const sendMessage = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const msg = await claimService.sendMessage(req.params.id, req.user.id, req.body.message);
  res.status(201).json({ success: true, data: msg });
});