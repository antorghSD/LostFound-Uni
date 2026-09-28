import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError, ConflictError, UnauthorizedError } from '../../domain/errors/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

const BCRYPT_COST = 12;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  department?: string;
  year?: number;
  ip?: string;
  userAgent?: string;
}

interface LoginInput {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        studentId: input.studentId,
        department: input.department,
        year: input.year,
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, input.ip, input.userAgent);

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'auth.register',
        targetType: 'user',
        targetId: user.id,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });

    return {
      user: this.publicUser(user),
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (user.isBanned) throw new UnauthorizedError('Account banned');
    if (user.deletedAt) throw new UnauthorizedError('Account deleted');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email, user.role, input.ip, input.userAgent);

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'auth.login',
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });

    return { user: this.publicUser(user), ...tokens };
  }

  async refresh(refreshToken: string, ip?: string, userAgent?: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: { userId: payload.sub, refreshTokenHash: tokenHash },
    });
    if (!session) throw new UnauthorizedError('Session not found');
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Session expired');
    }

    // Rotate: delete old, issue new
    await prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.issueTokens(payload.sub, payload.email, payload.role, ip, userAgent);

    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await prisma.session.deleteMany({ where: { refreshTokenHash: tokenHash } });
  }

  // ---------- helpers ----------

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    ip?: string,
    userAgent?: string
  ) {
    const accessToken = signAccessToken({ sub: userId, email, role });
    const refreshToken = signRefreshToken({ sub: userId, email, role });

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        userId,
        refreshTokenHash: tokenHash,
        ip,
        userAgent,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private publicUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
    reputationScore: number;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      reputationScore: user.reputationScore,
    };
  }
}

export const authService = new AuthService();