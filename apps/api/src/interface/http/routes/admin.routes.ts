import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { AppError } from '../../../domain/errors/AppError.js';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

// ============ STATS ============
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      totalItems,
      openItems,
      resolvedItems,
      totalClaims,
      pendingClaims,
      totalMatches,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.item.count({ where: { deletedAt: null } }),
      prisma.item.count({ where: { status: 'OPEN', deletedAt: null } }),
      prisma.item.count({ where: { status: 'RESOLVED', deletedAt: null } }),
      prisma.claim.count(),
      prisma.claim.count({ where: { status: 'PENDING' } }),
      prisma.match.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalItems,
        openItems,
        resolvedItems,
        totalClaims,
        pendingClaims,
        totalMatches,
        pendingReports,
      },
    });
  })
);

// ============ ANALYTICS ============
router.get(
  '/analytics/daily',
  asyncHandler(async (_req, res) => {
    const days = 30;
    const result: { date: string; items: number; users: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const [items, users] = await Promise.all([
        prisma.item.count({ where: { createdAt: { gte: d, lt: next } } }),
        prisma.user.count({ where: { createdAt: { gte: d, lt: next } } }),
      ]);

      result.push({
        date: d.toISOString().slice(0, 10),
        items,
        users,
      });
    }
    res.json({ success: true, data: result });
  })
);

router.get(
  '/analytics/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
    });
    const data = categories.map((c) => ({
      name: c.name,
      count: c._count.items,
    }));
    res.json({ success: true, data });
  })
);

// ============ USERS ============
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string) || '';
    const role = req.query.role as string | undefined;
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [{ email: { contains: q } }, { name: { contains: q } }],
            }
          : {}),
        ...(role ? { role: role as any } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        department: true,
        year: true,
        isEmailVerified: true,
        isVerified: true,
        isBanned: true,
        reputationScore: true,
        createdAt: true,
        _count: { select: { items: true, claims: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ success: true, data: users });
  })
);

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        department: true,
        year: true,
        phone: true,
        isEmailVerified: true,
        isVerified: true,
        isBanned: true,
        banReason: true,
        reputationScore: true,
        createdAt: true,
        _count: { select: { items: true, claims: true, ownedClaims: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  })
);

router.patch(
  '/users/:id/ban',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { isBanned: req.body.ban, banReason: req.body.reason },
    });
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: req.body.ban ? 'admin.user.ban' : 'admin.user.unban',
        targetType: 'user',
        targetId: id,
        metadata: { reason: req.body.reason },
      },
    });
    res.json({ success: true, data: user });
  })
);

router.patch(
  '/users/:id/verify',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.user.verify',
        targetType: 'user',
        targetId: id,
      },
    });
    res.json({ success: true, data: user });
  })
);

router.patch(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { role: req.body.role },
    });
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.user.roleChange',
        targetType: 'user',
        targetId: id,
        metadata: { role: req.body.role },
      },
    });
    res.json({ success: true, data: user });
  })
);

// ============ ITEMS MODERATION ============
router.get(
  '/items',
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string) || '';
    const items = await prisma.item.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: true,
        _count: { select: { claims: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ success: true, data: items });
  })
);

// HARD DELETE — permanent
router.delete(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);

    // Get item details first
    const item = await prisma.item.findUnique({
      where: { id },
      include: { _count: { select: { claims: true } } },
    });
    if (!item) throw new AppError('Item not found', 404);

    // Check claims
    const claimCount = await prisma.claim.count({ where: { itemId: id } });
    if (claimCount > 0) {
      throw new AppError(
        `Cannot delete — ${claimCount} claim(s) exist on this item. Reject them first or disable the item.`,
        409
      );
    }

    // Hard delete (cascade deletes images, matches via schema)
    await prisma.item.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.item.delete',
        targetType: 'item',
        targetId: id,
        metadata: {
          title: item.title,
          type: item.type,
        },
      },
    });

    res.json({ success: true });
  })
);

// ============ CLAIMS ============
router.get(
  '/claims',
  asyncHandler(async (_req, res) => {
    const claims = await prisma.claim.findMany({
      include: {
        item: { select: { id: true, title: true } },
        claimant: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ success: true, data: claims });
  })
);

router.patch(
  '/claims/:id/status',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const claim = await prisma.claim.update({
      where: { id },
      data: { status: req.body.status },
    });
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.claim.statusChange',
        targetType: 'claim',
        targetId: id,
        metadata: { status: req.body.status },
      },
    });
    res.json({ success: true, data: claim });
  })
);

// ============ REPORTS ============
router.get(
  '/reports',
  asyncHandler(async (_req, res) => {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reports });
  })
);

router.patch(
  '/reports/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const report = await prisma.report.update({
      where: { id },
      data: {
        status: req.body.status,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
      },
    });
    res.json({ success: true, data: report });
  })
);

// ============ AUDIT LOGS ============
router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string) || '';
    const logs = await prisma.auditLog.findMany({
      where: q ? { action: { contains: q } } : {},
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ success: true, data: logs });
  })
);

// ============ CATEGORIES ============
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const cats = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    res.json({ success: true, data: cats });
  })
);

router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const { name, slug, icon } = req.body;

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      throw new AppError(
        existing.name === name
          ? `Category "${name}" already exists`
          : `Slug "${slug}" already in use`,
        409
      );
    }

    const cat = await prisma.category.create({
      data: { name, slug, icon: icon || null },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.category.create',
        targetType: 'category',
        targetId: cat.id,
      },
    });

    res.status(201).json({ success: true, data: cat });
  })
);

router.patch(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const cat = await prisma.category.update({
      where: { id },
      data: req.body,
    });
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.category.update',
        targetType: 'category',
        targetId: id,
        metadata: req.body,
      },
    });
    res.json({ success: true, data: cat });
  })
);

router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);

    const itemCount = await prisma.item.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (itemCount > 0) {
      throw new AppError(
        `Cannot delete — ${itemCount} item(s) use this category. Disable it instead.`,
        409
      );
    }

    await prisma.category.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.category.delete',
        targetType: 'category',
        targetId: id,
      },
    });

    res.json({ success: true });
  })
);

// ============ LOCATIONS ============
router.get(
  '/locations',
  asyncHandler(async (_req, res) => {
    const locs = await prisma.handoverLocation.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: locs });
  })
);

// Test email endpoint
router.post(
  '/test-email',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email required', 400);

    const { sendEmail } = await import('../../../infrastructure/email/email.service.js');

    const result = await sendEmail({
      to: email,
      subject: '🎉 Test Email — UIU Lost & Found',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:linear-gradient(135deg,#F26522,#D9541A);color:white;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:24px;">Email Setup Working! ✅</h1>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e5e4e7;">
            <p style="color:#1A2332;font-size:16px;">Hi there,</p>
            <p style="color:#4a5568;line-height:1.6;">
              This is a test email from <strong>UIU Lost &amp; Found</strong>.
              If you received this, your email setup is working correctly.
            </p>
            <p style="color:#9ca3af;font-size:13px;margin-top:32px;">— UIU Lost &amp; Found Team</p>
          </div>
        </div>
      `,
    });

    res.json({ success: result.success, data: result });
  })
);

router.patch(
  '/locations/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const loc = await prisma.handoverLocation.update({
      where: { id },
      data: req.body,
    });
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.location.update',
        targetType: 'location',
        targetId: id,
        metadata: req.body,
      },
    });
    res.json({ success: true, data: loc });
  })
);

router.delete(
  '/locations/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);

    const handoverCount = await prisma.handover.count({
      where: { locationId: id },
    });

    if (handoverCount > 0) {
      throw new AppError(
        `Cannot delete — ${handoverCount} handover(s) use this location. Disable it instead.`,
        409
      );
    }

    await prisma.handoverLocation.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.id,
        action: 'admin.location.delete',
        targetType: 'location',
        targetId: id,
      },
    });

    res.json({ success: true });
  })
);

export default router;